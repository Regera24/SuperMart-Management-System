package mss.smms.customer.service.impl;

import lombok.RequiredArgsConstructor;
import mss.smms.customer.dto.request.CustomerCreateRequest;
import mss.smms.customer.dto.request.CustomerUpdateRequest;
import mss.smms.customer.dto.response.CustomerResponse;
import mss.smms.customer.dto.response.PointTransactionResponse;
import mss.smms.customer.entity.Customer;
import mss.smms.customer.entity.LoyaltyRule;
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
import mss.smms.customer.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final TierConfigRepository tierConfigRepository;
    private final LoyaltyRuleRepository loyaltyRuleRepository;

    @Override
    public CustomerResponse createCustomer(CustomerCreateRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        Customer customer = Customer.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .dob(request.getDob() != null ? LocalDate.parse(request.getDob()) : null)
                .currentPoints(0)
                .tierLevel(TierLevel.REGULAR)
                .build();
        return toResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse getById(Long id) {
        return toResponse(customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND)));
    }

    @Override
    public CustomerResponse getByPhone(String phone) {
        return toResponse(customerRepository.findByPhone(phone)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND)));
    }

    @Override
    public Page<CustomerResponse> getCustomers(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return customerRepository.findBySearch(search, pageable).map(this::toResponse);
        }
        return customerRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public CustomerResponse updateCustomer(Long id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        if (request.getFullName() != null) customer.setFullName(request.getFullName());
        if (request.getDob() != null) customer.setDob(LocalDate.parse(request.getDob()));
        return toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void addPoints(Long customerId, int points, String referenceId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        customer.setCurrentPoints(customer.getCurrentPoints() + points);
        updateTierLevel(customer);
        customerRepository.save(customer);
        pointTransactionRepository.save(PointTransaction.builder()
                .customer(customer)
                .pointsAmount(points)
                .type(PointTxnType.EARN)
                .orderId(referenceId)
                .build());
    }

    @Override
    @Transactional
    public void deductPoints(Long customerId, int points, String referenceId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        if (customer.getCurrentPoints() < points)
            throw new AppException(ErrorCode.INSUFFICIENT_POINTS);
        customer.setCurrentPoints(customer.getCurrentPoints() - points);
        updateTierLevel(customer);
        customerRepository.save(customer);
        pointTransactionRepository.save(PointTransaction.builder()
                .customer(customer)
                .pointsAmount(-points)
                .type(PointTxnType.REDEEM)
                .orderId(referenceId)
                .build());
    }

    @Override
    public Page<PointTransactionResponse> getPointHistory(Long customerId, Pageable pageable) {
        if (!customerRepository.existsById(customerId)) {
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        }
        return pointTransactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId, pageable)
                .map(this::toTxnResponse);
    }

    private void updateTierLevel(Customer customer) {
        int points = customer.getCurrentPoints();
        List<TierConfig> configs = tierConfigRepository.findByIsActiveTrueOrderByMinPointsAsc();

        // Walk from highest to lowest; first config whose minPoints <= customer points wins
        TierLevel resolved = TierLevel.REGULAR;
        for (TierConfig cfg : configs) {
            if (points >= cfg.getMinPoints()) {
                resolved = cfg.getTierLevel();
            }
        }
        customer.setTierLevel(resolved);
    }

    @Override
    @Transactional
    public int earnFromOrder(Long customerId, BigDecimal orderAmount, String orderCode) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        // Find best active loyalty rule
        List<LoyaltyRule> rules = loyaltyRuleRepository.findByIsActiveTrueOrderByPriorityDesc();
        LoyaltyRule applicableRule = null;
        for (LoyaltyRule rule : rules) {
            LocalDateTime now = LocalDateTime.now();
            if (rule.getStartDate() != null && now.isBefore(rule.getStartDate())) continue;
            if (rule.getEndDate() != null && now.isAfter(rule.getEndDate())) continue;
            if (rule.getMinOrderValue() != null && orderAmount.compareTo(rule.getMinOrderValue()) < 0) continue;
            applicableRule = rule;
            break;
        }

        int pointsEarned = 0;
        if (applicableRule != null && applicableRule.getPointConversionRate() != null) {
            pointsEarned = orderAmount.multiply(applicableRule.getPointConversionRate())
                    .setScale(0, java.math.RoundingMode.DOWN)
                    .intValue();
        }

        if (pointsEarned > 0) {
            customer.setCurrentPoints(customer.getCurrentPoints() + pointsEarned);
            pointTransactionRepository.save(PointTransaction.builder()
                    .customer(customer)
                    .pointsAmount(pointsEarned)
                    .type(PointTxnType.EARN)
                    .orderId(orderCode)
                    .description("Tích điểm đơn " + orderCode + " (" + orderAmount + " VND)")
                    .build());
        }

        // Update totalSpent
        BigDecimal currentTotalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO;
        customer.setTotalSpent(currentTotalSpent.add(orderAmount));

        // Update tier
        updateTierLevel(customer);
        customerRepository.save(customer);

        return pointsEarned;
    }

    private PointTransactionResponse toTxnResponse(PointTransaction t) {
        return PointTransactionResponse.builder()
                .id(t.getId())
                .pointsAmount(t.getPointsAmount())
                .type(t.getType())
                .orderId(t.getOrderId())
                .description(t.getDescription())
                .transactionDate(t.getTransactionDate())
                .build();
    }

    private CustomerResponse toResponse(Customer c) {
        String tier = c.getTierLevel() != null ? c.getTierLevel().name() : "REGULAR";

        return CustomerResponse.builder()
                .id(c.getId())
                .fullName(c.getFullName())
                .phone(c.getPhone())
                .dob(c.getDob())
                .currentPoints(c.getCurrentPoints())
                .tier(tier)
                .totalSpent(c.getTotalSpent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}

