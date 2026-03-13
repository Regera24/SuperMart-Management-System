package mss.smms.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCreateRequest {
    @NotBlank String sku;
    @NotBlank String name;
    String slug;
    @NotNull @Positive BigDecimal price;
    String unit;
    List<String> categoryIds;
    List<String> imageUrls;
    Map<String, Object> attributes;
}
