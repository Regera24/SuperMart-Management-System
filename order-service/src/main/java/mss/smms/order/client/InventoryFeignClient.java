package mss.smms.order.client;

import mss.smms.order.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "inventory-service", path = "/inventory")
public interface InventoryFeignClient {

    @PostMapping("/deduct")
    ApiResponse<Object> deductStock(
            @RequestParam Long warehouseId,
            @RequestParam String sku,
            @RequestParam int quantity,
            @RequestParam String referenceId);

    @PostMapping("/restore")
    ApiResponse<Object> restoreStock(
            @RequestParam Long warehouseId,
            @RequestParam String sku,
            @RequestParam int quantity,
            @RequestParam String referenceId);

    @GetMapping("/sku")
    ApiResponse<Object> getStock(
            @RequestParam Long warehouseId,
            @RequestParam String sku);
}
