package mss.smms.report.service;

import mss.smms.report.dto.request.GenerateReportRequest;
import mss.smms.report.dto.response.ReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    ReportResponse generate(GenerateReportRequest request);
    ReportResponse getById(Long id);
    Page<ReportResponse> getAll(Pageable pageable);
    Page<ReportResponse> getByRequester(String accountId, Pageable pageable);
    String getReportFilePath(Long id);
}
