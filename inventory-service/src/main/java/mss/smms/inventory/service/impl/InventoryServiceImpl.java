package mss.smms.inventory.service.impl;

import lombok.RequiredArgsConstructor;
import mss.smms.inventory.dto.request.StockAdjustRequest;
import mss.smms.inventory.dto.response.LowStockAlertResponse;
import mss.smms.inventory.dto.response.StockResponse;
import mss.smms.inventory.entity.InventoryTransaction;
import mss.smms.inventory.entity.ProductStock;
import mss.smms.inventory.entity.Warehouse;
import mss.smms.inventory.enums.TransactionType;
import mss.smms.inventory.exception.AppException;
import mss.smms.inventory.exception.ErrorCode;
import mss.smms.inventory.repository.InventoryTransactionRepository;
import mss.smms.inventory.repository.ProductStockRepository;
import mss.smms.inventory.repository.WarehouseRepository;
import mss.smms.inventory.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductStockRepository productStockRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public List<StockResponse> getStockByWarehouse(Long warehouseId) {
        return productStockRepository.findByWarehouseId(warehouseId).stream()
                .map(this::toResponse).toList();
    }

    @Override
    public StockResponse getStockByWarehouseAndSku(Long warehouseId, String sku) {
        return toResponse(productStockRepository
                .findByWarehouseIdAndProductSku(warehouseId, sku)
                .orElseThrow(() -> new AppException(ErrorCode.STOCK_NOT_FOUND)));
    }

    @Override
    @Transactional
    public StockResponse adjustStock(StockAdjustRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));

        ProductStock stock = productStockRepository
                .findByWarehouseIdAndProductSku(request.getWarehouseId(), request.getProductSku())
                .orElseGet(() -> ProductStock.builder()
                        .warehouse(warehouse)
                        .productSku(request.getProductSku())
                        .quantityOnHand(0)
                        .reservedQuantity(0)
                        .build());

        int newQty = stock.getQuantityOnHand() + request.getQuantityChange();
        if (newQty < 0) throw new AppException(ErrorCode.NEGATIVE_STOCK_NOT_ALLOWED);
        stock.setQuantityOnHand(newQty);
        productStockRepository.save(stock);

        InventoryTransaction tx = InventoryTransaction.builder()
                .warehouse(warehouse)
                .productSku(request.getProductSku())
                .quantityChange(request.getQuantityChange())
                .type(request.getType())
                .referenceId(request.getReferenceId())
                .build();
        transactionRepository.save(tx);

        return toResponse(stock);
    }

    @Override
    @Transactional
    public StockResponse deductStock(Long warehouseId, String sku, int quantity, String referenceId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));
        ProductStock stock = productStockRepository
                .findByWarehouseIdAndProductSku(warehouseId, sku)
                .orElseThrow(() -> new AppException(ErrorCode.STOCK_NOT_FOUND));
        int newQty = stock.getQuantityOnHand() - quantity;
        if (newQty < 0) throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        stock.setQuantityOnHand(newQty);
        productStockRepository.save(stock);

        transactionRepository.save(InventoryTransaction.builder()
                .warehouse(warehouse).productSku(sku)
                .quantityChange(-quantity).type(TransactionType.SALE)
                .referenceId(referenceId).build());
        return toResponse(stock);
    }

    @Override
    @Transactional
    public StockResponse restoreStock(Long warehouseId, String sku, int quantity, String referenceId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));
        ProductStock stock = productStockRepository
                .findByWarehouseIdAndProductSku(warehouseId, sku)
                .orElseThrow(() -> new AppException(ErrorCode.STOCK_NOT_FOUND));
        stock.setQuantityOnHand(stock.getQuantityOnHand() + quantity);
        productStockRepository.save(stock);

        transactionRepository.save(InventoryTransaction.builder()
                .warehouse(warehouse).productSku(sku)
                .quantityChange(quantity).type(TransactionType.RETURN)
                .referenceId(referenceId).build());
        return toResponse(stock);
    }

    @Override
    public List<LowStockAlertResponse> getLowStockItems(int threshold) {
        return productStockRepository.findLowStock(threshold).stream()
                .map(s -> LowStockAlertResponse.builder()
                        .warehouseId(s.getWarehouse().getId())
                        .productSku(s.getProductSku())
                        .quantityOnHand(s.getQuantityOnHand())
                        .threshold(threshold).build())
                .toList();
    }

    private StockResponse toResponse(ProductStock s) {
        return StockResponse.builder()
                .id(s.getId())
                .warehouseId(s.getWarehouse().getId())
                .productSku(s.getProductSku())
                .quantityOnHand(s.getQuantityOnHand())
                .reservedQuantity(s.getReservedQuantity())
                .availableQuantity(s.getQuantityOnHand() - s.getReservedQuantity())
                .build();
    }
}
