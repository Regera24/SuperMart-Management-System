package mss.smms.inventory.dto.response;

import lombok.Builder;
import lombok.Data;
import mss.smms.inventory.enums.ImportReceiptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ImportReceiptResponse {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long warehouseId;
    private String warehouseName;
    private BigDecimal totalAmount;
    private ImportReceiptStatus status;
    private LocalDateTime createdAt;
    private List<ImportDetailResponse> items;

    @Data
    @Builder
    public static class ImportDetailResponse {
        private Long id;
        private String productSku;
        private Integer quantity;
        private BigDecimal importPrice;
    }
}
