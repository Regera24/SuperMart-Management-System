package mss.smms.order.service;

import mss.smms.order.dto.request.CheckoutRequest;
import mss.smms.order.dto.response.OrderResponse;
import mss.smms.order.dto.response.OrderStatisticsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface OrderService {
    OrderResponse checkout(CheckoutRequest request, UUID cashierId);
    Page<OrderResponse> getOrders(String status, UUID cashierId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    OrderResponse getOrderById(UUID orderId);
    OrderResponse cancelOrder(UUID orderId);
    Page<OrderResponse> getOrdersByCustomer(Long customerId, Pageable pageable);
    OrderStatisticsResponse getStatistics();
}
