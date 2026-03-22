package mss.smms.inventory.saga;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.inventory.entity.InventoryTransaction;
import mss.smms.inventory.entity.OutboxEvent;
import mss.smms.inventory.entity.ProductStock;
import mss.smms.inventory.entity.Warehouse;
import mss.smms.inventory.enums.TransactionType;
import mss.smms.inventory.repository.InventoryTransactionRepository;
import mss.smms.inventory.repository.OutboxEventRepository;
import mss.smms.inventory.repository.ProductStockRepository;
import mss.smms.inventory.repository.WarehouseRepository;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Listens to order commands from Kafka and processes them:
 * - ReserveStockCommand: deducts stock for all items, writes success/failure reply to outbox
 * - ReleaseStockCommand: restores stock for all items (compensation), writes reply to outbox
 *
 * <p>Both stock operations and reply events are written in the SAME transaction
 * using the Outbox pattern for reliable messaging.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryCommandListener {

    private final ProductStockRepository productStockRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final WarehouseRepository warehouseRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.commands", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleCommand(ConsumerRecord<String, String> record) {
        try {
            JsonNode root = objectMapper.readTree(record.value());
            String eventType = root.get("eventType").asText();
            JsonNode payload = root.get("payload");

            log.info("Received command: type={}, key={}", eventType, record.key());

            switch (eventType) {
                case "ReserveStockCommand" -> handleReserveStock(payload);
                case "ReleaseStockCommand" -> handleReleaseStock(payload);
                default -> log.warn("Unknown command type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing command: {}", e.getMessage(), e);
        }
    }

    private void handleReserveStock(JsonNode payload) {
        UUID sagaId = UUID.fromString(payload.get("sagaId").asText());
        UUID orderId = UUID.fromString(payload.get("orderId").asText());
        long warehouseId = payload.get("warehouseId").asLong();
        JsonNode items = payload.get("items");

        try {
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new RuntimeException("Warehouse not found: " + warehouseId));

            // Deduct stock for ALL items atomically
            for (JsonNode item : items) {
                String sku = item.get("productSku").asText();
                int qty = item.get("quantity").asInt();

                ProductStock stock = productStockRepository
                        .findByWarehouseIdAndProductSku(warehouseId, sku)
                        .orElseThrow(() -> new RuntimeException("Stock not found: " + sku));

                int newQty = stock.getQuantityOnHand() - qty;
                if (newQty < 0) {
                    throw new RuntimeException("Insufficient stock for SKU " + sku
                            + " (available: " + stock.getQuantityOnHand() + ", requested: " + qty + ")");
                }

                stock.setQuantityOnHand(newQty);
                productStockRepository.save(stock);

                transactionRepository.save(InventoryTransaction.builder()
                        .warehouse(warehouse)
                        .productSku(sku)
                        .quantityChange(-qty)
                        .type(TransactionType.SALE)
                        .referenceId(orderId.toString())
                        .build());
            }

            // Write success reply to outbox (same transaction!)
            writeOutboxReply(orderId, sagaId, "StockReservedReply",
                    Map.of("sagaId", sagaId.toString(), "orderId", orderId.toString()));

            log.info("Stock reserved for order {}, saga {}", orderId, sagaId);

        } catch (Exception e) {
            log.error("Stock reservation failed for order {}: {}", orderId, e.getMessage());

            // Write failure reply to outbox (same transaction!)
            writeOutboxReply(orderId, sagaId, "StockReserveFailedReply",
                    Map.of("sagaId", sagaId.toString(),
                            "orderId", orderId.toString(),
                            "reason", e.getMessage()));
        }
    }

    private void handleReleaseStock(JsonNode payload) {
        UUID sagaId = UUID.fromString(payload.get("sagaId").asText());
        UUID orderId = UUID.fromString(payload.get("orderId").asText());
        long warehouseId = payload.get("warehouseId").asLong();
        JsonNode items = payload.get("items");

        try {
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new RuntimeException("Warehouse not found: " + warehouseId));

            // Restore stock for ALL items
            for (JsonNode item : items) {
                String sku = item.get("productSku").asText();
                int qty = item.get("quantity").asInt();

                ProductStock stock = productStockRepository
                        .findByWarehouseIdAndProductSku(warehouseId, sku)
                        .orElseThrow(() -> new RuntimeException("Stock not found: " + sku));

                stock.setQuantityOnHand(stock.getQuantityOnHand() + qty);
                productStockRepository.save(stock);

                transactionRepository.save(InventoryTransaction.builder()
                        .warehouse(warehouse)
                        .productSku(sku)
                        .quantityChange(qty)
                        .type(TransactionType.RETURN)
                        .referenceId(orderId.toString())
                        .build());
            }

            // Write success reply to outbox
            writeOutboxReply(orderId, sagaId, "StockReleasedReply",
                    Map.of("sagaId", sagaId.toString(), "orderId", orderId.toString()));

            log.info("Stock released for order {}, saga {}", orderId, sagaId);

        } catch (Exception e) {
            log.error("Stock release failed for order {}: {}", orderId, e.getMessage());
        }
    }

    private void writeOutboxReply(UUID orderId, UUID sagaId, String eventType, Map<String, String> replyData) {
        try {
            Map<String, Object> envelope = Map.of(
                    "eventType", eventType,
                    "payload", replyData
            );

            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType("Inventory")
                    .aggregateId(orderId.toString())
                    .eventType(eventType)
                    .topic("inventory.replies")
                    .payload(objectMapper.writeValueAsString(envelope))
                    .sagaId(sagaId)
                    .build();

            outboxEventRepository.save(event);
            log.debug("Outbox reply written: type={}, orderId={}", eventType, orderId);
        } catch (Exception e) {
            log.error("Failed to write outbox reply: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to serialize outbox reply", e);
        }
    }
}
