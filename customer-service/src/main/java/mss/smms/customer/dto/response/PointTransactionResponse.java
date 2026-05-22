package mss.smms.customer.dto.response;

import lombok.Builder;
import lombok.Data;
import mss.smms.customer.enums.PointTxnType;

import java.time.LocalDateTime;

@Data
@Builder
public class PointTransactionResponse {
    private Long id;
    private Integer pointsAmount;
    private PointTxnType type;
    private String orderId;
    private String description;
    private LocalDateTime transactionDate;
}
