package mss.smms.customer.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponse {
    Long id;
    String fullName;         // Customer.fullName
    String phone;            // Customer.phone
    LocalDate dob;           // Customer.dob
    Integer currentPoints;   // Customer.currentPoints
    String tier;             // Computed: REGULAR / SILVER / GOLD / DIAMOND
    BigDecimal totalSpent;   // Customer.totalSpent
    LocalDateTime createdAt; // Customer.createdAt
}
