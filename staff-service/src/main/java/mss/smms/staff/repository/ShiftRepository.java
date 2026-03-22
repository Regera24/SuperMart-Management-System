package mss.smms.staff.repository;

import mss.smms.staff.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Integer> {
    boolean existsByShiftName(String shiftName);
}
