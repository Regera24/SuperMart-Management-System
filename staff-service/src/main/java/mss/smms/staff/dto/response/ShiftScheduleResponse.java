package mss.smms.staff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftScheduleResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer shiftId;
    private String shiftName;
    private LocalDate workDate;
}
