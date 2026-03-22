package mss.smms.order.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.order.dto.response.ApiResponse;
import mss.smms.order.exception.AppException;
import mss.smms.order.exception.ErrorCode;
import org.springframework.stereotype.Service;

/**
 * Resilient wrapper around {@link InventoryFeignClient}.
 * Applies Circuit Breaker + Retry patterns to all inventory calls.
 *
 * <p>Circuit Breaker states:</p>
 * <ul>
 *   <li><b>CLOSED</b> — normal operation, calls pass through</li>
 *   <li><b>OPEN</b> — too many failures, fallback is invoked immediately</li>
 *   <li><b>HALF_OPEN</b> — limited calls allowed to test recovery</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryClientWrapper {

    private final InventoryFeignClient inventoryFeignClient;

    // ── Deduct Stock ──

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "deductStockFallback")
    @Retry(name = "inventoryService")
    public ApiResponse<Object> deductStock(Long warehouseId, String sku, int quantity, String referenceId) {
        log.debug("Calling inventory-service: deductStock(warehouse={}, sku={}, qty={})", warehouseId, sku, quantity);
        return inventoryFeignClient.deductStock(warehouseId, sku, quantity, referenceId);
    }

    @SuppressWarnings("unused")
    private ApiResponse<Object> deductStockFallback(Long warehouseId, String sku, int quantity,
                                                     String referenceId, Throwable t) {
        log.error("Circuit breaker OPEN — deductStock failed for SKU {}: {}", sku, t.getMessage());

        if (t instanceof AppException) {
            throw (AppException) t;  // business exceptions pass through
        }

        throw new AppException(ErrorCode.INVENTORY_SERVICE_UNAVAILABLE);
    }

    // ── Restore Stock ──

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "restoreStockFallback")
    @Retry(name = "inventoryService")
    public ApiResponse<Object> restoreStock(Long warehouseId, String sku, int quantity, String referenceId) {
        log.debug("Calling inventory-service: restoreStock(warehouse={}, sku={}, qty={})", warehouseId, sku, quantity);
        return inventoryFeignClient.restoreStock(warehouseId, sku, quantity, referenceId);
    }

    @SuppressWarnings("unused")
    private ApiResponse<Object> restoreStockFallback(Long warehouseId, String sku, int quantity,
                                                      String referenceId, Throwable t) {
        log.error("Circuit breaker OPEN — restoreStock failed for SKU {}: {}", sku, t.getMessage());

        if (t instanceof AppException) {
            throw (AppException) t;
        }

        throw new AppException(ErrorCode.INVENTORY_SERVICE_UNAVAILABLE);
    }

    // ── Get Stock ──

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "getStockFallback")
    @Retry(name = "inventoryService")
    public ApiResponse<Object> getStock(Long warehouseId, String sku) {
        log.debug("Calling inventory-service: getStock(warehouse={}, sku={})", warehouseId, sku);
        return inventoryFeignClient.getStock(warehouseId, sku);
    }

    @SuppressWarnings("unused")
    private ApiResponse<Object> getStockFallback(Long warehouseId, String sku, Throwable t) {
        log.error("Circuit breaker OPEN — getStock failed for SKU {}: {}", sku, t.getMessage());

        if (t instanceof AppException) {
            throw (AppException) t;
        }

        throw new AppException(ErrorCode.INVENTORY_SERVICE_UNAVAILABLE);
    }
}
