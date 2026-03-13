package mss.smms.order.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutItemRequest {
    @NotBlank String productSku;
    @NotBlank String productName;
    @NotNull @Min(1) Integer quantity;
    @NotNull @Positive BigDecimal unitPrice;
}
