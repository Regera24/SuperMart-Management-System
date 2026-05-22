package mss.smms.customer.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.customer.dto.request.CustomerCreateRequest;
import mss.smms.customer.dto.request.CustomerUpdateRequest;
import mss.smms.customer.dto.response.ApiResponse;
import mss.smms.customer.dto.response.CustomerResponse;
import mss.smms.customer.dto.response.PointTransactionResponse;
import mss.smms.customer.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.<Page<CustomerResponse>>builder()
                .code(200).message("OK")
                .data(customerService.getCustomers(search, PageRequest.of(page, size))).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .code(200).message("OK").data(customerService.getById(id)).build());
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getByPhone(@PathVariable String phone) {
        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .code(200).message("OK").data(customerService.getByPhone(phone)).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> create(
            @Valid @RequestBody CustomerCreateRequest request) {
        CustomerResponse res = customerService.createCustomer(request);
        return ResponseEntity.status(201).body(ApiResponse.<CustomerResponse>builder()
                .code(201).message("Customer created").data(res).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable Long id, @RequestBody CustomerUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .code(200).message("Customer updated")
                .data(customerService.updateCustomer(id, request)).build());
    }

    @PostMapping("/{id}/points/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> addPoints(
            @PathVariable Long id,
            @RequestParam int points,
            @RequestParam(required = false) String referenceId) {
        customerService.addPoints(id, points, referenceId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Points added").build());
    }

    @PostMapping("/{id}/points/deduct")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deductPoints(
            @PathVariable Long id,
            @RequestParam int points,
            @RequestParam(required = false) String referenceId) {
        customerService.deductPoints(id, points, referenceId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Points deducted").build());
    }

    @GetMapping("/{id}/points/history")
    public ResponseEntity<ApiResponse<Page<PointTransactionResponse>>> getPointHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.<Page<PointTransactionResponse>>builder()
                .code(200).message("OK")
                .data(customerService.getPointHistory(id, PageRequest.of(page, size))).build());
    }

    @PostMapping("/{id}/earn-from-order")
    public ResponseEntity<ApiResponse<Integer>> earnFromOrder(
            @PathVariable Long id,
            @RequestParam java.math.BigDecimal orderAmount,
            @RequestParam(required = false) String orderCode) {
        int points = customerService.earnFromOrder(id, orderAmount, orderCode);
        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .code(200).message("Points earned: " + points).data(points).build());
    }
}
