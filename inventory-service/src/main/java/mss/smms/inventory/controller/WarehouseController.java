package mss.smms.inventory.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.inventory.dto.request.WarehouseRequest;
import mss.smms.inventory.dto.response.ApiResponse;
import mss.smms.inventory.dto.response.WarehouseResponse;
import mss.smms.inventory.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WarehouseResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<WarehouseResponse>>builder()
                .code(200).message("OK").data(warehouseService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<WarehouseResponse>builder()
                .code(200).message("OK").data(warehouseService.getById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WarehouseResponse>> create(
            @Valid @RequestBody WarehouseRequest request) {
        WarehouseResponse res = warehouseService.create(request);
        return ResponseEntity.status(201).body(ApiResponse.<WarehouseResponse>builder()
                .code(201).message("Warehouse created").data(res).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WarehouseResponse>> update(
            @PathVariable Long id, @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.<WarehouseResponse>builder()
                .code(200).message("Warehouse updated")
                .data(warehouseService.update(id, request)).build());
    }
}
