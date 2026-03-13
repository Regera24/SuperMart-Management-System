package mss.smms.staff.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import mss.smms.staff.dto.request.EmployeeCreateRequest;
import mss.smms.staff.dto.request.EmployeeUpdateRequest;
import mss.smms.staff.dto.response.DepartmentResponse;
import mss.smms.staff.dto.response.EmployeeResponse;
import mss.smms.staff.entity.Department;
import mss.smms.staff.entity.Employee;
import mss.smms.staff.exception.AppException;
import mss.smms.staff.exception.ErrorCode;
import mss.smms.staff.repository.DepartmentRepository;
import mss.smms.staff.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeServiceImpl implements EmployeeService {

    EmployeeRepository employeeRepository;
    DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        if (employeeRepository.existsByAccountId(request.getAccountId())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        }
        Employee employee = Employee.builder()
                .accountId(request.getAccountId())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .taxCode(request.getTaxCode())
                .bankAccountNumber(request.getBankAccountNumber())
                .baseSalary(request.getBaseSalary())
                .department(department)
                .build();
        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public EmployeeResponse getEmployee(Long id) {
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return toResponse(e);
    }

    @Override
    public EmployeeResponse getEmployeeByAccountId(Long accountId) {
        Employee e = employeeRepository.findByAccountId(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return toResponse(e);
    }

    @Override
    public Page<EmployeeResponse> searchEmployees(String query, Pageable pageable) {
        return employeeRepository.search(query, pageable).map(this::toResponse);
    }

    @Override
    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (request.getFullName() != null) e.setFullName(request.getFullName());
        if (request.getPhone() != null) e.setPhone(request.getPhone());
        if (request.getEmail() != null) e.setEmail(request.getEmail());
        if (request.getAddress() != null) e.setAddress(request.getAddress());
        if (request.getTaxCode() != null) e.setTaxCode(request.getTaxCode());
        if (request.getBankAccountNumber() != null) e.setBankAccountNumber(request.getBankAccountNumber());
        if (request.getBaseSalary() != null) e.setBaseSalary(request.getBaseSalary());
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            e.setDepartment(dept);
        }
        return toResponse(employeeRepository.save(e));
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) throw new AppException(ErrorCode.NOT_FOUND);
        employeeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public DepartmentResponse createDepartment(String name, String description) {
        if (departmentRepository.existsByName(name)) {
            throw new AppException(ErrorCode.USER_EXISTED); // reuse for duplicate
        }
        Department d = departmentRepository.save(Department.builder().name(name).description(description).build());
        return toDeptResponse(d);
    }

    @Override
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::toDeptResponse).collect(Collectors.toList());
    }

    // ---- helpers ----
    private EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .accountId(e.getAccountId())
                .fullName(e.getFullName())
                .phone(e.getPhone())
                .email(e.getEmail())
                .address(e.getAddress())
                .taxCode(e.getTaxCode())
                .bankAccountNumber(e.getBankAccountNumber())
                .baseSalary(e.getBaseSalary())
                .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .build();
    }

    private DepartmentResponse toDeptResponse(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId()).name(d.getName()).description(d.getDescription()).build();
    }
}
