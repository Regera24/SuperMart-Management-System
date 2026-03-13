package mss.smms.notification.repository;

import mss.smms.notification.entity.Notification;
import mss.smms.notification.enums.NotificationStatus;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, ObjectId> {
    Page<Notification> findByRecipientId(String recipientId, Pageable pageable);
    List<Notification> findByStatus(NotificationStatus status);
}
