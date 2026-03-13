package mss301.smms.identityservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss301.smms.identityservice.dto.request.*;
import mss301.smms.identityservice.dto.response.TokenResponse;
import mss301.smms.identityservice.entity.User;
import mss301.smms.identityservice.exception.AppException;
import mss301.smms.identityservice.exception.ErrorCode;
import mss301.smms.identityservice.repository.UserRepository;
import mss301.smms.identityservice.service.AuthenticationService;
import mss301.smms.identityservice.service.LoginAttemptService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final LoginAttemptService loginAttemptService;

    // Simple in-memory OTP store: email -> {otp, expiry}
    private final Map<String, String[]> otpStore = new HashMap<>();

    // Simple blacklist for logged-out access tokens (jti -> expiry)
    private final Set<String> tokenBlacklist = Collections.synchronizedSet(new HashSet<>());

    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    @Value("${app.jwtRefreshExpirationMs}")
    private long jwtRefreshExpirationMs;

    @Override
    public TokenResponse login(LoginRequest request) {
        if (loginAttemptService.isBlocked(request.getUsername())) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    loginAttemptService.loginFailed(request.getUsername());
                    return new AppException(ErrorCode.INVALID_CREDENTIALS);
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            loginAttemptService.loginFailed(request.getUsername());
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        loginAttemptService.loginSucceeded(request.getUsername());

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName())
                .toList();

        String accessToken = buildToken(user.getId(), user.getUsername(), roles,
                jwtExpirationMs, "access");
        String refreshToken = buildToken(user.getId(), user.getUsername(), roles,
                jwtRefreshExpirationMs, "refresh");

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessExpiresIn(jwtExpirationMs / 1000)
                .refreshExpiresIn(jwtRefreshExpirationMs / 1000)
                .build();
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        Jwt jwt = validateToken(request.getRefreshToken());
        String tokenType = jwt.getClaimAsString("type");
        if (!"refresh".equals(tokenType)) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        String userId = jwt.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<String> roles = user.getRoles().stream().map(r -> r.getName()).toList();
        String newAccessToken = buildToken(user.getId(), user.getUsername(), roles,
                jwtExpirationMs, "access");

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .accessExpiresIn(jwtExpirationMs / 1000)
                .build();
    }

    @Override
    public void logout(String accessToken) {
        try {
            Jwt jwt = jwtDecoder.decode(accessToken);
            String jti = jwt.getId();
            if (jti != null) tokenBlacklist.add(jti);
        } catch (Exception e) {
            log.warn("Logout called with invalid token: {}", e.getMessage());
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String otp = String.format("%06d", new Random().nextInt(999999));
        String expiry = String.valueOf(System.currentTimeMillis() + 5 * 60 * 1000L); // 5 min
        otpStore.put(request.getEmail(), new String[]{otp, expiry});

        // TODO: send OTP via email using JavaMailSender
        log.info("[DEV ONLY] OTP for {}: {}", request.getEmail(), otp);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String[] record = otpStore.get(request.getEmail());
        if (record == null) throw new AppException(ErrorCode.OTP_INVALID);
        if (System.currentTimeMillis() > Long.parseLong(record[1]))
            throw new AppException(ErrorCode.OTP_EXPIRED);
        if (!record[0].equals(request.getOtp()))
            throw new AppException(ErrorCode.OTP_INVALID);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpStore.remove(request.getEmail());
    }

    // ---- helpers ----

    private String buildToken(String userId, String username, List<String> roles,
                              long expirationMs, String type) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("smms")
                .subject(userId)
                .issuedAt(now)
                .expiresAt(now.plus(expirationMs, ChronoUnit.MILLIS))
                .id(UUID.randomUUID().toString())
                .claim("username", username)
                .claim("roles", roles)
                .claim("type", type)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    private Jwt validateToken(String token) {
        try {
            return jwtDecoder.decode(token);
        } catch (JwtException e) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }
    }
}
