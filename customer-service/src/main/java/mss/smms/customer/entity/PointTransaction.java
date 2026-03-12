package mss.smms.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import mss.smms.customer.enums.PointTxnType;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "point_transactions",
        indexes = {
                @Index(name = "idx_pt_customer", columnList = "customer_id"),
                @Index(name = "idx_pt_order_id", columnList = "order_id"),
                @Index(name = "idx_pt_txn_date", columnList = "transaction_date")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_pt_customer"))
    private Customer customer;

    @Column(name = "points_amount", nullable = false)
    private Integer pointsAmount; // + for earn, - for redeem/expire

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20, nullable = false)
    private PointTxnType type;

    @Column(name = "order_id", length = 50)
    private String orderId;

    @CreationTimestamp
    @Column(name = "transaction_date", nullable = false, updatable = false)
    private LocalDateTime transactionDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
