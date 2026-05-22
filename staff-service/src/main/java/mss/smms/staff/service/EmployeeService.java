package mss.smms.staff.service;

import mss.smms.staff.dto.request.EmployeeCreateRequest;
import mss.smms.staff.dto.request.EmployeeUpdateRequest;
import mss.smms.staff.dto.response.DepartmentResponse;
import mss.smms.staff.dto.response.EmployeeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {
    EmployeeResponse createEmployee(EmployeeCreateRequest request);
    EmployeeResponse getEmployee(Long id);
    EmployeeResponse getEmployeeByAccountId(String accountId);
    Page<EmployeeResponse> searchEmployees(String query, Pageable pageable);
    Page<EmployeeResponse> getAllEmployees(Pageable pageable);
    EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request);
    void deleteEmployee(Long id);

    // Department operations
    DepartmentResponse createDepartment(String name, String description);
    List<DepartmentResponse> getAllDepartments();
}
