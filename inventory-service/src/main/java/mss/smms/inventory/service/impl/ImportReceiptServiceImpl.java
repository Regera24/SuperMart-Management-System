package mss.smms.inventory.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.inventory.dto.request.ImportReceiptCreateRequest;
import mss.smms.inventory.dto.response.ImportReceiptResponse;
import mss.smms.inventory.entity.*;
import mss.smms.inventory.enums.ImportReceiptStatus;
import mss.smms.inventory.enums.TransactionType;
import mss.smms.inventory.exception.AppException;
import mss.smms.inventory.exception.ErrorCode;
import mss.smms.inventory.repository.*;
import mss.smms.inventory.service.ImportReceiptService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportReceiptServiceImpl implements ImportReceiptService {

    private final ImportReceiptRepository importReceiptRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductStockRepository productStockRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Override
    @Transactional
    public ImportReceiptResponse create(ImportReceiptCreateRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));

        ImportReceipt receipt = ImportReceipt.builder()
                .supplier(supplier)
                .warehouse(warehouse)
                .status(ImportReceiptStatus.PENDING)
                .build();

        Set<ImportDetail> details = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (ImportReceiptCreateRequest.ImportItem item : request.getItems()) {
            BigDecimal lineTotal = item.getImportPrice() != null
                    ? item.getImportPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                    : BigDecimal.ZERO;
            totalAmount = totalAmount.add(lineTotal);

            details.add(ImportDetail.builder()
                    .importReceipt(receipt)
                    .productSku(item.getProductSku())
                    .quantity(item.getQuantity())
                    .importPrice(item.getImportPrice())
                    .build());
        }

        receipt.setTotalAmount(totalAmount);
        receipt.setImportDetails(details);

        ImportReceipt saved = importReceiptRepository.save(receipt);
        log.info("Import receipt #{} created (PENDING), {} items, total: {}",
                saved.getId(), details.size(), totalAmount);

        return toResponse(saved);
    }

    /**
     * Approves an import receipt and auto-increases ProductStock for each item.
     */
    @Override
    @Transactional
    public ImportReceiptResponse approve(Long id) {
        ImportReceipt receipt = importReceiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND));

        if (receipt.getStatus() == ImportReceiptStatus.APPROVED) {
            throw new AppException(ErrorCode.IMPORT_RECEIPT_ALREADY_APPROVED);
        }

        Warehouse warehouse = receipt.getWarehouse();

        // Increase stock for each imported item
        for (ImportDetail detail : receipt.getImportDetails()) {
            ProductStock stock = productStockRepository
                    .findByWarehouseIdAndProductSku(warehouse.getId(), detail.getProductSku())
                    .orElseGet(() -> ProductStock.builder()
                            .warehouse(warehouse)
                            .productSku(detail.getProductSku())
                            .quantityOnHand(0)
                            .reservedQuantity(0)
                            .build());

            stock.setQuantityOnHand(stock.getQuantityOnHand() + detail.getQuantity());
            productStockRepository.save(stock);

            // Record inventory transaction
            transactionRepository.save(InventoryTransaction.builder()
                    .warehouse(warehouse)
                    .productSku(detail.getProductSku())
                    .quantityChange(detail.getQuantity())
                    .type(TransactionType.IMPORT)
                    .referenceId("IMPORT-" + receipt.getId())
                    .build());
        }

        receipt.setStatus(ImportReceiptStatus.APPROVED);
        ImportReceipt saved = importReceiptRepository.save(receipt);

        log.info("Import receipt #{} approved, stock updated for {} items",
                saved.getId(), receipt.getImportDetails().size());

        return toResponse(saved);
    }

    @Override
    public ImportReceiptResponse getById(Long id) {
        return toResponse(importReceiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND)));
    }

    @Override
    public Page<ImportReceiptResponse> getAll(Long supplierId, Long warehouseId, String status, Pageable pageable) {
        if (supplierId != null) {
            return importReceiptRepository.findBySupplierId(supplierId, pageable).map(this::toResponse);
        }
        if (warehouseId != null) {
            return importReceiptRepository.findByWarehouseId(warehouseId, pageable).map(this::toResponse);
        }
        if (status != null) {
            return importReceiptRepository.findByStatus(ImportReceiptStatus.valueOf(status), pageable)
                    .map(this::toResponse);
        }
        return importReceiptRepository.findAll(pageable).map(this::toResponse);
    }

    private ImportReceiptResponse toResponse(ImportReceipt r) {
        List<ImportReceiptResponse.ImportDetailResponse> items = r.getImportDetails() == null
                ? List.of()
                : r.getImportDetails().stream()
                .map(d -> ImportReceiptResponse.ImportDetailResponse.builder()
                        .id(d.getId())
                        .productSku(d.getProductSku())
                        .quantity(d.getQuantity())
                        .importPrice(d.getImportPrice())
                        .build())
                .toList();

        return ImportReceiptResponse.builder()
                .id(r.getId())
                .supplierId(r.getSupplier().getId())
                .supplierName(r.getSupplier().getName())
                .warehouseId(r.getWarehouse().getId())
                .warehouseName(r.getWarehouse().getName())
                .totalAmount(r.getTotalAmount())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .items(items)
                .build();
    }
}
