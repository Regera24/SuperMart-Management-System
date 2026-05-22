package mss.smms.inventory.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.inventory.dto.request.ImportReceiptCreateRequest;
import mss.smms.inventory.dto.response.ApiResponse;
import mss.smms.inventory.dto.response.ImportReceiptResponse;
import mss.smms.inventory.service.ImportReceiptService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/import-receipts")
@RequiredArgsConstructor
public class ImportReceiptController {

    private final ImportReceiptService importReceiptService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ImportReceiptResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status) {
        Page<ImportReceiptResponse> data = importReceiptService.getAll(
                supplierId, warehouseId, status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.<Page<ImportReceiptResponse>>builder()
                .code(200).message("OK").data(data).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImportReceiptResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ImportReceiptResponse>builder()
                .code(200).message("OK").data(importReceiptService.getById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ImportReceiptResponse>> create(
            @Valid @RequestBody ImportReceiptCreateRequest request) {
        ImportReceiptResponse res = importReceiptService.create(request);
        return ResponseEntity.status(201).body(ApiResponse.<ImportReceiptResponse>builder()
                .code(201).message("Import receipt created").data(res).build());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ImportReceiptResponse>> approve(@PathVariable Long id) {
        ImportReceiptResponse res = importReceiptService.approve(id);
        return ResponseEntity.ok(ApiResponse.<ImportReceiptResponse>builder()
                .code(200).message("Import receipt approved, stock updated").data(res).build());
    }
}
