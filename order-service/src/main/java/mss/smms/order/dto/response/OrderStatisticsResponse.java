package mss.smms.order.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatisticsResponse {
    // Today
    BigDecimal todayRevenue;
    long todayOrders;

    // Yesterday (for trend calculation)
    BigDecimal yesterdayRevenue;
    long yesterdayOrders;

    // Totals
    BigDecimal totalRevenue;
    long totalOrders;

    // Daily revenue for last 7 days (for weekly chart)
    List<DailyRevenue> dailyRevenue;

    // Monthly summary (for monthly chart)
    List<MonthlySummary> monthlySummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DailyRevenue {
        String name;    // e.g. "T2", "T3" (day-of-week) or "24/03"
        BigDecimal revenue;
        long orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthlySummary {
        String month;   // e.g. "T1", "T2", ...
        BigDecimal revenue;
        long orders;
    }
}
