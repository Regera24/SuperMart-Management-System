package mss.smms.staff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.smms.staff.enums.PayrollStatus;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer month;
    private Integer year;
    private Float totalWorkHours;
    private BigDecimal standardSalary;
    private BigDecimal bonus;
    private BigDecimal deduction;
    private BigDecimal finalSalary;
    private PayrollStatus status;
}
