package mss.smms.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends HTML emails via JavaMailSender.
 * Falls back to logging if mail is not configured (MAIL_PASSWORD not set).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSenderService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@supermart.vn}")
    private String from;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    /**
     * Sends an HTML email. If mail password is not configured, just logs the email.
     */
    public void sendHtml(String to, String subject, String htmlBody) {
        if (mailPassword == null || mailPassword.isBlank()) {
            log.info("[DEV MODE] Email NOT sent (no MAIL_PASSWORD). Would send to={}, subject={}", to, subject);
            log.debug("[DEV MODE] Body: {}", htmlBody);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }

    /**
     * Builds an order confirmation email body.
     */
    public String buildOrderConfirmationEmail(String orderCode, String amount, String status) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
                  <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px;">
                    <h2 style="color: #10b981;">🛒 SuperMart — Xác Nhận Đơn Hàng</h2>
                    <p>Đơn hàng của bạn đã được xử lý thành công!</p>
                    <table style="width:100%%; border-collapse: collapse; margin-top: 20px;">
                      <tr style="background:#f0fdf4;">
                        <td style="padding: 10px; font-weight: bold;">Mã đơn hàng</td>
                        <td style="padding: 10px;">%s</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: bold;">Tổng tiền</td>
                        <td style="padding: 10px;">%s</td>
                      </tr>
                      <tr style="background:#f0fdf4;">
                        <td style="padding: 10px; font-weight: bold;">Trạng thái</td>
                        <td style="padding: 10px; color: #10b981; font-weight: bold;">%s</td>
                      </tr>
                    </table>
                    <p style="margin-top: 20px; color: #6b7280;">Cảm ơn bạn đã mua sắm tại SuperMart!</p>
                  </div>
                </body>
                </html>
                """.formatted(orderCode, amount, status);
    }
}
