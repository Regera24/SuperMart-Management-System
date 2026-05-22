package mss.smms.customer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LoyaltyRuleRequest {
    @NotBlank(message = "Rule name is required")
    private String name;

    @NotNull(message = "Point conversion rate is required")
    private BigDecimal pointConversionRate;

    private BigDecimal minOrderValue;
    private Boolean isActive = true;
    private Integer priority = 0;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
