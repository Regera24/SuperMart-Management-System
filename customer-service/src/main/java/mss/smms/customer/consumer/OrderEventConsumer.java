package mss.smms.customer.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.customer.entity.Customer;
import mss.smms.customer.entity.LoyaltyRule;
import mss.smms.customer.entity.PointTransaction;
import mss.smms.customer.entity.TierConfig;
import mss.smms.customer.enums.PointTxnType;
import mss.smms.customer.enums.TierLevel;
import mss.smms.customer.repository.CustomerRepository;
import mss.smms.customer.repository.LoyaltyRuleRepository;
import mss.smms.customer.repository.PointTransactionRepository;
import mss.smms.customer.repository.TierConfigRepository;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Consumes order events from Kafka to automatically:
 * - Award loyalty points when an order is COMPLETED
 * - Update totalSpent and tier level
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final CustomerRepository customerRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final LoyaltyRuleRepository loyaltyRuleRepository;
    private final TierConfigRepository tierConfigRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.events", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleOrderEvent(ConsumerRecord<String, String> record) {
        try {
            JsonNode root = objectMapper.readTree(record.value());
            String eventType = root.get("eventType").asText();

            if (!"OrderCompleted".equals(eventType)) {
                log.debug("Ignoring event type: {}", eventType);
                return;
            }

            JsonNode payload = root.get("payload");
            String customerId = payload.has("customerId") ? payload.get("customerId").asText() : null;
            String orderId = payload.has("orderId") ? payload.get("orderId").asText() : null;
            String orderCode = payload.has("orderCode") ? payload.get("orderCode").asText() : "";
            String finalAmountStr = payload.has("finalAmount") ? payload.get("finalAmount").asText() : "0";
            BigDecimal finalAmount = new BigDecimal(finalAmountStr);

            if (customerId == null || customerId.isBlank() || "null".equals(customerId)) {
                log.debug("No customerId in OrderCompleted event for order {}, skipping points", orderId);
                return;
            }

            // Try to find customer by ID (stored as Long)
            Long custId;
            try {
                custId = Long.parseLong(customerId);
            } catch (NumberFormatException e) {
                log.warn("Invalid customerId format: {}", customerId);
                return;
            }

            Customer customer = customerRepository.findById(custId).orElse(null);
            if (customer == null) {
                log.warn("Customer not found for ID {}, skipping points for order {}", custId, orderId);
                return;
            }

            // Find active loyalty rule with highest priority
            List<LoyaltyRule> rules = loyaltyRuleRepository.findByIsActiveTrueOrderByPriorityDesc();
            LoyaltyRule applicableRule = null;
            for (LoyaltyRule rule : rules) {
                // Check if rule is within date range
                LocalDateTime now = LocalDateTime.now();
                if (rule.getStartDate() != null && now.isBefore(rule.getStartDate())) continue;
                if (rule.getEndDate() != null && now.isAfter(rule.getEndDate())) continue;
                // Check min order value
                if (rule.getMinOrderValue() != null && finalAmount.compareTo(rule.getMinOrderValue()) < 0) continue;
                applicableRule = rule;
                break;
            }

            int pointsEarned = 0;
            if (applicableRule != null && applicableRule.getPointConversionRate() != null) {
                // points = finalAmount * conversionRate (e.g., 0.01 means 1 point per 100 VND)
                pointsEarned = finalAmount.multiply(applicableRule.getPointConversionRate())
                        .setScale(0, RoundingMode.DOWN)
                        .intValue();
            }

            if (pointsEarned > 0) {
                // Award points
                customer.setCurrentPoints(customer.getCurrentPoints() + pointsEarned);

                // Record transaction
                pointTransactionRepository.save(PointTransaction.builder()
                        .customer(customer)
                        .pointsAmount(pointsEarned)
                        .type(PointTxnType.EARN)
                        .orderId(orderId)
                        .description("Tích điểm đơn " + orderCode + " (" + finalAmount + " VND)")
                        .build());
            }

            // Update total spent
            BigDecimal currentTotalSpent = customer.getTotalSpent() != null
                    ? customer.getTotalSpent() : BigDecimal.ZERO;
            customer.setTotalSpent(currentTotalSpent.add(finalAmount));

            // Update tier level dynamically from TierConfig
            int totalPoints = customer.getCurrentPoints();
            List<TierConfig> configs = tierConfigRepository.findByIsActiveTrueOrderByMinPointsAsc();
            TierLevel resolved = TierLevel.REGULAR;
            for (TierConfig cfg : configs) {
                if (totalPoints >= cfg.getMinPoints()) {
                    resolved = cfg.getTierLevel();
                }
            }
            customer.setTierLevel(resolved);

            customerRepository.save(customer);

            log.info("OrderCompleted: customer {} earned {} points, totalSpent={}, tier={}",
                    custId, pointsEarned, customer.getTotalSpent(), customer.getTierLevel());

        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage(), e);
        }
    }
}
