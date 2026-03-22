package mss.smms.staff.dto.request;

import lombok.Data;

@Data
public class AssignShiftRequest {
    private Long employeeId;
    private Integer shiftId;
    private String workDate; // yyyy-MM-dd
}
