package mss.smms.product.service.impl;

import lombok.RequiredArgsConstructor;
import mss.smms.product.converter.ProductConverter;
import mss.smms.product.dto.request.ProductCreateRequest;
import mss.smms.product.dto.request.ProductUpdateRequest;
import mss.smms.product.dto.response.ProductResponse;
import mss.smms.product.entity.Product;
import mss.smms.product.exception.AppException;
import mss.smms.product.exception.ErrorCode;
import mss.smms.product.repository.ProductRepository;
import mss.smms.product.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductConverter productConverter;

    @Override
    public ProductResponse createProduct(ProductCreateRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);
        }

        String slug = request.getSlug() != null ? request.getSlug() : slugify(request.getName());

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .slug(slug)
                .price(request.getPrice())
                .unit(request.getUnit())
                .categoryIds(request.getCategoryIds())
                .imageUrls(request.getImageUrls())
                .attributes(request.getAttributes())
                .isActive(Boolean.TRUE)
                .build();

        return productConverter.toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse getById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productConverter.toResponse(product);
    }

    @Override
    public ProductResponse getBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productConverter.toResponse(product);
    }

    @Override
    public Page<ProductResponse> getProducts(String categoryId, Boolean isActive, String keyword, Pageable pageable) {
        Page<Product> page;
        if (categoryId != null)
            page = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
        else if (keyword != null && !keyword.isBlank())
            page = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        else if (isActive != null)
            page = productRepository.findByIsActive(isActive, pageable);
        else
            page = productRepository.findAll(pageable);

        return page.map(productConverter::toResponse);
    }

    @Override
    public ProductResponse updateProduct(String id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        if (request.getName() != null) product.setName(request.getName());
        if (request.getSlug() != null) product.setSlug(request.getSlug());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getUnit() != null) product.setUnit(request.getUnit());
        if (request.getCategoryIds() != null) product.setCategoryIds(request.getCategoryIds());
        if (request.getImageUrls() != null) product.setImageUrls(request.getImageUrls());
        if (request.getAttributes() != null) product.setAttributes(request.getAttributes());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());
        return productConverter.toResponse(productRepository.save(product));
    }

    @Override
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setIsActive(Boolean.FALSE);
        productRepository.save(product);
    }

    private String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^\\w\\s-]", "")
                .replaceAll("[\\s_-]+", "-")
                .replaceAll("^-|-$", "");
    }
}
