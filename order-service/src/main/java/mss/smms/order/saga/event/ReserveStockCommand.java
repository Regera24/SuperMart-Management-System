package mss.smms.order.saga.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Command sent to inventory-service to reserve stock for an order.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReserveStockCommand {

    private UUID sagaId;
    private UUID orderId;
    private Long warehouseId;
    private List<StockItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockItem {
        private String productSku;
        private int quantity;
    }
}
