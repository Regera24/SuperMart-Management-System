package mss.smms.notification.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import mss.smms.notification.dto.request.SendNotificationRequest;
import mss.smms.notification.dto.response.NotificationResponse;
import mss.smms.notification.entity.Notification;
import mss.smms.notification.enums.NotificationStatus;
import mss.smms.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {

    NotificationRepository notificationRepository;

    @Override
    public NotificationResponse send(SendNotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientId(request.getRecipientId())
                .type(request.getType())
                .content(request.getContent())
                .status(NotificationStatus.PENDING)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        // Simulate dispatch (real impl would integrate email/SMS/push gateway)
        try {
            log.info("Dispatching notification [{}] to recipient {}", request.getType(), request.getRecipientId());
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } catch (Exception ex) {
            log.error("Failed to dispatch notification: {}", ex.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(ex.getMessage());
        }

        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    @Override
    public Page<NotificationResponse> getByRecipient(String recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientId(recipientId, pageable).map(this::toResponse);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId() != null ? n.getId().toHexString() : null)
                .recipientId(n.getRecipientId())
                .type(n.getType())
                .content(n.getContent())
                .status(n.getStatus())
                .errorMessage(n.getErrorMessage())
                .createdAt(n.getCreatedAt())
                .sentAt(n.getSentAt())
                .build();
    }
}
