package mss301.smms.identityservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserStatusRequest {
    @NotBlank
    String status;   // ACTIVE or LOCKED
    String reason;
}
