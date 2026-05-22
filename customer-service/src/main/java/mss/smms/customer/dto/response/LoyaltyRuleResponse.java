package mss.smms.customer.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class LoyaltyRuleResponse {
    private Long id;
    private String name;
    private BigDecimal pointConversionRate;
    private BigDecimal minOrderValue;
    private Boolean isActive;
    private Integer priority;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
