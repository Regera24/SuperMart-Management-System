package mss.smms.staff.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import mss.smms.staff.dto.request.*;
import mss.smms.staff.dto.response.*;
import mss.smms.staff.entity.*;
import mss.smms.staff.enums.LeaveStatus;
import mss.smms.staff.enums.PayrollStatus;
import mss.smms.staff.exception.AppException;
import mss.smms.staff.exception.ErrorCode;
import mss.smms.staff.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HrServiceImpl implements HrService {

    EmployeeRepository employeeRepository;
    AttendanceLogRepository attendanceLogRepository;
    LeaveRequestRepository leaveRequestRepository;
    PayrollRepository payrollRepository;
    ShiftRepository shiftRepository;
    ShiftScheduleRepository shiftScheduleRepository;

    // ─────────────────────────── ATTENDANCE ────────────────────────────────

    @Override
    @Transactional
    public AttendanceLogResponse checkIn(CheckInRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        // Ensure no open check-in
        attendanceLogRepository.findTopByEmployeeIdAndCheckOutTimeIsNullOrderByCheckInTimeDesc(request.getEmployeeId())
                .ifPresent(open -> { throw new AppException(ErrorCode.ALREADY_CHECKED_IN); });

        ShiftSchedule schedule = null;
        if (request.getShiftScheduleId() != null) {
            schedule = shiftScheduleRepository.findById(request.getShiftScheduleId()).orElse(null);
        }

        AttendanceLog log = AttendanceLog.builder()
                .employee(employee)
                .shiftSchedule(schedule)
                .checkInTime(LocalDateTime.now())
                .build();

        return toAttendanceResponse(attendanceLogRepository.save(log));
    }

    @Override
    @Transactional
    public AttendanceLogResponse checkOut(Long employeeId) {
        AttendanceLog openLog = attendanceLogRepository
                .findTopByEmployeeIdAndCheckOutTimeIsNullOrderByCheckInTimeDesc(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.NO_ACTIVE_CHECK_IN));

        LocalDateTime checkOut = LocalDateTime.now();
        openLog.setCheckOutTime(checkOut);

        // Calculate total hours worked
        float hours = Duration.between(openLog.getCheckInTime(), checkOut).toMinutes() / 60f;
        openLog.setTotalHours(Math.round(hours * 100f) / 100f);

        return toAttendanceResponse(attendanceLogRepository.save(openLog));
    }

    @Override
    public Page<AttendanceLogResponse> getAttendance(Long employeeId, String from, String to, Pageable pageable) {
        if (employeeId != null && from != null && to != null) {
            return attendanceLogRepository.findByEmployeeIdAndCheckInTimeBetween(
                    employeeId,
                    LocalDateTime.parse(from),
                    LocalDateTime.parse(to),
                    pageable
            ).map(this::toAttendanceResponse);
        }
        if (employeeId != null) {
            return attendanceLogRepository.findByEmployeeId(employeeId, pageable).map(this::toAttendanceResponse);
        }
        return attendanceLogRepository.findAll(pageable).map(this::toAttendanceResponse);
    }

    // ─────────────────────────── LEAVE ─────────────────────────────────────

    @Override
    @Transactional
    public LeaveRequestResponse submitLeave(LeaveRequestCreateRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee)
                .startDate(LocalDateTime.parse(request.getStartDate()))
                .endDate(LocalDateTime.parse(request.getEndDate()))
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        return toLeaveResponse(leaveRequestRepository.save(leave));
    }

    @Override
    @Transactional
    public LeaveRequestResponse approveLeave(Long id) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        leave.setStatus(LeaveStatus.APPROVED);
        return toLeaveResponse(leaveRequestRepository.save(leave));
    }

    @Override
    @Transactional
    public LeaveRequestResponse rejectLeave(Long id) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        leave.setStatus(LeaveStatus.REJECTED);
        return toLeaveResponse(leaveRequestRepository.save(leave));
    }

    @Override
    public Page<LeaveRequestResponse> getLeaves(Long employeeId, String status, Pageable pageable) {
        if (employeeId != null && status != null) {
            return leaveRequestRepository.findByEmployeeIdAndStatus(
                    employeeId, LeaveStatus.valueOf(status), pageable).map(this::toLeaveResponse);
        }
        if (employeeId != null) {
            return leaveRequestRepository.findByEmployeeId(employeeId, pageable).map(this::toLeaveResponse);
        }
        if (status != null) {
            return leaveRequestRepository.findByStatus(LeaveStatus.valueOf(status), pageable).map(this::toLeaveResponse);
        }
        return leaveRequestRepository.findAll(pageable).map(this::toLeaveResponse);
    }

    // ─────────────────────────── PAYROLL ───────────────────────────────────

    @Override
    @Transactional
    public PayrollResponse generatePayroll(GeneratePayrollRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        // Check if payroll already generated for this month/year
        if (payrollRepository.findByEmployeeIdAndMonthAndYear(
                request.getEmployeeId(), request.getMonth(), request.getYear()).isPresent()) {
            throw new AppException(ErrorCode.PAYROLL_ALREADY_EXISTS);
        }

        // Calculate from attendance hours in given month/year
        LocalDateTime from = LocalDateTime.of(request.getYear(), request.getMonth(), 1, 0, 0);
        LocalDateTime to = from.plusMonths(1).minusSeconds(1);

        Page<AttendanceLog> logs = attendanceLogRepository.findByEmployeeIdAndCheckInTimeBetween(
                request.getEmployeeId(), from, to, Pageable.unpaged());

        float totalHours = (float) logs.getContent().stream()
                .filter(l -> l.getTotalHours() != null)
                .mapToDouble(AttendanceLog::getTotalHours)
                .sum();

        BigDecimal baseSalary = employee.getBaseSalary() != null ? employee.getBaseSalary() : BigDecimal.ZERO;
        // Standard work hours per month = 160h; prorate if less
        BigDecimal hourlyRate = baseSalary.divide(BigDecimal.valueOf(160), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal standardSalary = hourlyRate.multiply(BigDecimal.valueOf(totalHours))
                .setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal bonus = request.getBonus() != null ? request.getBonus() : BigDecimal.ZERO;
        BigDecimal deduction = request.getDeduction() != null ? request.getDeduction() : BigDecimal.ZERO;
        BigDecimal finalSalary = standardSalary.add(bonus).subtract(deduction).max(BigDecimal.ZERO);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(request.getMonth())
                .year(request.getYear())
                .totalWorkHours(totalHours)
                .standardSalary(standardSalary)
                .bonus(bonus)
                .deduction(deduction)
                .finalSalary(finalSalary)
                .status(PayrollStatus.PENDING)
                .build();

        return toPayrollResponse(payrollRepository.save(payroll));
    }

    @Override
    @Transactional
    public PayrollResponse markPaid(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        payroll.setStatus(PayrollStatus.PAID);
        return toPayrollResponse(payrollRepository.save(payroll));
    }

    @Override
    public Page<PayrollResponse> getPayrolls(Long employeeId, Integer month, Integer year, Pageable pageable) {
        if (employeeId != null) {
            return payrollRepository.findByEmployeeId(employeeId, pageable).map(this::toPayrollResponse);
        }
        if (month != null && year != null) {
            return payrollRepository.findByMonthAndYear(month, year, pageable).map(this::toPayrollResponse);
        }
        return payrollRepository.findAll(pageable).map(this::toPayrollResponse);
    }

    // ─────────────────────────── SHIFT ─────────────────────────────────────

    @Override
    @Transactional
    public ShiftResponse createShift(ShiftCreateRequest request) {
        if (shiftRepository.existsByShiftName(request.getShiftName())) {
            throw new AppException(ErrorCode.SHIFT_ALREADY_EXISTS);
        }
        Shift shift = Shift.builder()
                .shiftName(request.getShiftName())
                .startTime(LocalTime.parse(request.getStartTime()))
                .endTime(LocalTime.parse(request.getEndTime()))
                .coefficient(request.getCoefficient())
                .build();
        return toShiftResponse(shiftRepository.save(shift));
    }

    @Override
    public List<ShiftResponse> getAllShifts() {
        return shiftRepository.findAll().stream().map(this::toShiftResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShiftScheduleResponse assignShift(AssignShiftRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        ShiftSchedule schedule = ShiftSchedule.builder()
                .employee(employee)
                .shift(shift)
                .workDate(LocalDate.parse(request.getWorkDate()))
                .build();

        return toScheduleResponse(shiftScheduleRepository.save(schedule));
    }

    @Override
    public Page<ShiftScheduleResponse> getSchedules(Long employeeId, Pageable pageable) {
        if (employeeId != null) {
            return shiftScheduleRepository.findByEmployeeId(employeeId, pageable).map(this::toScheduleResponse);
        }
        return shiftScheduleRepository.findAll(pageable).map(this::toScheduleResponse);
    }

    // ─────────────────────────── Helpers ───────────────────────────────────

    private AttendanceLogResponse toAttendanceResponse(AttendanceLog log) {
        return AttendanceLogResponse.builder()
                .id(log.getId())
                .employeeId(log.getEmployee().getId())
                .employeeName(log.getEmployee().getFullName())
                .shiftScheduleId(log.getShiftSchedule() != null ? log.getShiftSchedule().getId() : null)
                .checkInTime(log.getCheckInTime())
                .checkOutTime(log.getCheckOutTime())
                .totalHours(log.getTotalHours())
                .build();
    }

    private LeaveRequestResponse toLeaveResponse(LeaveRequest leave) {
        return LeaveRequestResponse.builder()
                .id(leave.getId())
                .employeeId(leave.getEmployee().getId())
                .employeeName(leave.getEmployee().getFullName())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .reason(leave.getReason())
                .status(leave.getStatus())
                .build();
    }

    private PayrollResponse toPayrollResponse(Payroll payroll) {
        return PayrollResponse.builder()
                .id(payroll.getId())
                .employeeId(payroll.getEmployee().getId())
                .employeeName(payroll.getEmployee().getFullName())
                .month(payroll.getMonth())
                .year(payroll.getYear())
                .totalWorkHours(payroll.getTotalWorkHours())
                .standardSalary(payroll.getStandardSalary())
                .bonus(payroll.getBonus())
                .deduction(payroll.getDeduction())
                .finalSalary(payroll.getFinalSalary())
                .status(payroll.getStatus())
                .build();
    }

    private ShiftResponse toShiftResponse(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .shiftName(shift.getShiftName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .coefficient(shift.getCoefficient())
                .build();
    }

    private ShiftScheduleResponse toScheduleResponse(ShiftSchedule schedule) {
        return ShiftScheduleResponse.builder()
                .id(schedule.getId())
                .employeeId(schedule.getEmployee().getId())
                .employeeName(schedule.getEmployee().getFullName())
                .shiftId(schedule.getShift().getId())
                .shiftName(schedule.getShift().getShiftName())
                .workDate(schedule.getWorkDate())
                .build();
    }
}
