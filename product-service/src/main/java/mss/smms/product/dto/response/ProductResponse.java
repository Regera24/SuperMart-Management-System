package mss.smms.product.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    String id;
    String sku;
    String name;
    String slug;
    BigDecimal price;
    String unit;
    List<String> categoryIds;
    List<String> imageUrls;
    Map<String, Object> attributes;
    Boolean isActive;
    Instant createdAt;
    Instant updatedAt;
}
