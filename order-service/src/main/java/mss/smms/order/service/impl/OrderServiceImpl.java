package mss.smms.order.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.smms.order.client.InventoryClientWrapper;
import mss.smms.order.dto.request.CheckoutItemRequest;
import mss.smms.order.dto.request.CheckoutRequest;
import mss.smms.order.dto.response.OrderItemResponse;
import mss.smms.order.dto.response.OrderResponse;
import mss.smms.order.dto.response.OrderStatisticsResponse;
import mss.smms.order.entity.Order;
import mss.smms.order.entity.OrderItem;
import mss.smms.order.entity.OutboxEvent;
import mss.smms.order.entity.Payment;
import mss.smms.order.enums.OrderStatus;
import mss.smms.order.exception.AppException;
import mss.smms.order.exception.ErrorCode;
import mss.smms.order.repository.OrderRepository;
import mss.smms.order.repository.OutboxEventRepository;
import mss.smms.order.saga.event.ReleaseStockCommand;
import mss.smms.order.saga.event.ReserveStockCommand;
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
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    private final InventoryClientWrapper inventoryClient;

    /**
     * Creates an order with status PENDING and writes a ReserveStockCommand to the outbox table
     * in the SAME transaction. The outbox poller will publish the command to Kafka.
     *
     * <p>Pre-validates stock availability via synchronous Feign call before creating the order.
     * This provides fast feedback for out-of-stock scenarios while still using the saga
     * for the actual stock deduction (which remains the source of truth).</p>
     */
    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request, UUID cashierId) {
        // 0. Pre-validate stock availability (fast-fail before creating order)
        validateStockAvailability(request);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;

        // 1. Build order items (NO stock deduction here — that's done via saga)
        for (CheckoutItemRequest item : request.getItems()) {
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

        // 3. Create order with PENDING status (saga will advance it)
        UUID sagaId = UUID.randomUUID();
        String orderCode = "ORD-" + System.currentTimeMillis();

        Order order = Order.builder()
                .orderCode(orderCode)
                .customerId(request.getCustomerId())
                .cashierId(cashierId)
                .totalAmount(subTotal)
                .discountAmount(discount)
                .pointDiscountAmount(BigDecimal.ZERO)
                .finalAmount(finalAmount)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .note(request.getNote())
                .warehouseId(request.getWarehouseId())
                .sagaId(sagaId)
                .build();

        // Link order items
        final Order savedOrder = orderRepository.save(order);
        orderItems.forEach(item -> item.setOrder(savedOrder));
        savedOrder.setItems(orderItems);

        // 4. Create payment record (pending — will be finalized when saga completes)
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(request.getPaymentMethod())
                .amount(finalAmount)
                .transactionCode("TXN-" + UUID.randomUUID())
                .createdAt(LocalDateTime.now())
                .build();
        savedOrder.setPayments(new ArrayList<>(List.of(payment)));

        orderRepository.save(savedOrder);

        // 5. Write ReserveStockCommand to outbox (SAME transaction!)
        List<ReserveStockCommand.StockItem> stockItems = request.getItems().stream()
                .map(item -> ReserveStockCommand.StockItem.builder()
                        .productSku(item.getProductSku())
                        .quantity(item.getQuantity())
                        .build())
                .toList();

        ReserveStockCommand command = ReserveStockCommand.builder()
                .sagaId(sagaId)
                .orderId(savedOrder.getId())
                .warehouseId(request.getWarehouseId())
                .items(stockItems)
                .build();

        writeOutboxEvent(savedOrder.getId(), sagaId, "ReserveStockCommand",
                "order.commands", command);

        log.info("Order {} created (PENDING), saga {} started", savedOrder.getOrderCode(), sagaId);

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

    /**
     * Cancels an order by writing a ReleaseStockCommand to the outbox.
     * The saga will coordinate stock restoration asynchronously.
     */
    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }

        if (order.getStatus() == OrderStatus.CANCELLING) {
            throw new AppException(ErrorCode.ORDER_SAGA_IN_PROGRESS);
        }

        // Only release stock if it was reserved or order was completed
        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.STOCK_RESERVED) {
            order.setStatus(OrderStatus.CANCELLING);

            // Build release command from order items
            List<ReleaseStockCommand.StockItem> stockItems = order.getItems().stream()
                    .map(item -> ReleaseStockCommand.StockItem.builder()
                            .productSku(item.getProductSku())
                            .quantity(item.getQuantity())
                            .build())
                    .toList();

            UUID sagaId = order.getSagaId() != null ? order.getSagaId() : UUID.randomUUID();

            ReleaseStockCommand command = ReleaseStockCommand.builder()
                    .sagaId(sagaId)
                    .orderId(order.getId())
                    .warehouseId(order.getWarehouseId())
                    .items(stockItems)
                    .build();

            writeOutboxEvent(order.getId(), sagaId, "ReleaseStockCommand",
                    "order.commands", command);

            log.info("Order {} cancelling, ReleaseStockCommand sent to outbox", order.getOrderCode());
        } else {
            // PENDING or STOCK_RESERVE_FAILED — no stock to release, cancel directly
            order.setStatus(OrderStatus.CANCELLED);
            log.info("Order {} cancelled directly (no stock to release)", order.getOrderCode());
        }

        return toResponse(orderRepository.save(order), null, null);
    }

    /**
     * Writes an event to the outbox table within the current transaction.
     */
    private void writeOutboxEvent(UUID orderId, UUID sagaId, String eventType,
                                   String topic, Object payload) {
        try {
            // Wrap payload with eventType for the consumer to deserialize
            Map<String, Object> envelope = Map.of(
                    "eventType", eventType,
                    "payload", payload
            );

            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType("Order")
                    .aggregateId(orderId.toString())
                    .eventType(eventType)
                    .topic(topic)
                    .payload(objectMapper.writeValueAsString(envelope))
                    .sagaId(sagaId)
                    .build();

            outboxEventRepository.save(event);
            log.debug("Outbox event written: type={}, orderId={}", eventType, orderId);
        } catch (Exception e) {
            log.error("Failed to write outbox event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to serialize outbox event", e);
        }
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

    @Override
    public Page<OrderResponse> getOrdersByCustomer(Long customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable)
                .map(order -> toResponse(order, BigDecimal.ZERO, null));
    }

    // ───────────────────────── STATISTICS ───────────────────────────────────

    @Override
    public OrderStatisticsResponse getStatistics() {
        LocalDateTime now = LocalDateTime.now();

        // Today: 00:00 → 23:59:59
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1).minusSeconds(1);

        // Yesterday
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        LocalDateTime yesterdayEnd = todayStart.minusSeconds(1);

        // Today stats
        BigDecimal todayRevenue = orderRepository.sumFinalAmountByStatusAndCreatedAtBetween(
                OrderStatus.COMPLETED, todayStart, todayEnd);
        long todayOrders = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.COMPLETED, todayStart, todayEnd);

        // Yesterday stats
        BigDecimal yesterdayRevenue = orderRepository.sumFinalAmountByStatusAndCreatedAtBetween(
                OrderStatus.COMPLETED, yesterdayStart, yesterdayEnd);
        long yesterdayOrders = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.COMPLETED, yesterdayStart, yesterdayEnd);

        // Total stats (all time)
        BigDecimal totalRevenue = orderRepository.sumFinalAmountByStatus(OrderStatus.COMPLETED);
        long totalOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);

        // Daily revenue for last 7 days
        String[] dayNames = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};
        List<OrderStatisticsResponse.DailyRevenue> dailyList = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = todayStart.minusDays(i);
            LocalDateTime dayEnd = dayStart.plusDays(1).minusSeconds(1);
            BigDecimal rev = orderRepository.sumFinalAmountByStatusAndCreatedAtBetween(
                    OrderStatus.COMPLETED, dayStart, dayEnd);
            long cnt = orderRepository.countByStatusAndCreatedAtBetween(
                    OrderStatus.COMPLETED, dayStart, dayEnd);
            int dow = dayStart.getDayOfWeek().getValue(); // 1=Mon..7=Sun
            String label = dayNames[dow % 7]; // Sun=0 in array, Mon=1, etc.
            dailyList.add(OrderStatisticsResponse.DailyRevenue.builder()
                    .name(label + " " + dayStart.getDayOfMonth() + "/" + dayStart.getMonthValue())
                    .revenue(rev)
                    .orders(cnt)
                    .build());
        }

        // Monthly summary for current year
        int currentYear = now.getYear();
        List<OrderStatisticsResponse.MonthlySummary> monthlyList = new ArrayList<>();
        for (int m = 1; m <= now.getMonthValue(); m++) {
            LocalDateTime monthStart = LocalDateTime.of(currentYear, m, 1, 0, 0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            BigDecimal rev = orderRepository.sumFinalAmountByStatusAndCreatedAtBetween(
                    OrderStatus.COMPLETED, monthStart, monthEnd);
            long cnt = orderRepository.countByStatusAndCreatedAtBetween(
                    OrderStatus.COMPLETED, monthStart, monthEnd);
            monthlyList.add(OrderStatisticsResponse.MonthlySummary.builder()
                    .month("T" + m)
                    .revenue(rev)
                    .orders(cnt)
                    .build());
        }

        return OrderStatisticsResponse.builder()
                .todayRevenue(todayRevenue)
                .todayOrders(todayOrders)
                .yesterdayRevenue(yesterdayRevenue)
                .yesterdayOrders(yesterdayOrders)
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .dailyRevenue(dailyList)
                .monthlySummary(monthlyList)
                .build();
    }

    // ───────────────────────── STOCK PRE-VALIDATION ─────────────────────────

    /**
     * Pre-validates stock availability for all items in the checkout request.
     * Uses synchronous Feign call to inventory-service for fast feedback.
     * If inventory-service is unavailable, the validation is skipped (saga will catch it).
     */
    @SuppressWarnings("unchecked")
    private void validateStockAvailability(CheckoutRequest request) {
        List<String> errors = new ArrayList<>();

        for (CheckoutItemRequest item : request.getItems()) {
            try {
                var stockResp = inventoryClient.getStock(request.getWarehouseId(), item.getProductSku());
                if (stockResp != null && stockResp.getData() != null) {
                    // Response data is a StockResponse mapped as LinkedHashMap
                    Object data = stockResp.getData();
                    int available = 0;
                    if (data instanceof Map) {
                        Object qoh = ((Map<String, Object>) data).get("quantityOnHand");
                        if (qoh instanceof Number) {
                            available = ((Number) qoh).intValue();
                        }
                    }
                    if (item.getQuantity() > available) {
                        errors.add(String.format("SKU %s: cần %d, chỉ còn %d",
                                item.getProductSku(), item.getQuantity(), available));
                    }
                }
            } catch (AppException e) {
                if (e.getErrorCode() == ErrorCode.INVENTORY_SERVICE_UNAVAILABLE) {
                    log.warn("Inventory service unavailable for pre-validation, skipping check for SKU {}",
                            item.getProductSku());
                    return; // Skip all validation — saga will handle it
                }
                throw e;
            } catch (Exception e) {
                log.warn("Failed to pre-validate stock for SKU {}: {}", item.getProductSku(), e.getMessage());
                return; // Graceful degradation — let saga handle it
            }
        }

        if (!errors.isEmpty()) {
            String message = "Không đủ hàng tồn kho: " + String.join("; ", errors);
            throw new AppException(ErrorCode.STOCK_INSUFFICIENT, message);
        }
    }
}
