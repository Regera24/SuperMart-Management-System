package mss.smms.staff.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.staff.dto.request.GeneratePayrollRequest;
import mss.smms.staff.dto.response.ApiResponse;
import mss.smms.staff.dto.response.PayrollResponse;
import mss.smms.staff.service.HrService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff/payroll")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PayrollController {

    HrService hrService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PayrollResponse>> generate(
            @RequestBody GeneratePayrollRequest request) {
        return ResponseEntity.ok(ApiResponse.<PayrollResponse>builder()
                .code(200).message("Payroll generated")
                .data(hrService.generatePayroll(request)).build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<PayrollResponse>>> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<PayrollResponse>>builder()
                .code(200).message("Success")
                .data(hrService.getPayrolls(employeeId, month, year, pageable)).build());
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PayrollResponse>> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<PayrollResponse>builder()
                .code(200).message("Marked as paid")
                .data(hrService.markPaid(id)).build());
    }
}
