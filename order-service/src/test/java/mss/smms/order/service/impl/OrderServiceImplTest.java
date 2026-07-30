package mss.smms.order.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import mss.smms.order.client.InventoryClientWrapper;
import mss.smms.order.dto.request.CheckoutItemRequest;
import mss.smms.order.dto.request.CheckoutRequest;
import mss.smms.order.dto.response.ApiResponse;
import mss.smms.order.enums.PaymentMethod;
import mss.smms.order.exception.AppException;
import mss.smms.order.exception.ErrorCode;
import mss.smms.order.repository.OrderRepository;
import mss.smms.order.repository.OutboxEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    OrderRepository orderRepository;
    @Mock
    OutboxEventRepository outboxEventRepository;
    @Mock
    InventoryClientWrapper inventoryClient;

    ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    OrderServiceImpl service;

    @Test
    void checkoutRejectsInsufficientStockBeforeCreatingOrder() {
        CheckoutRequest request = checkoutRequest();
        when(inventoryClient.getStock(1L, "SKU-1")).thenReturn(ApiResponse.builder()
                .code(200)
                .data(Map.of("quantityOnHand", 2))
                .build());

        assertThatThrownBy(() -> service.checkout(request, UUID.randomUUID()))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.STOCK_INSUFFICIENT);

        verify(orderRepository, never()).save(any());
        verify(outboxEventRepository, never()).save(any());
    }

    private CheckoutRequest checkoutRequest() {
        CheckoutItemRequest item = new CheckoutItemRequest();
        item.setProductSku("SKU-1");
        item.setProductName("Milk");
        item.setQuantity(3);
        item.setUnitPrice(new BigDecimal("12000"));

        CheckoutRequest request = new CheckoutRequest();
        request.setWarehouseId(1L);
        request.setItems(List.of(item));
        request.setPaymentMethod(PaymentMethod.CASH);
        return request;
    }
}
