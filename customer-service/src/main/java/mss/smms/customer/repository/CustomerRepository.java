package mss.smms.customer.repository;

import mss.smms.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhone(String phone);
    boolean existsByPhone(String phone);

    @Query("SELECT c FROM Customer c WHERE c.fullName LIKE %:search% OR c.phone LIKE %:search%")
    Page<Customer> findBySearch(@Param("search") String search, Pageable pageable);
}
