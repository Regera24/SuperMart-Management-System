package mss.smms.staff.service;

import mss.smms.staff.dto.request.*;
import mss.smms.staff.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HrService {

    // Attendance
    AttendanceLogResponse checkIn(CheckInRequest request);
    AttendanceLogResponse checkOut(Long employeeId);
    Page<AttendanceLogResponse> getAttendance(Long employeeId, String from, String to, Pageable pageable);

    // Leave
    LeaveRequestResponse submitLeave(LeaveRequestCreateRequest request);
    LeaveRequestResponse approveLeave(Long id);
    LeaveRequestResponse rejectLeave(Long id);
    Page<LeaveRequestResponse> getLeaves(Long employeeId, String status, Pageable pageable);

    // Payroll
    PayrollResponse generatePayroll(GeneratePayrollRequest request);
    PayrollResponse markPaid(Long id);
    Page<PayrollResponse> getPayrolls(Long employeeId, Integer month, Integer year, Pageable pageable);

    // Shift
    ShiftResponse createShift(ShiftCreateRequest request);
    List<ShiftResponse> getAllShifts();
    ShiftScheduleResponse assignShift(AssignShiftRequest request);
    Page<ShiftScheduleResponse> getSchedules(Long employeeId, Pageable pageable);
}
