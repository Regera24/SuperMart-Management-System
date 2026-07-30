package mss.smms.report.service;

import mss.smms.report.entity.Report;
import mss.smms.report.exception.AppException;
import mss.smms.report.exception.ErrorCode;
import mss.smms.report.feign.OrderFeignClient;
import mss.smms.report.repository.ReportRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    ReportRepository reportRepository;
    @Mock
    OrderFeignClient orderFeignClient;

    @InjectMocks
    ReportServiceImpl service;

    @Test
    void getReportFilePathReturnsResultUrlOnlyWhenCompleted() {
        when(reportRepository.findById(5L)).thenReturn(Optional.of(Report.builder()
                .id(5L)
                .status("COMPLETED")
                .resultUrl("reports/sales.csv")
                .build()));

        assertThat(service.getReportFilePath(5L)).isEqualTo("reports/sales.csv");
    }

    @Test
    void getReportFilePathRejectsPendingReport() {
        when(reportRepository.findById(5L)).thenReturn(Optional.of(Report.builder()
                .id(5L)
                .status("PENDING")
                .build()));

        assertThatThrownBy(() -> service.getReportFilePath(5L))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.REPORT_NOT_READY);
    }
}
