package mss301.smms.identityservice.service.impl;

import mss301.smms.identityservice.converter.UserConverter;
import mss301.smms.identityservice.dto.request.ChangePasswordRequest;
import mss301.smms.identityservice.dto.request.UserCreateRequest;
import mss301.smms.identityservice.dto.response.UserResponse;
import mss301.smms.identityservice.entity.Role;
import mss301.smms.identityservice.entity.User;
import mss301.smms.identityservice.exception.AppException;
import mss301.smms.identityservice.exception.ErrorCode;
import mss301.smms.identityservice.repository.RoleRepository;
import mss301.smms.identityservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceImplTest {

    @Mock
    UserRepository userRepository;
    @Mock
    RoleRepository roleRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    UserConverter userConverter;

    @InjectMocks
    AccountServiceImpl service;

    @Test
    void createUserRejectsDuplicateUsernameBeforeRoleLookup() {
        UserCreateRequest request = createUserRequest();
        when(userRepository.findByUsername("cashier01")).thenReturn(Optional.of(User.builder().build()));

        assertThatThrownBy(() -> service.createUser(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.USER_EXISTED);

        verify(roleRepository, never()).findByName(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePasswordEncodesNewPasswordAfterCurrentPasswordMatches() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old-pass");
        request.setNewPassword("new-pass");
        User user = User.builder().id("u1").password("encoded-old").build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-pass", "encoded-old")).thenReturn(true);
        when(passwordEncoder.encode("new-pass")).thenReturn("encoded-new");

        service.changePassword("u1", request);

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        verify(userRepository).save(user);
    }

    @Test
    void createUserStoresEncodedGeneratedPasswordAndAssignedRole() {
        UserCreateRequest request = createUserRequest();
        Role cashierRole = Role.builder().name("CASHIER").build();
        UserResponse response = UserResponse.builder().username("cashier01").build();
        when(userRepository.findByUsername("cashier01")).thenReturn(Optional.empty());
        when(roleRepository.findByName("CASHIER")).thenReturn(Optional.of(cashierRole));
        when(passwordEncoder.encode(any(String.class))).thenReturn("encoded-generated");
        when(userConverter.toResponse(any(User.class))).thenReturn(response);

        UserResponse result = service.createUser(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getUsername()).isEqualTo("cashier01");
        assertThat(saved.getPassword()).isEqualTo("encoded-generated");
        assertThat(saved.getRoles()).containsExactly(cashierRole);
        assertThat(result).isSameAs(response);
    }

    private UserCreateRequest createUserRequest() {
        UserCreateRequest request = new UserCreateRequest();
        request.setUsername("cashier01");
        request.setEmail("cashier01@smms.test");
        request.setPhone("0900000001");
        request.setRoleName("CASHIER");
        return request;
    }
}
