package mss.smms.report.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    NOT_FOUND(404, "Not Found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    INVALID_REPORT_TYPE(400, "Invalid report type. Supported: SALES, INVENTORY", HttpStatus.BAD_REQUEST),
    REPORT_NOT_READY(400, "Report is not completed or has no result file", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED(500, "Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR),
    ;
    private final int code;
    private final String messageKey;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String messageKey, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.messageKey = messageKey;
        this.httpStatusCode = httpStatusCode;
    }

    public String getMessage() { return messageKey; }
}
