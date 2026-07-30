package mss301.smms.identityservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss301.smms.identityservice.dto.request.*;
import mss301.smms.identityservice.dto.response.ApiResponse;
import mss301.smms.identityservice.dto.response.TokenResponse;
import mss301.smms.identityservice.exception.AppException;
import mss301.smms.identityservice.exception.ErrorCode;
import mss301.smms.identityservice.service.AuthenticationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping({"/auth", "/api/auth"})
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "smms-refresh-token";
    private static final String REFRESH_COOKIE_PATH = "/api/auth/refresh";
    private static final Duration REFRESH_COOKIE_MAX_AGE = Duration.ofSeconds(2_592_000);

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokens = authenticationService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(tokens.getRefreshToken()).toString())
                .body(ApiResponse.<TokenResponse>builder()
                .code(200)
                .message("Login successful")
                .data(accessTokenBody(tokens))
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshTokenCookie,
            @RequestBody(required = false) RefreshTokenRequest request) {
        RefreshTokenRequest effectiveRequest = new RefreshTokenRequest();
        effectiveRequest.setRefreshToken(resolveRefreshToken(refreshTokenCookie, request));

        TokenResponse tokens = authenticationService.refreshToken(effectiveRequest);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(tokens.getRefreshToken()).toString())
                .body(ApiResponse.<TokenResponse>builder()
                .code(200)
                .message("Token refreshed")
                .data(accessTokenBody(tokens))
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authenticationService.logout(token);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .body(ApiResponse.<Void>builder()
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

    private String resolveRefreshToken(String refreshTokenCookie, RefreshTokenRequest request) {
        if (refreshTokenCookie != null && !refreshTokenCookie.isBlank()) {
            return refreshTokenCookie;
        }
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            return request.getRefreshToken();
        }
        throw new AppException(ErrorCode.TOKEN_INVALID);
    }

    private ResponseCookie refreshCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(REFRESH_COOKIE_MAX_AGE)
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();
    }

    private TokenResponse accessTokenBody(TokenResponse tokens) {
        return TokenResponse.builder()
                .accessToken(tokens.getAccessToken())
                .accessExpiresIn(tokens.getAccessExpiresIn())
                .refreshExpiresIn(tokens.getRefreshExpiresIn())
                .build();
    }
}
