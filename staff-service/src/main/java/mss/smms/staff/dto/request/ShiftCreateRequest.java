package mss.smms.staff.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class ShiftCreateRequest {
    private String shiftName;
    private String startTime;   // HH:mm
    private String endTime;     // HH:mm
    private BigDecimal coefficient; // hệ số lương (1.0, 1.5, 2.0...)
}
