package mss.smms.staff.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "shift_schedules", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "shift_id", "work_date"}, name = "uk_employee_shift_workdate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @OneToMany(mappedBy = "shiftSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AttendanceLog> attendanceLogs = new HashSet<>();
}
