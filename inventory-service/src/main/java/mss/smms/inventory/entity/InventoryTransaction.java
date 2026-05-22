package mss.smms.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import mss.smms.inventory.enums.TransactionType;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions",
        indexes = {
                @Index(name = "idx_invtrans_warehouse", columnList = "warehouse_id"),
                @Index(name = "idx_invtrans_product", columnList = "product_sku"),
                @Index(name = "idx_invtrans_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = "warehouse")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "product_sku", length = 50, nullable = false)
    private String productSku;

    /**
     * Positive or Negative (positive for IMPORT, negative for SALE etc).
     */
    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20, nullable = false)
    private TransactionType type;

    /**
     * Reference id: order id, import receipt id, transfer id...
     */
    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
