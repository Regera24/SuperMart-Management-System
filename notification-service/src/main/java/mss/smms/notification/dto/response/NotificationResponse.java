package mss.smms.notification.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import mss.smms.notification.enums.NotificationStatus;
import mss.smms.notification.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String recipientId;
    NotificationType type;
    Map<String, Object> content;
    NotificationStatus status;
    String errorMessage;
    LocalDateTime createdAt;
    LocalDateTime sentAt;
}
