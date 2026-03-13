package mss.smms.report.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import mss.smms.report.dto.request.GenerateReportRequest;
import mss.smms.report.dto.response.ReportResponse;
import mss.smms.report.entity.Report;
import mss.smms.report.exception.AppException;
import mss.smms.report.exception.ErrorCode;
import mss.smms.report.repository.ReportRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportServiceImpl implements ReportService {

    ReportRepository reportRepository;

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

        // Simulate asynchronous report generation (real impl would enqueue a job)
        log.info("Generating report of type {} for period {} – {}", req.getType(), req.getPeriodFrom(), req.getPeriodTo());
        report.setStatus("COMPLETED");
        report.setCompletedAt(LocalDateTime.now());

        return toResponse(reportRepository.save(report));
    }

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
    public Page<ReportResponse> getByRequester(Long accountId, Pageable pageable) {
        return reportRepository.findByRequestedBy(accountId, pageable).map(this::toResponse);
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
