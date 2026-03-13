package mss.smms.notification.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import mss.smms.notification.enums.NotificationType;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendNotificationRequest {
    String recipientId;
    NotificationType type;
    Map<String, Object> content;
}
