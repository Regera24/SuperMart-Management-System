package mss.smms.staff.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeUpdateRequest {
    String fullName;
    String phone;
    String email;
    String address;
    String taxCode;
    String bankAccountNumber;
    BigDecimal baseSalary;
    Long departmentId;
}
