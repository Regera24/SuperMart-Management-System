package mss301.smms.identityservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreateRequest {
    @NotBlank
    String username;
    @NotBlank @Email
    String email;
    String phone;
    @NotBlank
    String roleName; // MANAGER or CASHIER
}
