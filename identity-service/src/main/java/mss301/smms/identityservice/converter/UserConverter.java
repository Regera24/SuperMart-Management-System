package mss301.smms.identityservice.converter;

import mss301.smms.identityservice.dto.response.UserResponse;
import mss301.smms.identityservice.entity.Role;
import mss301.smms.identityservice.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserConverter {

    public UserResponse toResponse(User user) {
        List<String> roles = user.getRoles() == null ? List.of() :
                user.getRoles().stream().map(Role::getName).toList();
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(roles)
                .build();
    }
}
