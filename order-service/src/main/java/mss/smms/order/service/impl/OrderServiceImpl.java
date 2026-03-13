package mss.smms.order.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.order.client.InventoryFeignClient;
import mss.smms.order.dto.request.CheckoutItemRequest;
import mss.smms.order.dto.request.CheckoutRequest;
import mss.smms.order.dto.response.OrderItemResponse;
import mss.smms.order.dto.response.OrderResponse;
import mss.smms.order.entity.Order;
import mss.smms.order.entity.OrderItem;
import mss.smms.order.entity.Payment;
import mss.smms.order.enums.OrderStatus;
import mss.smms.order.exception.AppException;
import mss.smms.order.exception.ErrorCode;
import mss.smms.order.repository.OrderRepository;
import mss.smms.order.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax

    private final OrderRepository orderRepository;
    private final InventoryFeignClient inventoryFeignClient;

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request, UUID cashierId) {
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;

        // 1. Deduct stock atomically for each item
        for (CheckoutItemRequest item : request.getItems()) {
            String orderId = "TMP-" + System.currentTimeMillis();
            try {
                inventoryFeignClient.deductStock(
                        request.getWarehouseId(), item.getProductSku(),
                        item.getQuantity(), orderId);
            } catch (Exception e) {
                log.error("Stock deduction failed for SKU {}: {}", item.getProductSku(), e.getMessage());
                throw new AppException(ErrorCode.STOCK_INSUFFICIENT);
            }

            BigDecimal lineTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            orderItems.add(OrderItem.builder()
                    .productSku(item.getProductSku())
                    .productName(item.getProductName())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .subTotal(lineTotal)
                    .build());
            subTotal = subTotal.add(lineTotal);
        }

        // 2. Calculate tax and discounts
        BigDecimal taxAmount = subTotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discount = request.getDiscountAmount() != null
                ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal finalAmount = subTotal.add(taxAmount).subtract(discount).setScale(2, RoundingMode.HALF_UP);

        // 3. Create order
        String orderCode = "ORD-" + System.currentTimeMillis();
        Order order = Order.builder()
                .orderCode(orderCode)
                .customerId(request.getCustomerId())
                .cashierId(cashierId)
                .totalAmount(subTotal)
                .discountAmount(discount)
                .pointDiscountAmount(BigDecimal.ZERO)
                .finalAmount(finalAmount)
                .status(OrderStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .note(request.getNote())
                .build();

        // Link order items
        final Order savedOrder = orderRepository.save(order);
        orderItems.forEach(item -> item.setOrder(savedOrder));
        savedOrder.setItems(orderItems);

        // 4. Create payment record
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(request.getPaymentMethod())
                .amount(finalAmount)
                .transactionCode("TXN-" + UUID.randomUUID())
                .createdAt(LocalDateTime.now())
                .build();
        savedOrder.setPayments(List.of(payment));

        orderRepository.save(savedOrder);

        // 5. Update order reference in transactions
        log.info("Order created: {}", savedOrder.getOrderCode());

        return toResponse(savedOrder, taxAmount, request.getPaymentMethod().name());
    }

    @Override
    public Page<OrderResponse> getOrders(String status, UUID cashierId,
                                         LocalDateTime from, LocalDateTime to, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatus(OrderStatus.valueOf(status), pageable)
                    .map(o -> toResponse(o, null, null));
        } else if (cashierId != null) {
            return orderRepository.findByCashierId(cashierId, pageable)
                    .map(o -> toResponse(o, null, null));
        } else if (from != null && to != null) {
            return orderRepository.findByCreatedAtBetween(from, to, pageable)
                    .map(o -> toResponse(o, null, null));
        }
        return orderRepository.findAll(pageable).map(o -> toResponse(o, null, null));
    }

    @Override
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return toResponse(order, null, null);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }

        // Restore stock for each item
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                try {
                    inventoryFeignClient.restoreStock(
                            1L, // default warehouse — in production, store warehouseId on order
                            item.getProductSku(),
                            item.getQuantity(),
                            order.getId().toString());
                } catch (Exception e) {
                    log.warn("Stock restore failed for SKU {}: {}", item.getProductSku(), e.getMessage());
                }
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order), null, null);
    }

    private OrderResponse toResponse(Order order, BigDecimal taxAmount, String paymentMethod) {
        List<OrderItemResponse> itemResponses = order.getItems() == null ? List.of() :
                order.getItems().stream().map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productSku(i.getProductSku())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subTotal(i.getSubTotal())
                        .build()).toList();

        String pm = paymentMethod != null ? paymentMethod :
                (order.getPayments() != null && !order.getPayments().isEmpty()
                        ? order.getPayments().get(0).getPaymentMethod().name() : null);

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomerId())
                .cashierId(order.getCashierId())
                .subTotal(order.getTotalAmount())
                .taxAmount(taxAmount)
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .paymentMethod(pm)
                .build();
    }
}
