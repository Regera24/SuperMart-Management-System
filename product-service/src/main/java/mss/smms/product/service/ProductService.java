package mss.smms.product.service;

import mss.smms.product.dto.request.ProductCreateRequest;
import mss.smms.product.dto.request.ProductUpdateRequest;
import mss.smms.product.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductCreateRequest request);
    ProductResponse getById(String id);
    ProductResponse getBySku(String sku);
    Page<ProductResponse> getProducts(String categoryId, Boolean isActive, String keyword, Pageable pageable);
    ProductResponse updateProduct(String id, ProductUpdateRequest request);
    void deleteProduct(String id); // soft delete
}
