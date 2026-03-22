package mss.smms.inventory.saga;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.inventory.entity.OutboxEvent;
import mss.smms.inventory.repository.OutboxEventRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Polls the outbox_events table for PENDING reply events and publishes them to Kafka.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxPollerService {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 1000)
    @Transactional
    public void pollAndPublish() {
        List<OutboxEvent> pendingEvents =
                outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc("PENDING");

        for (OutboxEvent event : pendingEvents) {
            try {
                kafkaTemplate.send(
                        event.getTopic(),
                        event.getAggregateId(),
                        event.getPayload()
                ).whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish outbox event {}: {}", event.getId(), ex.getMessage());
                    }
                });

                outboxEventRepository.markAsPublished(event.getId());
                log.debug("Published outbox reply: type={}, id={}", event.getEventType(), event.getId());

            } catch (Exception e) {
                log.error("Error publishing outbox event {}: {}", event.getId(), e.getMessage());
                outboxEventRepository.markAsFailed(event.getId());
            }
        }
    }
}
