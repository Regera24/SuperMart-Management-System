package mss.smms.staff.repository;

import mss.smms.staff.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByAccountId(String accountId);
    boolean existsByAccountId(String accountId);

    @Query("SELECT e FROM Employee e WHERE e.fullName LIKE %:q% OR e.phone LIKE %:q% OR e.email LIKE %:q%")
    Page<Employee> search(@Param("q") String query, Pageable pageable);
}
