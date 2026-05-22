package mss.smms.report.service;

import com.opencsv.CSVWriter;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import mss.smms.report.dto.request.GenerateReportRequest;
import mss.smms.report.dto.response.ReportResponse;
import mss.smms.report.entity.Report;
import mss.smms.report.exception.AppException;
import mss.smms.report.exception.ErrorCode;
import mss.smms.report.feign.OrderFeignClient;
import mss.smms.report.repository.ReportRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportServiceImpl implements ReportService {

    ReportRepository reportRepository;
    OrderFeignClient orderFeignClient;

    private static final String REPORT_DIR = "reports";
    private static final DateTimeFormatter FILE_TS = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Override
    public ReportResponse generate(GenerateReportRequest req) {
        Report report = Report.builder()
                .type(req.getType())
                .title(req.getTitle())
                .parameters(req.getParameters())
                .status("PENDING")
                .periodFrom(req.getPeriodFrom())
                .periodTo(req.getPeriodTo())
                .requestedBy(req.getRequestedBy())
                .requestedAt(LocalDateTime.now())
                .build();
        report = reportRepository.save(report);

        try {
            String csvPath = switch (req.getType()) {
                case "SALES" -> generateSalesReport(req);
                case "INVENTORY" -> generateInventoryReport(req);
                default -> throw new AppException(ErrorCode.INVALID_REPORT_TYPE);
            };

            report.setStatus("COMPLETED");
            report.setResultUrl(csvPath);
            report.setCompletedAt(LocalDateTime.now());
            log.info("Report {} generated: {}", report.getId(), csvPath);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Report generation failed: {}", e.getMessage(), e);
            report.setStatus("FAILED");
            report.setCompletedAt(LocalDateTime.now());
        }

        return toResponse(reportRepository.save(report));
    }

    // ───────────────────────── SALES REPORT ────────────────────────────────

    private String generateSalesReport(GenerateReportRequest req) throws IOException {
        LocalDate from = req.getPeriodFrom() != null ? req.getPeriodFrom() : LocalDate.now().minusYears(1);
        LocalDate to = req.getPeriodTo() != null ? req.getPeriodTo() : LocalDate.now();
        log.info("Fetching orders from order-service for period {} – {}", from, to);

        OrderFeignClient.ApiPageResponse<OrderFeignClient.OrderSummary> response =
                orderFeignClient.getOrders(from.atStartOfDay(), to.atStartOfDay(), 0, 1000);

        List<OrderFeignClient.OrderSummary> orders = Optional.ofNullable(response)
                .map(OrderFeignClient.ApiPageResponse::getData)
                .map(OrderFeignClient.PageData::getContent)
                .orElse(Collections.emptyList());

        // Filter only COMPLETED orders
        List<OrderFeignClient.OrderSummary> completedOrders = orders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = completedOrders.stream()
                .map(OrderFeignClient.OrderSummary::getFinalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Product sales aggregation
        Map<String, BigDecimal> productRevenue = new LinkedHashMap<>();
        for (var order : completedOrders) {
            if (order.getItems() != null) {
                for (var item : order.getItems()) {
                    productRevenue.merge(
                            item.getProductName() != null ? item.getProductName() : "Unknown",
                            item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO,
                            BigDecimal::add
                    );
                }
            }
        }

        // Write CSV
        String filename = REPORT_DIR + "/sales_" + LocalDateTime.now().format(FILE_TS) + ".csv";
        ensureDir();
        try (CSVWriter writer = new CSVWriter(new FileWriter(filename))) {
            writer.writeNext(new String[]{"# SALES REPORT"});
            writer.writeNext(new String[]{"Period From", req.getPeriodFrom() != null ? req.getPeriodFrom().toString() : "-"});
            writer.writeNext(new String[]{"Period To", req.getPeriodTo() != null ? req.getPeriodTo().toString() : "-"});
            writer.writeNext(new String[]{"Total Orders (Completed)", String.valueOf(completedOrders.size())});
            writer.writeNext(new String[]{"Total Revenue (VND)", totalRevenue.toPlainString()});
            writer.writeNext(new String[]{});

            writer.writeNext(new String[]{"Order Code", "Status", "Final Amount (VND)", "Created At"});
            for (var o : completedOrders) {
                writer.writeNext(new String[]{
                        o.getOrderCode(),
                        o.getStatus(),
                        o.getFinalAmount() != null ? o.getFinalAmount().toPlainString() : "0",
                        o.getCreatedAt() != null ? o.getCreatedAt().toString() : ""
                });
            }

            writer.writeNext(new String[]{});
            writer.writeNext(new String[]{"Product Name", "Total Revenue (VND)"});
            productRevenue.entrySet().stream()
                    .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                    .forEach(e -> writer.writeNext(new String[]{e.getKey(), e.getValue().toPlainString()}));
        }

        return filename;
    }

    // ───────────────────────── INVENTORY REPORT (basic) ────────────────────

    private String generateInventoryReport(GenerateReportRequest req) throws IOException {
        String filename = REPORT_DIR + "/inventory_" + LocalDateTime.now().format(FILE_TS) + ".csv";
        ensureDir();
        try (CSVWriter writer = new CSVWriter(new FileWriter(filename))) {
            writer.writeNext(new String[]{"# INVENTORY REPORT"});
            writer.writeNext(new String[]{"Generated At", LocalDateTime.now().toString()});
            writer.writeNext(new String[]{});
            writer.writeNext(new String[]{"Note", "Inventory data is available via /api/v1/inventory endpoint"});
        }
        return filename;
    }

    private void ensureDir() {
        File dir = new File(REPORT_DIR);
        if (!dir.exists()) dir.mkdirs();
    }

    // ───────────────────────── Standard CRUD ───────────────────────────────

    @Override
    public ReportResponse getById(Long id) {
        return toResponse(reportRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND)));
    }

    @Override
    public Page<ReportResponse> getAll(Pageable pageable) {
        return reportRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<ReportResponse> getByRequester(String accountId, Pageable pageable) {
        return reportRepository.findByRequestedBy(accountId, pageable).map(this::toResponse);
    }

    @Override
    public String getReportFilePath(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (!"COMPLETED".equals(report.getStatus()) || report.getResultUrl() == null) {
            throw new AppException(ErrorCode.REPORT_NOT_READY);
        }
        return report.getResultUrl();
    }

    private ReportResponse toResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .type(r.getType())
                .title(r.getTitle())
                .parameters(r.getParameters())
                .resultUrl(r.getResultUrl())
                .status(r.getStatus())
                .periodFrom(r.getPeriodFrom())
                .periodTo(r.getPeriodTo())
                .requestedBy(r.getRequestedBy())
                .requestedAt(r.getRequestedAt())
                .completedAt(r.getCompletedAt())
                .build();
    }
}
