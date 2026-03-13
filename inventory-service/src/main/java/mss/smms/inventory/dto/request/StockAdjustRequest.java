package mss.smms.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import mss.smms.inventory.enums.TransactionType;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StockAdjustRequest {
    @NotNull Long warehouseId;
    @NotBlank String productSku;
    @NotNull Integer quantityChange;  // positive = add, negative = reduce
    @NotNull TransactionType type;
    String reason;
    String referenceId;
}
