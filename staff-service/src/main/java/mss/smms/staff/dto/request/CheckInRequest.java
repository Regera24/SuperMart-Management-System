package mss.smms.staff.dto.request;

import lombok.Data;

@Data
public class CheckInRequest {
    private Long employeeId;
    private Long shiftScheduleId; // optional
}
