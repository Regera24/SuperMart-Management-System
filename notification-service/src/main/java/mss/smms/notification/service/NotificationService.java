package mss.smms.notification.service;

import mss.smms.notification.dto.request.SendNotificationRequest;
import mss.smms.notification.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    NotificationResponse send(SendNotificationRequest request);
    Page<NotificationResponse> getByRecipient(String recipientId, Pageable pageable);
}
