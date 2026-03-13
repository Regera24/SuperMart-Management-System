package mss.smms.product.service;

import mss.smms.product.dto.request.CategoryRequest;
import mss.smms.product.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse getById(String id);
    List<CategoryResponse> getRootCategories();
    List<CategoryResponse> getChildren(String parentId);
    CategoryResponse updateCategory(String id, CategoryRequest request);
    void deleteCategory(String id);
}
