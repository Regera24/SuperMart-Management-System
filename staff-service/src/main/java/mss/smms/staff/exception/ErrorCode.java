package mss.smms.staff.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    USER_EXISTED(400,"User existed",HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(400,"User not existed",HttpStatus.NOT_FOUND),
    PASSWORD_INVALID(400,"Password must be at least {min}",HttpStatus.BAD_REQUEST),
    KEY_INVALID(400,"Key invalid",HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401,"Unauthorized",HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403,"Forbidden",HttpStatus.FORBIDDEN),
    NOT_FOUND(404,"Not Found",HttpStatus.NOT_FOUND),
    ALREADY_CHECKED_IN(400,"Employee already has an active check-in",HttpStatus.BAD_REQUEST),
    NO_ACTIVE_CHECK_IN(400,"No active check-in found for this employee",HttpStatus.BAD_REQUEST),
    PAYROLL_ALREADY_EXISTS(400,"Payroll already generated for this month/year",HttpStatus.BAD_REQUEST),
    SHIFT_ALREADY_EXISTS(400,"Shift with this name already exists",HttpStatus.BAD_REQUEST),
    UNCATEGORIZED(500,"Error not defined",HttpStatus.INTERNAL_SERVER_ERROR),
    ;
    private final int code;
    private final String messageKey;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String messageKey, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.messageKey = messageKey;
        this.httpStatusCode = httpStatusCode;
    }

    public String getMessage() {
        return messageKey;
    }
}
