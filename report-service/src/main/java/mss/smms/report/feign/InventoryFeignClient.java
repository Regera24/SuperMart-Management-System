package mss.smms.report.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "inventory-service")
public interface InventoryFeignClient {

    @GetMapping("/inventory")
    Map<String, Object> getAllStock(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size);

    @GetMapping("/inventory/low-stock")
    Map<String, Object> getLowStock(
            @RequestParam(defaultValue = "10") int threshold);
}
