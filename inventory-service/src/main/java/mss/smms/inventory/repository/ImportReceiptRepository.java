package mss.smms.inventory.repository;

import mss.smms.inventory.entity.ImportReceipt;
import mss.smms.inventory.enums.ImportReceiptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportReceiptRepository extends JpaRepository<ImportReceipt, Long> {
    Page<ImportReceipt> findBySupplierId(Long supplierId, Pageable pageable);
    Page<ImportReceipt> findByWarehouseId(Long warehouseId, Pageable pageable);
    Page<ImportReceipt> findByStatus(ImportReceiptStatus status, Pageable pageable);
}
