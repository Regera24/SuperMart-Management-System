package mss.smms.order.saga.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Reply from inventory-service indicating stock was successfully reserved.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReservedReply {
    private UUID sagaId;
    private UUID orderId;
}
