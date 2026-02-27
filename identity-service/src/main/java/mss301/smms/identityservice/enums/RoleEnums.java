package mss301.smms.identityservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum RoleEnums {
    ADMIN("ADMIN"),MANAGER("MANAGER"),CASHIER("CASHIER");
    private String value;
}
