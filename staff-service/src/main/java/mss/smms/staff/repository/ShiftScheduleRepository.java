package mss.smms.staff.repository;

import mss.smms.staff.entity.ShiftSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftScheduleRepository extends JpaRepository<ShiftSchedule, Long> {
    Page<ShiftSchedule> findByEmployeeId(Long employeeId, Pageable pageable);
    List<ShiftSchedule> findByEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate from, LocalDate to);
    Page<ShiftSchedule> findByWorkDate(LocalDate workDate, Pageable pageable);
}
