package mss.smms.product.repository;

import mss.smms.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    Page<Product> findByIsActive(Boolean isActive, Pageable pageable);

    @Query("{ 'category_ids': ?0, 'is_active': true }")
    Page<Product> findByCategoryIdAndActiveTrue(String categoryId, Pageable pageable);

    @Query("{ 'price': { $gte: ?0, $lte: ?1 }, 'is_active': true }")
    Page<Product> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    @Query("{ 'name': { $regex: ?0, $options: 'i' }, 'is_active': true }")
    Page<Product> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
