package mss.smms.notification.service;

import mss.smms.notification.dto.request.SendNotificationRequest;
import mss.smms.notification.dto.response.NotificationResponse;
import mss.smms.notification.entity.Notification;
import mss.smms.notification.enums.NotificationStatus;
import mss.smms.notification.enums.NotificationType;
import mss.smms.notification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    NotificationRepository notificationRepository;
    @Mock
    EmailSenderService emailSenderService;

    @InjectMocks
    NotificationServiceImpl service;

    @Test
    void sendEmailUsesInternalAddressForNonEmailRecipientAndMarksSent() {
        SendNotificationRequest request = emailRequest("account-1");
        when(emailSenderService.buildOrderConfirmationEmail("ORD-1", "150000", "COMPLETED"))
                .thenReturn("<html>ok</html>");
        when(notificationRepository.save(org.mockito.ArgumentMatchers.any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse response = service.send(request);

        verify(emailSenderService).sendHtml(eq("account-1@supermart.internal"),
                contains("ORD-1"), eq("<html>ok</html>"));
        assertThat(response.getStatus()).isEqualTo(NotificationStatus.SENT);
        assertThat(response.getSentAt()).isNotNull();
    }

    @Test
    void sendEmailPersistsFailedStatusWhenEmailSenderThrows() {
        SendNotificationRequest request = emailRequest("buyer@example.com");
        when(emailSenderService.buildOrderConfirmationEmail("ORD-1", "150000", "COMPLETED"))
                .thenReturn("<html>ok</html>");
        doThrow(new IllegalStateException("smtp down"))
                .when(emailSenderService).sendHtml(eq("buyer@example.com"), contains("ORD-1"), eq("<html>ok</html>"));
        when(notificationRepository.save(org.mockito.ArgumentMatchers.any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.send(request);

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        Notification saved = notificationCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo(NotificationStatus.FAILED);
        assertThat(saved.getRetryCount()).isEqualTo(1);
        assertThat(saved.getErrorMessage()).isEqualTo("smtp down");
    }

    private SendNotificationRequest emailRequest(String recipientId) {
        SendNotificationRequest request = new SendNotificationRequest();
        request.setRecipientId(recipientId);
        request.setType(NotificationType.EMAIL);
        request.setContent(Map.of(
                "orderCode", "ORD-1",
                "finalAmount", "150000",
                "status", "COMPLETED"
        ));
        return request;
    }
}
