package mss.smms.inventory.repository;

import mss.smms.inventory.entity.ProductStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {

    Optional<ProductStock> findByWarehouseIdAndProductSku(Long warehouseId, String productSku);

    List<ProductStock> findByWarehouseId(Long warehouseId);

    List<ProductStock> findByProductSku(String productSku);

    @Query("SELECT ps FROM ProductStock ps WHERE ps.quantityOnHand <= :threshold")
    List<ProductStock> findLowStock(@Param("threshold") int threshold);
}
