package mss301.smms.identityservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // General
    UNCATEGORIZED(500, "Error not defined", HttpStatus.INTERNAL_SERVER_ERROR),
    KEY_INVALID(400, "Key invalid", HttpStatus.BAD_REQUEST),

    // Auth
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(401, "Invalid username or password", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED(423, "Account is locked. Please contact admin.", HttpStatus.LOCKED),
    TOKEN_INVALID(401, "Token is invalid or expired", HttpStatus.UNAUTHORIZED),
    OTP_INVALID(400, "OTP is invalid", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(400, "OTP has expired", HttpStatus.BAD_REQUEST),

    // User
    USER_EXISTED(400, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(404, "User not found", HttpStatus.NOT_FOUND),
    PASSWORD_INVALID(400, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    NOT_FOUND(404, "Not Found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(404, "Role not found", HttpStatus.NOT_FOUND),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}
