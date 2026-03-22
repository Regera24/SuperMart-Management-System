package mss.smms.staff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftResponse {
    private Integer id;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal coefficient;
}
