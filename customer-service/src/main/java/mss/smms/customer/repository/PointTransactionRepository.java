package mss.smms.customer.repository;

import mss.smms.customer.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findByCustomerId(Long customerId);
    Page<PointTransaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId, Pageable pageable);
}

