package mss.smms.order.repository;

import mss.smms.order.entity.Order;
import mss.smms.order.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    Page<Order> findByCashierId(UUID cashierId, Pageable pageable);
    Page<Order> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
}
