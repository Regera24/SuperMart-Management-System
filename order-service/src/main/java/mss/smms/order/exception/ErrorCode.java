package mss.smms.order.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    ORDER_NOT_FOUND(404, "Order not found", HttpStatus.NOT_FOUND),
    ORDER_ALREADY_CANCELLED(400, "Order is already cancelled", HttpStatus.BAD_REQUEST),
    STOCK_INSUFFICIENT(400, "Insufficient stock for one or more items", HttpStatus.BAD_REQUEST),
    PAYMENT_FAILED(402, "Payment processing failed", HttpStatus.PAYMENT_REQUIRED),
    INVENTORY_SERVICE_UNAVAILABLE(503, "Inventory service is temporarily unavailable. Please try again later.", HttpStatus.SERVICE_UNAVAILABLE),
    ORDER_SAGA_IN_PROGRESS(409, "Order saga is already in progress", HttpStatus.CONFLICT),
    ORDER_ALREADY_COMPLETED(400, "Order is already completed", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
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
