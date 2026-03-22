package mss.smms.staff.repository;

import mss.smms.staff.entity.Payroll;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
    Page<Payroll> findByEmployeeId(Long employeeId, Pageable pageable);
    Page<Payroll> findByMonthAndYear(Integer month, Integer year, Pageable pageable);
}
