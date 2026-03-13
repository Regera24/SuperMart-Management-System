package mss.smms.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import mss.smms.customer.enums.TierLevel;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_customers_phone", columnNames = {"phone"})
        },
        indexes = {
                @Index(name = "idx_customers_phone", columnList = "phone")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone", length = 15, nullable = false, unique = true)
    private String phone;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "current_points", nullable = false)
    private Integer currentPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier_level", length = 20)
    private TierLevel tierLevel;

    @Column(name = "total_spent", precision = 19, scale = 4)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Version field để hỗ trợ optimistic locking (tránh race khi nhiều request cập nhật points).
     */
    @Version
    private Long version;
}
