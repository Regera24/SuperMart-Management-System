package mss.smms.order.enums;

public enum OrderStatus {
    // Saga states
    PENDING,               // Order created, saga started
    STOCK_RESERVING,       // Reserve stock command sent
    STOCK_RESERVED,        // Inventory reserved successfully
    STOCK_RESERVE_FAILED,  // Inventory reservation failed
    COMPLETED,             // Saga completed successfully

    // Cancellation states
    CANCELLING,            // Cancel saga in progress
    CANCELLED,             // Fully cancelled + compensated

    RETURNED
}
