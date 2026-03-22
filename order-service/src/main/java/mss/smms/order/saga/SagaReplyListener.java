package mss.smms.order.saga;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.order.entity.Order;
import mss.smms.order.entity.Payment;
import mss.smms.order.enums.OrderStatus;
import mss.smms.order.repository.OrderRepository;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Listens to inventory reply events and advances the saga state machine.
 *
 * <p>Handles:
 * <ul>
 *   <li>{@code StockReservedReply} — stock successfully reserved → complete order</li>
 *   <li>{@code StockReserveFailedReply} — reservation failed → reject order</li>
 *   <li>{@code StockReleasedReply} — stock released (compensation) → finalize cancellation</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SagaReplyListener {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final String ORDER_EVENTS_TOPIC = "order.events";

    @KafkaListener(topics = "inventory.replies", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleReply(ConsumerRecord<String, String> record) {
        try {
            JsonNode root = objectMapper.readTree(record.value());
            String eventType = root.get("eventType").asText();
            JsonNode payload = root.get("payload");

            log.info("Received saga reply: type={}, key={}", eventType, record.key());

            switch (eventType) {
                case "StockReservedReply" -> handleStockReserved(payload);
                case "StockReserveFailedReply" -> handleStockReserveFailed(payload);
                case "StockReleasedReply" -> handleStockReleased(payload);
                default -> log.warn("Unknown reply event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing saga reply: {}", e.getMessage(), e);
        }
    }

    private void handleStockReserved(JsonNode payload) {
        UUID orderId = UUID.fromString(payload.get("orderId").asText());

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Order not found for StockReservedReply: {}", orderId);
            return;
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.STOCK_RESERVING) {
            log.warn("Order {} in unexpected state {} for StockReservedReply", orderId, order.getStatus());
            return;
        }

        // Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(order.getPayments() != null && !order.getPayments().isEmpty()
                        ? order.getPayments().get(0).getPaymentMethod() : null)
                .amount(order.getFinalAmount())
                .transactionCode("TXN-" + UUID.randomUUID())
                .createdAt(LocalDateTime.now())
                .build();

        if (order.getPayments() == null) {
            order.setPayments(new ArrayList<>());
        }
        // Only add payment if no existing payments (avoid duplicates on retry)
        if (order.getPayments().isEmpty()) {
            order.getPayments().add(payment);
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        // Publish OrderCompleted event to 'order.events' for Notification Service
        publishOrderEvent(order, "OrderCompleted");

        log.info("Order {} completed successfully via saga", orderId);
    }

    private void handleStockReserveFailed(JsonNode payload) {
        UUID orderId = UUID.fromString(payload.get("orderId").asText());
        String reason = payload.has("reason") ? payload.get("reason").asText() : "Unknown";

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Order not found for StockReserveFailedReply: {}", orderId);
            return;
        }

        order.setStatus(OrderStatus.STOCK_RESERVE_FAILED);
        orderRepository.save(order);

        log.warn("Order {} stock reservation failed: {}", orderId, reason);
    }

    private void handleStockReleased(JsonNode payload) {
        UUID orderId = UUID.fromString(payload.get("orderId").asText());

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Order not found for StockReleasedReply: {}", orderId);
            return;
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Publish OrderCancelled event to 'order.events' for Notification Service
        publishOrderEvent(order, "OrderCancelled");

        log.info("Order {} cancelled and stock released via saga", orderId);
    }

    /**
     * Publishes an order lifecycle event to the 'order.events' Kafka topic.
     * Notification Service consumes this to send emails/SMS.
     */
    private void publishOrderEvent(Order order, String eventType) {
        try {
            Map<String, Object> payload = Map.of(
                    "orderId", order.getId().toString(),
                    "orderCode", order.getOrderCode() != null ? order.getOrderCode() : "",
                    "cashierId", order.getCashierId() != null ? order.getCashierId().toString() : "",
                    "customerId", order.getCustomerId() != null ? order.getCustomerId().toString() : "",
                    "finalAmount", order.getFinalAmount() != null ? order.getFinalAmount().toString() : "0",
                    "status", order.getStatus().name()
            );

            Map<String, Object> envelope = Map.of(
                    "eventType", eventType,
                    "payload", payload
            );

            String json = objectMapper.writeValueAsString(envelope);
            kafkaTemplate.send(ORDER_EVENTS_TOPIC, order.getId().toString(), json);
            log.info("Published {} event for order {}", eventType, order.getOrderCode());
        } catch (Exception e) {
            // Non-critical: notification failure should not rollback order transaction
            log.error("Failed to publish {} event for order {}: {}", eventType, order.getId(), e.getMessage());
        }
    }
}
