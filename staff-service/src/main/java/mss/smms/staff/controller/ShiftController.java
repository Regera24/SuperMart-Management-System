package mss.smms.staff.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.staff.dto.request.AssignShiftRequest;
import mss.smms.staff.dto.request.ShiftCreateRequest;
import mss.smms.staff.dto.response.ApiResponse;
import mss.smms.staff.dto.response.ShiftResponse;
import mss.smms.staff.dto.response.ShiftScheduleResponse;
import mss.smms.staff.service.HrService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff/shifts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShiftController {

    HrService hrService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> createShift(
            @RequestBody ShiftCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.<ShiftResponse>builder()
                .code(200).message("Shift created")
                .data(hrService.createShift(request)).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftResponse>>> listShifts() {
        return ResponseEntity.ok(ApiResponse.<List<ShiftResponse>>builder()
                .code(200).message("Success")
                .data(hrService.getAllShifts()).build());
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ShiftScheduleResponse>> assign(
            @RequestBody AssignShiftRequest request) {
        return ResponseEntity.ok(ApiResponse.<ShiftScheduleResponse>builder()
                .code(200).message("Shift assigned")
                .data(hrService.assignShift(request)).build());
    }

    @GetMapping("/schedules")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<ShiftScheduleResponse>>> schedules(
            @RequestParam(required = false) Long employeeId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<ShiftScheduleResponse>>builder()
                .code(200).message("Success")
                .data(hrService.getSchedules(employeeId, pageable)).build());
    }
}
