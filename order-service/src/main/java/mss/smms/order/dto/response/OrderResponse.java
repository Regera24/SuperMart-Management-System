package mss.smms.order.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import mss.smms.order.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    UUID id;
    String orderCode;
    Long customerId;
    UUID cashierId;
    BigDecimal subTotal;
    BigDecimal taxAmount;
    BigDecimal discountAmount;
    BigDecimal finalAmount;
    OrderStatus status;
    String note;
    LocalDateTime createdAt;
    List<OrderItemResponse> items;
    String paymentMethod;
}
