package mss.smms.inventory.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.inventory.dto.request.StockAdjustRequest;
import mss.smms.inventory.dto.response.ApiResponse;
import mss.smms.inventory.dto.response.LowStockAlertResponse;
import mss.smms.inventory.dto.response.StockResponse;
import mss.smms.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockResponse>>> getStock(
            @RequestParam Long warehouseId) {
        List<StockResponse> data = inventoryService.getStockByWarehouse(warehouseId);
        return ResponseEntity.ok(ApiResponse.<List<StockResponse>>builder()
                .code(200).message("OK").data(data).build());
    }

    @GetMapping("/sku")
    public ResponseEntity<ApiResponse<StockResponse>> getStockBySku(
            @RequestParam Long warehouseId,
            @RequestParam String sku) {
        return ResponseEntity.ok(ApiResponse.<StockResponse>builder()
                .code(200).message("OK")
                .data(inventoryService.getStockByWarehouseAndSku(warehouseId, sku)).build());
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StockResponse>> adjustStock(
            @Valid @RequestBody StockAdjustRequest request) {
        StockResponse data = inventoryService.adjustStock(request);
        return ResponseEntity.ok(ApiResponse.<StockResponse>builder()
                .code(200).message("Stock adjusted").data(data).build());
    }

    @PostMapping("/deduct")
    public ResponseEntity<ApiResponse<StockResponse>> deductStock(
            @RequestParam Long warehouseId,
            @RequestParam String sku,
            @RequestParam int quantity,
            @RequestParam(required = false) String referenceId) {
        return ResponseEntity.ok(ApiResponse.<StockResponse>builder()
                .code(200).message("Stock deducted")
                .data(inventoryService.deductStock(warehouseId, sku, quantity, referenceId)).build());
    }

    @PostMapping("/restore")
    public ResponseEntity<ApiResponse<StockResponse>> restoreStock(
            @RequestParam Long warehouseId,
            @RequestParam String sku,
            @RequestParam int quantity,
            @RequestParam(required = false) String referenceId) {
        return ResponseEntity.ok(ApiResponse.<StockResponse>builder()
                .code(200).message("Stock restored")
                .data(inventoryService.restoreStock(warehouseId, sku, quantity, referenceId)).build());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LowStockAlertResponse>>> getLowStock(
            @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(ApiResponse.<List<LowStockAlertResponse>>builder()
                .code(200).message("OK")
                .data(inventoryService.getLowStockItems(threshold)).build());
    }
}
