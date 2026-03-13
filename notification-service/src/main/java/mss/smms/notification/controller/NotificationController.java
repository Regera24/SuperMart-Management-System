package mss.smms.notification.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.notification.dto.request.SendNotificationRequest;
import mss.smms.notification.dto.response.ApiResponse;
import mss.smms.notification.dto.response.NotificationResponse;
import mss.smms.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<NotificationResponse>> send(
            @RequestBody SendNotificationRequest request) {
        return ResponseEntity.ok(ApiResponse.<NotificationResponse>builder()
                .code(200).message("Notification sent")
                .data(notificationService.send(request)).build());
    }

    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getByRecipient(
            @PathVariable String recipientId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<NotificationResponse>>builder()
                .code(200).message("Success")
                .data(notificationService.getByRecipient(recipientId, pageable)).build());
    }
}
