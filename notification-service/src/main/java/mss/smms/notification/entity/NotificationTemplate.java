package mss.smms.notification.entity;

import lombok.*;
import mss.smms.notification.enums.NotificationChannel;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate {
    @Id
    private ObjectId id;

    @Indexed(unique = true)
    private String code;

    private String title;

    private String bodyTemplate;

    private NotificationChannel channel;

    private Boolean isActive;

}
