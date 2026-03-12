package mss.smms.product.entity;

import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "products")
public class Product {
    @Id
    private String id;

    @Field("sku")
    @Indexed(unique = true)
    @Size(max = 50)
    private String sku;

    @Field("name")
    @Size(max = 255)
    private String name;

    @Field("slug")
    @Indexed
    @Size(max = 255)
    private String slug;

    @Field("price")
    private BigDecimal price;

    @Field("image_urls")
    private List<String> imageUrls;

    @Field("category_ids")
    private List<String> categoryIds;

    @Field("attributes")
    private Map<String, Object> attributes;

    @Field("unit")
    @Size(max = 20)
    private String unit;

    @Field("is_active")
    private Boolean isActive = Boolean.TRUE;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;
}
