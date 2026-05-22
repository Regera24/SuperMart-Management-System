package mss.smms.inventory.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.inventory.dto.request.SupplierRequest;
import mss.smms.inventory.dto.response.ApiResponse;
import mss.smms.inventory.dto.response.SupplierResponse;
import mss.smms.inventory.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<SupplierResponse>>builder()
                .code(200).message("OK").data(supplierService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<SupplierResponse>builder()
                .code(200).message("OK").data(supplierService.getById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<SupplierResponse>> create(
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse res = supplierService.create(request);
        return ResponseEntity.status(201).body(ApiResponse.<SupplierResponse>builder()
                .code(201).message("Supplier created").data(res).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<SupplierResponse>> update(
            @PathVariable Long id, @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.<SupplierResponse>builder()
                .code(200).message("Supplier updated")
                .data(supplierService.update(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Supplier deleted").build());
    }
}
