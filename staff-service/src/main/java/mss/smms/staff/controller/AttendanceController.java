package mss.smms.staff.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.staff.dto.request.CheckInRequest;
import mss.smms.staff.dto.response.ApiResponse;
import mss.smms.staff.dto.response.AttendanceLogResponse;
import mss.smms.staff.service.HrService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff/attendance")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AttendanceController {

    HrService hrService;

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceLogResponse>> checkIn(
            @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(ApiResponse.<AttendanceLogResponse>builder()
                .code(200).message("Checked in successfully")
                .data(hrService.checkIn(request)).build());
    }

    @PostMapping("/check-out/{employeeId}")
    public ResponseEntity<ApiResponse<AttendanceLogResponse>> checkOut(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.<AttendanceLogResponse>builder()
                .code(200).message("Checked out successfully")
                .data(hrService.checkOut(employeeId)).build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<AttendanceLogResponse>>> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<AttendanceLogResponse>>builder()
                .code(200).message("Success")
                .data(hrService.getAttendance(employeeId, from, to, pageable)).build());
    }
}
