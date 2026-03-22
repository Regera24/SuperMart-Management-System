package mss.smms.report.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.report.dto.request.GenerateReportRequest;
import mss.smms.report.dto.response.ApiResponse;
import mss.smms.report.dto.response.ReportResponse;
import mss.smms.report.service.ReportService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportController {

    ReportService reportService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ReportResponse>> generate(
            @RequestBody GenerateReportRequest request) {
        return ResponseEntity.ok(ApiResponse.<ReportResponse>builder()
                .code(200).message("Report generation started")
                .data(reportService.generate(request)).build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<ReportResponse>>builder()
                .code(200).message("Success")
                .data(reportService.getAll(pageable)).build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ReportResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ReportResponse>builder()
                .code(200).message("Success")
                .data(reportService.getById(id)).build());
    }

    @GetMapping("/requester/{accountId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getByRequester(
            @PathVariable Long accountId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<ReportResponse>>builder()
                .code(200).message("Success")
                .data(reportService.getByRequester(accountId, pageable)).build());
    }

    /**
     * Download the generated CSV report file.
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        String filePath = reportService.getReportFilePath(id);
        File file = new File(filePath);
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName() + "\"")
                .body(resource);
    }
}
