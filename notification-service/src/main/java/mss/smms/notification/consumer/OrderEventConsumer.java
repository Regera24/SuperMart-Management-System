package mss.smms.notification.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.notification.dto.request.SendNotificationRequest;
import mss.smms.notification.enums.NotificationType;
import mss.smms.notification.service.NotificationService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Consumes order completion events from the 'order.events' Kafka topic
 * and triggers email notifications to customers/staff.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.events", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderEvent(ConsumerRecord<String, String> record) {
        try {
            JsonNode root = objectMapper.readTree(record.value());
            String eventType = root.get("eventType").asText();
            JsonNode payload = root.get("payload");

            log.info("Received order event: type={}, key={}", eventType, record.key());

            switch (eventType) {
                case "OrderCompleted" -> handleOrderCompleted(payload);
                case "OrderCancelled" -> handleOrderCancelled(payload);
                default -> log.warn("Unknown order event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing order event from Kafka: {}", e.getMessage(), e);
        }
    }

    private void handleOrderCompleted(JsonNode payload) {
        String orderId = payload.has("orderId") ? payload.get("orderId").asText() : "N/A";
        String orderCode = payload.has("orderCode") ? payload.get("orderCode").asText() : orderId;
        String finalAmount = payload.has("finalAmount") ? payload.get("finalAmount").asText() : "N/A";
        String recipientId = payload.has("cashierId") ? payload.get("cashierId").asText() : "system";

        log.info("Processing OrderCompleted notification for order={}", orderCode);

        Map<String, Object> content = Map.of(
                "orderCode", orderCode,
                "finalAmount", finalAmount,
                "status", "COMPLETED",
                "message", "Đơn hàng " + orderCode + " đã hoàn thành. Tổng tiền: " + finalAmount
        );

        SendNotificationRequest request = new SendNotificationRequest();
        request.setRecipientId(recipientId);
        request.setType(NotificationType.EMAIL);
        request.setContent(content);

        notificationService.send(request);
    }

    private void handleOrderCancelled(JsonNode payload) {
        String orderCode = payload.has("orderCode") ? payload.get("orderCode").asText() : "N/A";
        String recipientId = payload.has("cashierId") ? payload.get("cashierId").asText() : "system";

        log.info("Processing OrderCancelled notification for order={}", orderCode);

        Map<String, Object> content = Map.of(
                "orderCode", orderCode,
                "status", "CANCELLED",
                "message", "Đơn hàng " + orderCode + " đã bị hủy."
        );

        SendNotificationRequest request = new SendNotificationRequest();
        request.setRecipientId(recipientId);
        request.setType(NotificationType.EMAIL);
        request.setContent(content);

        notificationService.send(request);
    }
}
