package mss.smms.inventory.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ImportReceiptCreateRequest {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotEmpty(message = "Import items cannot be empty")
    private List<ImportItem> items;

    @Data
    public static class ImportItem {
        @NotNull(message = "Product SKU is required")
        private String productSku;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private BigDecimal importPrice;
    }
}
