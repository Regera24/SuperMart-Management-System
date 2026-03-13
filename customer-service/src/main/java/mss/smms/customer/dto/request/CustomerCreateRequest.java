package mss.smms.customer.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCreateRequest {
    @NotBlank String fullName;   // maps to Customer.fullName
    @NotBlank String phone;      // maps to Customer.phone
    String dob;                  // yyyy-MM-dd  → parsed to LocalDate in service
}
