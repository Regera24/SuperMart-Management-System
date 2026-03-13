package mss.smms.inventory.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LowStockAlertResponse {
    Long warehouseId;
    String productSku;
    Integer quantityOnHand;
    Integer threshold;
}
