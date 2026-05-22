package mss.smms.order.exception;

import lombok.extern.slf4j.Slf4j;
import mss.smms.order.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode ec = ex.getErrorCode();
        String msg = ex.getCustomMessage() != null ? ex.getCustomMessage() : ec.getMessage();
        log.warn("AppException: {}", msg);
        return ResponseEntity.status(ec.getHttpStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(ec.getCode()).message(msg).build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Void>builder().code(400).message(msg).build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unhandled exception in order-service", ex);
        return ResponseEntity.status(500)
                .body(ApiResponse.<Void>builder()
                        .code(500).message("Internal server error: " + ex.getMessage()).build());
    }
}