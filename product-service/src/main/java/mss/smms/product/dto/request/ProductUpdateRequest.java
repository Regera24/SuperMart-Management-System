package mss.smms.product.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {
    String name;
    String slug;
    BigDecimal price;
    String unit;
    List<String> categoryIds;
    List<String> imageUrls;
    Map<String, Object> attributes;
    Boolean isActive;
}
