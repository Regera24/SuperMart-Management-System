package mss.smms.product.service.impl;

import lombok.RequiredArgsConstructor;
import mss.smms.product.converter.CategoryConverter;
import mss.smms.product.dto.request.CategoryRequest;
import mss.smms.product.dto.response.CategoryResponse;
import mss.smms.product.entity.Category;
import mss.smms.product.exception.AppException;
import mss.smms.product.exception.ErrorCode;
import mss.smms.product.repository.CategoryRepository;
import mss.smms.product.service.CategoryService;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryConverter categoryConverter;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        String slug = request.getSlug() != null ? request.getSlug() : slugify(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTS);
        }
        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .parentId(request.getParentId())
                .imageUrl(request.getImageUrl())
                .build();
        return categoryConverter.toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse getById(String id) {
        return categoryConverter.toResponse(categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)));
    }

    @Override
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIdIsNull().stream()
                .map(categoryConverter::toResponse).toList();
    }

    @Override
    public List<CategoryResponse> getChildren(String parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(categoryConverter::toResponse).toList();
    }

    @Override
    public CategoryResponse updateCategory(String id, CategoryRequest request) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (request.getName() != null) cat.setName(request.getName());
        if (request.getSlug() != null) cat.setSlug(request.getSlug());
        if (request.getParentId() != null) cat.setParentId(request.getParentId());
        if (request.getImageUrl() != null) cat.setImageUrl(request.getImageUrl());
        return categoryConverter.toResponse(categoryRepository.save(cat));
    }

    @Override
    public void deleteCategory(String id) {
        if (!categoryRepository.existsById(id)) throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        categoryRepository.deleteById(id);
    }

    private String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("")
                .toLowerCase(Locale.ENGLISH).replaceAll("[^\\w\\s-]", "")
                .replaceAll("[\\s_-]+", "-").replaceAll("^-|-$", "");
    }
}
