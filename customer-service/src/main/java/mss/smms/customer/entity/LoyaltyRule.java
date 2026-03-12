package mss.smms.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_rules",
        indexes = {
                @Index(name = "idx_loyaltyrules_active_priority", columnList = "is_active, priority")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "point_conversion_rate", precision = 19, scale = 6)
    private BigDecimal pointConversionRate;

    @Column(name = "min_order_value", precision = 19, scale = 4)
    private BigDecimal minOrderValue;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;
}