package mss.smms.customer.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TierConfigRequest {
    private Integer minPoints;
    private BigDecimal discountPercent;
    private BigDecimal maxDiscountAmount;
    private String description;
    private Boolean isActive;
}
