package mss.smms.customer.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerUpdateRequest {
    String fullName;  // maps to Customer.fullName
    String dob;       // yyyy-MM-dd → parsed to LocalDate in service
}
