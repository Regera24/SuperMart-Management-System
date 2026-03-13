package mss301.smms.identityservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss301.smms.identityservice.dto.request.*;
import mss301.smms.identityservice.dto.response.ApiResponse;
import mss301.smms.identityservice.dto.response.TokenResponse;
import mss301.smms.identityservice.service.AuthenticationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokens = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponse.<TokenResponse>builder()
                .code(200)
                .message("Login successful")
                .data(tokens)
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse tokens = authenticationService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.<TokenResponse>builder()
                .code(200)
                .message("Token refreshed")
                .data(tokens)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authenticationService.logout(token);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Logged out successfully")
                .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("OTP sent to email")
                .build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Password reset successfully")
                .build());
    }
}
