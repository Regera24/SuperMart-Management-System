package mss.smms.notification.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import mss.smms.notification.dto.request.SendNotificationRequest;
import mss.smms.notification.dto.response.NotificationResponse;
import mss.smms.notification.entity.Notification;
import mss.smms.notification.enums.NotificationStatus;
import mss.smms.notification.enums.NotificationType;
import mss.smms.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {

    NotificationRepository notificationRepository;
    EmailSenderService emailSenderService;

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

        try {
            if (request.getType() == NotificationType.EMAIL) {
                dispatchEmail(request.getRecipientId(), request.getContent());
            } else {
                // SMS, PUSH_APP, ZALO — log for now, integrable later
                log.info("Notification type {} dispatched to recipient {} (logged only)",
                        request.getType(), request.getRecipientId());
            }

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            log.info("Notification [{}] queued for recipient {}", request.getType(), request.getRecipientId());

        } catch (Exception ex) {
            log.error("Failed to dispatch notification: {}", ex.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(ex.getMessage());
            notification.setRetryCount(1);
        }

        return toResponse(notificationRepository.save(notification));
    }

    private void dispatchEmail(String recipientId, Map<String, Object> content) {
        String orderCode = String.valueOf(content.getOrDefault("orderCode", "N/A"));
        String amount = String.valueOf(content.getOrDefault("finalAmount", "N/A"));
        String status = String.valueOf(content.getOrDefault("status", "N/A"));

        // Use recipientId as email address if it looks like one, otherwise use internal address
        String to = recipientId.contains("@") ? recipientId : recipientId + "@supermart.internal";
        String subject = "[SuperMart] Xác nhận đơn hàng " + orderCode;
        String body = emailSenderService.buildOrderConfirmationEmail(orderCode, amount, status);
        emailSenderService.sendHtml(to, subject, body);
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
