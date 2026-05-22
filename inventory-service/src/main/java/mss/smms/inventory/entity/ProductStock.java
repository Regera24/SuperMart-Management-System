package mss.smms.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products_stock",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_products_stock_warehouse_product", columnNames = {"warehouse_id", "product_sku"})
        },
        indexes = {
                @Index(name = "idx_products_stock_warehouse", columnList = "warehouse_id"),
                @Index(name = "idx_products_stock_sku", columnList = "product_sku")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = "warehouse")
public class ProductStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    /**
     * Logical FK from Product Service: SKU is used to reconcile with product catalog.
     */
    @Column(name = "product_sku", length = 50, nullable = false)
    private String productSku;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;
}
