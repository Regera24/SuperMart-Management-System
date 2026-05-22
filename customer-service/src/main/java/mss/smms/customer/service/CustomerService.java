package mss.smms.customer.service;

import mss.smms.customer.dto.request.CustomerCreateRequest;
import mss.smms.customer.dto.request.CustomerUpdateRequest;
import mss.smms.customer.dto.response.CustomerResponse;
import mss.smms.customer.dto.response.PointTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerCreateRequest request);
    CustomerResponse getById(Long id);
    CustomerResponse getByPhone(String phone);
    Page<CustomerResponse> getCustomers(String search, Pageable pageable);
    CustomerResponse updateCustomer(Long id, CustomerUpdateRequest request);
    void addPoints(Long customerId, int points, String referenceId);
    void deductPoints(Long customerId, int points, String referenceId);
    Page<PointTransactionResponse> getPointHistory(Long customerId, Pageable pageable);
    int earnFromOrder(Long customerId, java.math.BigDecimal orderAmount, String orderCode);
}
