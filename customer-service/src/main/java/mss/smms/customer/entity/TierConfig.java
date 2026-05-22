package mss.smms.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import mss.smms.customer.enums.TierLevel;

import java.math.BigDecimal;

@Entity
@Table(name = "tier_configs",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tier_configs_tier_level", columnNames = {"tier_level"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier_level", length = 20, nullable = false, unique = true)
    private TierLevel tierLevel;

    @Column(name = "min_points", nullable = false)
    private Integer minPoints = 0;

    @Column(name = "discount_percent", precision = 5, scale = 2, nullable = false)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "max_discount_amount", precision = 19, scale = 4)
    private BigDecimal maxDiscountAmount = BigDecimal.ZERO;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;
}
