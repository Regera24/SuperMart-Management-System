package mss.smms.product.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.product.dto.request.CategoryRequest;
import mss.smms.product.dto.response.ApiResponse;
import mss.smms.product.dto.response.CategoryResponse;
import mss.smms.product.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .code(200).message("OK").data(categoryService.getRootCategories()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .code(200).message("OK").data(categoryService.getById(id)).build());
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getChildren(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .code(200).message("OK").data(categoryService.getChildren(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.<CategoryResponse>builder()
                .code(201).message("Category created").data(categoryService.createCategory(request)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String id, @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .code(200).message("Category updated").data(categoryService.updateCategory(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Category deleted").build());
    }
}
