package mss.smms.notification.entity;

import lombok.*;
import mss.smms.notification.enums.NotificationStatus;
import mss.smms.notification.enums.NotificationType;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    private ObjectId id;

    @Indexed
    private String recipientId;

    private NotificationType type;

    private Map<String, Object> content;

    @Indexed
    private NotificationStatus status;

    private Integer retryCount;

    private String errorMessage;

    private LocalDateTime createdAt;

    private LocalDateTime sentAt;

}
