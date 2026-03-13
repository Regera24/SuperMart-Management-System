package mss.smms.customer.service.impl;

import lombok.RequiredArgsConstructor;
import mss.smms.customer.dto.request.CustomerCreateRequest;
import mss.smms.customer.dto.request.CustomerUpdateRequest;
import mss.smms.customer.dto.response.CustomerResponse;
import mss.smms.customer.entity.Customer;
import mss.smms.customer.entity.PointTransaction;
import mss.smms.customer.enums.PointTxnType;
import mss.smms.customer.exception.AppException;
import mss.smms.customer.exception.ErrorCode;
import mss.smms.customer.repository.CustomerRepository;
import mss.smms.customer.repository.PointTransactionRepository;
import mss.smms.customer.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private static final int SILVER_THRESHOLD = 200;
    private static final int GOLD_THRESHOLD = 1000;

    private final CustomerRepository customerRepository;
    private final PointTransactionRepository pointTransactionRepository;

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
        customerRepository.save(customer);
        pointTransactionRepository.save(PointTransaction.builder()
                .customer(customer)
                .pointsAmount(-points)
                .type(PointTxnType.REDEEM)
                .orderId(referenceId)
                .build());
    }

    private CustomerResponse toResponse(Customer c) {
        String tier;
        if (c.getCurrentPoints() >= GOLD_THRESHOLD) tier = "GOLD";
        else if (c.getCurrentPoints() >= SILVER_THRESHOLD) tier = "SILVER";
        else tier = "REGULAR";

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
