package mss.smms.report.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(length = 100, nullable = false)
    String type;  // e.g., PAYROLL, ATTENDANCE, INVENTORY

    @Column(length = 255)
    String title;

    @Column(columnDefinition = "TEXT")
    String parameters;  // JSON string of report parameters

    @Column(columnDefinition = "TEXT")
    String resultUrl;  // URL or path to generated file

    @Column(length = 50)
    String status;  // PENDING, COMPLETED, FAILED

    @Column
    LocalDate periodFrom;

    @Column
    LocalDate periodTo;

    @Column(nullable = false)
    String requestedBy;  // accountId of requester

    @Column
    LocalDateTime requestedAt;

    @Column
    LocalDateTime completedAt;
}
