package mss.smms.product.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.product.dto.request.ProductCreateRequest;
import mss.smms.product.dto.request.ProductUpdateRequest;
import mss.smms.product.dto.response.ApiResponse;
import mss.smms.product.dto.response.ProductResponse;
import mss.smms.product.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String keyword) {
        Page<ProductResponse> data = productService.getProducts(
                categoryId, isActive, keyword, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.<Page<ProductResponse>>builder()
                .code(200).message("OK").data(data).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .code(200).message("OK").data(productService.getById(id)).build());
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ApiResponse<ProductResponse>> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .code(200).message("OK").data(productService.getBySku(sku)).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {
        ProductResponse p = productService.createProduct(request);
        return ResponseEntity.status(201).body(ApiResponse.<ProductResponse>builder()
                .code(201).message("Product created").data(p).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String id,
            @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .code(200).message("Product updated").data(productService.updateProduct(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Product deactivated").build());
    }
}
