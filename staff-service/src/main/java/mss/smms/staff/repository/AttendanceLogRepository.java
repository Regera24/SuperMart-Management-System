package mss.smms.staff.repository;

import mss.smms.staff.entity.AttendanceLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    Page<AttendanceLog> findByEmployeeId(Long employeeId, Pageable pageable);
    Page<AttendanceLog> findByEmployeeIdAndCheckInTimeBetween(Long employeeId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Optional<AttendanceLog> findTopByEmployeeIdAndCheckOutTimeIsNullOrderByCheckInTimeDesc(Long employeeId);
}
