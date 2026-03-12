package mss.smms.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    /**
     * contact_info có thể là TEXT hoặc jsonb (Postgres).
     * Nếu muốn jsonb: @Column(columnDefinition = "jsonb")
     */
    @Column(name = "contact_info", columnDefinition = "TEXT")
    private String contactInfo;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = false)
    private Set<ImportReceipt> importReceipts = new HashSet<>();
}
