package mss.smms.staff.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeResponse {
    Long id;
    String accountId;
    String fullName;
    String phone;
    String email;
    String address;
    String taxCode;
    String bankAccountNumber;
    BigDecimal baseSalary;
    Long departmentId;
    String departmentName;
}
