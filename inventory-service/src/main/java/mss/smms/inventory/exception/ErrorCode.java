package mss.smms.inventory.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    STOCK_NOT_FOUND(404, "Stock record not found", HttpStatus.NOT_FOUND),
    WAREHOUSE_NOT_FOUND(404, "Warehouse not found", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK(400, "Insufficient stock", HttpStatus.BAD_REQUEST),
    NEGATIVE_STOCK_NOT_ALLOWED(400, "Stock quantity cannot go below zero", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    SUPPLIER_NOT_FOUND(404, "Supplier not found", HttpStatus.NOT_FOUND),
    SUPPLIER_ALREADY_EXISTS(409, "Supplier with this name already exists", HttpStatus.CONFLICT),
    IMPORT_RECEIPT_NOT_FOUND(404, "Import receipt not found", HttpStatus.NOT_FOUND),
    IMPORT_RECEIPT_ALREADY_APPROVED(400, "Import receipt already approved", HttpStatus.BAD_REQUEST),
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
