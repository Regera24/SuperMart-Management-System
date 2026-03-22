package mss.smms.staff.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GeneratePayrollRequest {
    private Long employeeId;
    private Integer month;
    private Integer year;
    private BigDecimal bonus;       // optional bonus
    private BigDecimal deduction;   // optional deduction
}
