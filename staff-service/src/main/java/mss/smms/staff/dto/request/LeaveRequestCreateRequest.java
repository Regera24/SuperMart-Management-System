package mss.smms.staff.dto.request;

import lombok.Data;

@Data
public class LeaveRequestCreateRequest {
    private Long employeeId;
    private String startDate;   // ISO date-time string
    private String endDate;     // ISO date-time string
    private String reason;
}
