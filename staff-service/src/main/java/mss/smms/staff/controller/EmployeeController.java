package mss.smms.staff.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.staff.dto.request.EmployeeCreateRequest;
import mss.smms.staff.dto.request.EmployeeUpdateRequest;
import mss.smms.staff.dto.response.ApiResponse;
import mss.smms.staff.dto.response.DepartmentResponse;
import mss.smms.staff.dto.response.EmployeeResponse;
import mss.smms.staff.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeController {

    EmployeeService employeeService;

    /* ── Department endpoints ── */

    @PostMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.<DepartmentResponse>builder()
                .code(200)
                .message("Department created")
                .data(employeeService.createDepartment(name, description))
                .build());
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> listDepartments() {
        return ResponseEntity.ok(ApiResponse.<List<DepartmentResponse>>builder()
                .code(200)
                .message("Success")
                .data(employeeService.getAllDepartments())
                .build());
    }

    /* ── Employee endpoints ── */

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(
            @Valid @RequestBody EmployeeCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .code(200).message("Employee created")
                .data(employeeService.createEmployee(request)).build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> list(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        Page<EmployeeResponse> page = (q != null && !q.isBlank())
                ? employeeService.searchEmployees(q, pageable)
                : employeeService.getAllEmployees(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<EmployeeResponse>>builder()
                .code(200).message("Success").data(page).build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .code(200).message("Success")
                .data(employeeService.getEmployee(id)).build());
    }

    @GetMapping("/by-account/{accountId}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getByAccount(@PathVariable String accountId) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .code(200).message("Success")
                .data(employeeService.getEmployeeByAccountId(accountId)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(
            @PathVariable Long id,
            @RequestBody EmployeeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .code(200).message("Employee updated")
                .data(employeeService.updateEmployee(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Employee deleted").build());
    }
}
