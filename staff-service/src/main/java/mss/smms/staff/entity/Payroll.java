package mss.smms.staff.entity;

import jakarta.persistence.*;
import lombok.*;
import mss.smms.staff.enums.PayrollStatus;

import java.math.BigDecimal;

@Entity
@Table(name = "payrolls", indexes = {
        @Index(columnList = "employee_id, month, year", name = "idx_payroll_employee_month_year")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "month")
    private Integer month;

    @Column(name = "year")
    private Integer year;

    @Column(name = "total_work_hours")
    private Float totalWorkHours;

    @Column(name = "standard_salary", precision = 15, scale = 2)
    private BigDecimal standardSalary;

    @Column(name = "bonus", precision = 15, scale = 2)
    private BigDecimal bonus;

    @Column(name = "deduction", precision = 15, scale = 2)
    private BigDecimal deduction;

    @Column(name = "final_salary", precision = 15, scale = 2)
    private BigDecimal finalSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private PayrollStatus status;
}
