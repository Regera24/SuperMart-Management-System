package mss.smms.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"productStocks", "inventoryTransactions", "importReceipts"})
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    /**
     * Có thể lưu TEXT hoặc JSON (Postgres jsonb).
     * Nếu muốn jsonb: @Column(columnDefinition = "jsonb")
     */
    @Column(name = "location", columnDefinition = "TEXT")
    private String location;

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = false)
    private Set<ProductStock> productStocks = new HashSet<>();

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = false)
    private Set<InventoryTransaction> inventoryTransactions = new HashSet<>();

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = false)
    private Set<ImportReceipt> importReceipts = new HashSet<>();
}