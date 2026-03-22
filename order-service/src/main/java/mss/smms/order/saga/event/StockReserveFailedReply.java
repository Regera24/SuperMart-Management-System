package mss.smms.order.saga.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Reply from inventory-service indicating stock reservation failed.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReserveFailedReply {
    private UUID sagaId;
    private UUID orderId;
    private String reason;
}
