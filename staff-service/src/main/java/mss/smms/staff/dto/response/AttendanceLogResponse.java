package mss.smms.staff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLogResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long shiftScheduleId;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Float totalHours;
}
