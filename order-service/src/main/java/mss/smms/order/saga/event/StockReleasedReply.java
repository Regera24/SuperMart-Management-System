package mss.smms.order.saga.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Reply from inventory-service indicating stock was successfully released (compensation).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReleasedReply {
    private UUID sagaId;
    private UUID orderId;
}
