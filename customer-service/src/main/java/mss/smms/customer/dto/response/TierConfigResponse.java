package mss.smms.customer.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TierConfigResponse {
    private Long id;
    private String tierLevel;
    private Integer minPoints;
    private BigDecimal discountPercent;
    private BigDecimal maxDiscountAmount;
    private String description;
    private Boolean isActive;
}
