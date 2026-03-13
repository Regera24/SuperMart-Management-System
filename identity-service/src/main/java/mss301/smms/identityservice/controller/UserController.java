package mss301.smms.identityservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss301.smms.identityservice.dto.request.*;
import mss301.smms.identityservice.dto.response.ApiResponse;
import mss301.smms.identityservice.dto.response.PageResponse;
import mss301.smms.identityservice.dto.response.UserResponse;
import mss301.smms.identityservice.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final AccountService accountService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        PageResponse<UserResponse> data = accountService.getUsers(page, size, role, search);
        return ResponseEntity.ok(ApiResponse.<PageResponse<UserResponse>>builder()
                .code(200).message("OK").data(data).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        UserResponse user = accountService.createUser(request);
        return ResponseEntity.status(201).body(ApiResponse.<UserResponse>builder()
                .code(201).message("User created").data(user).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @RequestBody UserUpdateRequest request) {
        UserResponse user = accountService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(200).message("User updated").data(user).build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable String id,
            @RequestBody UserStatusRequest request) {
        UserResponse user = accountService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(200).message("Status updated").data(user).build());
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String userId = authentication.getName(); // JWT subject = userId
        accountService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Password changed successfully").build());
    }
}
