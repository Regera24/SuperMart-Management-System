package mss.smms.customer.service.impl;

import mss.smms.customer.entity.Customer;
import mss.smms.customer.entity.PointTransaction;
import mss.smms.customer.entity.TierConfig;
import mss.smms.customer.enums.PointTxnType;
import mss.smms.customer.enums.TierLevel;
import mss.smms.customer.exception.AppException;
import mss.smms.customer.exception.ErrorCode;
import mss.smms.customer.repository.CustomerRepository;
import mss.smms.customer.repository.LoyaltyRuleRepository;
import mss.smms.customer.repository.PointTransactionRepository;
import mss.smms.customer.repository.TierConfigRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceImplTest {

    @Mock
    CustomerRepository customerRepository;
    @Mock
    PointTransactionRepository pointTransactionRepository;
    @Mock
    TierConfigRepository tierConfigRepository;
    @Mock
    LoyaltyRuleRepository loyaltyRuleRepository;

    @InjectMocks
    CustomerServiceImpl service;

    @Test
    void addPointsUpdatesTierAndRecordsEarnTransaction() {
        Customer customer = Customer.builder()
                .id(10L)
                .currentPoints(90)
                .tierLevel(TierLevel.REGULAR)
                .build();
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(tierConfigRepository.findByIsActiveTrueOrderByMinPointsAsc()).thenReturn(List.of(
                TierConfig.builder().tierLevel(TierLevel.REGULAR).minPoints(0).build(),
                TierConfig.builder().tierLevel(TierLevel.SILVER).minPoints(100).build()
        ));

        service.addPoints(10L, 15, "ORD-1");

        assertThat(customer.getCurrentPoints()).isEqualTo(105);
        assertThat(customer.getTierLevel()).isEqualTo(TierLevel.SILVER);
        verify(customerRepository).save(customer);
        ArgumentCaptor<PointTransaction> txnCaptor = ArgumentCaptor.forClass(PointTransaction.class);
        verify(pointTransactionRepository).save(txnCaptor.capture());
        assertThat(txnCaptor.getValue().getPointsAmount()).isEqualTo(15);
        assertThat(txnCaptor.getValue().getType()).isEqualTo(PointTxnType.EARN);
        assertThat(txnCaptor.getValue().getOrderId()).isEqualTo("ORD-1");
    }

    @Test
    void deductPointsRejectsInsufficientBalanceWithoutSaving() {
        Customer customer = Customer.builder()
                .id(10L)
                .currentPoints(20)
                .totalSpent(BigDecimal.ZERO)
                .build();
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> service.deductPoints(10L, 25, "ORD-2"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INSUFFICIENT_POINTS);

        verify(customerRepository, never()).save(any());
        verify(pointTransactionRepository, never()).save(any());
    }
}
