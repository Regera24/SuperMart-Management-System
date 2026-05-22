package mss.smms.inventory.service;

import mss.smms.inventory.dto.request.ImportReceiptCreateRequest;
import mss.smms.inventory.dto.response.ImportReceiptResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ImportReceiptService {
    ImportReceiptResponse create(ImportReceiptCreateRequest request);
    ImportReceiptResponse approve(Long id);
    ImportReceiptResponse getById(Long id);
    Page<ImportReceiptResponse> getAll(Long supplierId, Long warehouseId, String status, Pageable pageable);
}
