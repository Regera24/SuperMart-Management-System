package mss.smms.product.converter;

import mss.smms.product.dto.response.ProductResponse;
import mss.smms.product.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductConverter {

    public ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .slug(p.getSlug())
                .price(p.getPrice())
                .unit(p.getUnit())
                .categoryIds(p.getCategoryIds())
                .imageUrls(p.getImageUrls())
                .attributes(p.getAttributes())
                .isActive(p.getIsActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
