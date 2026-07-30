package mss.smms.staff.service;

import mss.smms.staff.dto.request.EmployeeCreateRequest;
import mss.smms.staff.dto.response.EmployeeResponse;
import mss.smms.staff.entity.Department;
import mss.smms.staff.entity.Employee;
import mss.smms.staff.exception.AppException;
import mss.smms.staff.exception.ErrorCode;
import mss.smms.staff.repository.DepartmentRepository;
import mss.smms.staff.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    EmployeeRepository employeeRepository;
    @Mock
    DepartmentRepository departmentRepository;

    @InjectMocks
    EmployeeServiceImpl service;

    @Test
    void createEmployeeRejectsDuplicateAccountIdBeforeDepartmentLookup() {
        EmployeeCreateRequest request = EmployeeCreateRequest.builder()
                .accountId("acc-1")
                .fullName("Cashier One")
                .build();
        when(employeeRepository.existsByAccountId("acc-1")).thenReturn(true);

        assertThatThrownBy(() -> service.createEmployee(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.USER_EXISTED);

        verify(departmentRepository, never()).findById(any());
        verify(employeeRepository, never()).save(any());
    }

    @Test
    void createEmployeeMapsDepartmentIntoResponse() {
        Department department = Department.builder().id(3L).name("Sales").description("Front").build();
        EmployeeCreateRequest request = EmployeeCreateRequest.builder()
                .accountId("acc-2")
                .fullName("Cashier Two")
                .email("cashier2@smms.test")
                .baseSalary(new BigDecimal("7000000"))
                .departmentId(3L)
                .build();
        when(employeeRepository.existsByAccountId("acc-2")).thenReturn(false);
        when(departmentRepository.findById(3L)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee employee = invocation.getArgument(0);
            employee.setId(11L);
            return employee;
        });

        EmployeeResponse response = service.createEmployee(request);

        assertThat(response.getId()).isEqualTo(11L);
        assertThat(response.getDepartmentId()).isEqualTo(3L);
        assertThat(response.getDepartmentName()).isEqualTo("Sales");
    }
}
