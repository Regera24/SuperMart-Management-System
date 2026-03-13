package mss.smms.staff.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeCreateRequest {
    @NotNull(message = "accountId is required")
    Long accountId;
    @NotBlank(message = "fullName is required")
    String fullName;
    String phone;
    String email;
    String address;
    String taxCode;
    String bankAccountNumber;
    BigDecimal baseSalary;
    Long departmentId;
}
