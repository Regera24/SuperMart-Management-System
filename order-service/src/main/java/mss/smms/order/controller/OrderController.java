package mss.smms.order.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.order.dto.request.CheckoutRequest;
import mss.smms.order.dto.response.ApiResponse;
import mss.smms.order.dto.response.OrderResponse;
import mss.smms.order.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        OrderResponse order = orderService.checkout(request, UUID.fromString(userId));
        return ResponseEntity.status(201).body(ApiResponse.<OrderResponse>builder()
                .code(201).message("Order created").data(order).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID cashierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        Page<OrderResponse> data = orderService.getOrders(status, cashierId, from, to,
                PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.<Page<OrderResponse>>builder()
                .code(200).message("OK").data(data).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200).message("OK").data(orderService.getOrderById(id)).build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200).message("Order cancelled")
                .data(orderService.cancelOrder(id)).build());
    }
}
