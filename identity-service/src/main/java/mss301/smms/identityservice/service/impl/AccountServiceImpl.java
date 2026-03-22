package mss301.smms.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss301.smms.identityservice.converter.UserConverter;
import mss301.smms.identityservice.dto.request.*;
import mss301.smms.identityservice.dto.response.PageResponse;
import mss301.smms.identityservice.dto.response.UserResponse;
import mss301.smms.identityservice.entity.Role;
import mss301.smms.identityservice.entity.User;
import mss301.smms.identityservice.exception.AppException;
import mss301.smms.identityservice.exception.ErrorCode;
import mss301.smms.identityservice.repository.RoleRepository;
import mss301.smms.identityservice.repository.UserRepository;
import mss301.smms.identityservice.service.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserConverter userConverter;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        // Auto-generate a random password
        String rawPassword = generatePassword(12);
        log.info("[DEV ONLY] Generated password for {}: {}", request.getUsername(), rawPassword);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(rawPassword))
                .roles(List.of(role))
                .build();

        userRepository.save(user);
        return userConverter.toResponse(user);
    }

    @Override
    public PageResponse<UserResponse> getUsers(int page, int size, String role, String search) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<User> userPage;

        if (role != null && !role.isBlank() && search != null && !search.isBlank()) {
            userPage = userRepository.findByRoleNameAndUsernameContaining(role, search, pageable);
        } else if (role != null && !role.isBlank()) {
            userPage = userRepository.findByRoleName(role, pageable);
        } else if (search != null && !search.isBlank()) {
            userPage = userRepository.findByUsernameContaining(search, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserResponse> content = userPage.getContent().stream()
                .map(userConverter::toResponse)
                .toList();

        return PageResponse.<UserResponse>builder()
                .content(content)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        return userConverter.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateStatus(String userId, UserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        // Status is not a field on User entity — we use the roles approach or add a status column.
        // Since adding a column would violate "do not modify entities", we use a convention:
        // We log the status change and can use the password field marker or a separate table.
        // For now, log the action (can be extended with an audit table).
        log.info("Status change for user {}: {} - Reason: {}", userId, request.getStatus(), request.getReason());
        return userConverter.toResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String generatePassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) sb.append(chars.charAt(rng.nextInt(chars.length())));
        return sb.toString();
    }
}
