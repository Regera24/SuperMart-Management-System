package mss.smms.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WarehouseRequest {
    @NotBlank(message = "Warehouse name is required")
    private String name;
    private String location;
}
