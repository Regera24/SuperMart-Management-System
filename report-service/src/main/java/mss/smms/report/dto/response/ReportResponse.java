package mss.smms.report.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {
    Long id;
    String type;
    String title;
    String parameters;
    String resultUrl;
    String status;
    LocalDate periodFrom;
    LocalDate periodTo;
    String requestedBy;
    LocalDateTime requestedAt;
    LocalDateTime completedAt;
}
