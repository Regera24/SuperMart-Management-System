package mss.smms.report.feign;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Feign client to fetch order data from order-service for report generation.
 * Uses Eureka service name for load-balanced calls.
 */
@FeignClient(name = "order-service", url = "${feign.order-service.url:}",
        configuration = FeignClientConfig.class)
public interface OrderFeignClient {

    @GetMapping("/api/v1/orders")
    ApiPageResponse<OrderSummary> getOrders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "500") int size
    );

    // ─── Inner DTOs used only for report aggregation ───────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class OrderSummary {
        private Long id;
        private String orderCode;
        private String status;
        private BigDecimal finalAmount;
        private LocalDateTime createdAt;
        private List<OrderItemSummary> items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class OrderItemSummary {
        private String productName;
        private String categoryName;
        private Integer quantity;
        private BigDecimal totalPrice;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class ApiPageResponse<T> {
        private int code;
        private String message;
        private PageData<T> data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class PageData<T> {
        private List<T> content;
        private int totalPages;
        private long totalElements;
    }
}
