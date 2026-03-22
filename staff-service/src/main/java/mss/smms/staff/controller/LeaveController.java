package mss.smms.staff.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.staff.dto.request.LeaveRequestCreateRequest;
import mss.smms.staff.dto.response.ApiResponse;
import mss.smms.staff.dto.response.LeaveRequestResponse;
import mss.smms.staff.service.HrService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff/leave")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LeaveController {

    HrService hrService;

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> submit(
            @RequestBody LeaveRequestCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.<LeaveRequestResponse>builder()
                .code(200).message("Leave request submitted")
                .data(hrService.submitLeave(request)).build());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<LeaveRequestResponse>builder()
                .code(200).message("Leave approved")
                .data(hrService.approveLeave(id)).build());
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<LeaveRequestResponse>builder()
                .code(200).message("Leave rejected")
                .data(hrService.rejectLeave(id)).build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<LeaveRequestResponse>>> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<LeaveRequestResponse>>builder()
                .code(200).message("Success")
                .data(hrService.getLeaves(employeeId, status, pageable)).build());
    }
}
