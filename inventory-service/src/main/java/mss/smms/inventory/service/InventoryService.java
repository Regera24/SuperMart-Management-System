package mss.smms.inventory.service;

import mss.smms.inventory.dto.request.StockAdjustRequest;
import mss.smms.inventory.dto.response.LowStockAlertResponse;
import mss.smms.inventory.dto.response.StockResponse;

import java.util.List;

public interface InventoryService {
    List<StockResponse> getStockByWarehouse(Long warehouseId);
    StockResponse getStockByWarehouseAndSku(Long warehouseId, String sku);
    StockResponse adjustStock(StockAdjustRequest request);
    StockResponse deductStock(Long warehouseId, String sku, int quantity, String referenceId);
    StockResponse restoreStock(Long warehouseId, String sku, int quantity, String referenceId);
    List<LowStockAlertResponse> getLowStockItems(int threshold);
}
