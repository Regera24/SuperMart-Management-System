package mss.smms.report.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenerateReportRequest {
    String type;        // PAYROLL, ATTENDANCE, INVENTORY, etc.
    String title;
    String parameters;  // JSON string for flexible parameters
    LocalDate periodFrom;
    LocalDate periodTo;
    Long requestedBy;
}
