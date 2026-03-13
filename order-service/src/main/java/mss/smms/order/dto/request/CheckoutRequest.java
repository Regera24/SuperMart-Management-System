package mss.smms.order.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import mss.smms.order.enums.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutRequest {
    UUID customerId;
    BigDecimal discountAmount;
    String note;
    @NotNull Long warehouseId;
    @NotEmpty List<CheckoutItemRequest> items;
    @NotNull PaymentMethod paymentMethod;
    BigDecimal paidAmount; // cash change calculation
}
