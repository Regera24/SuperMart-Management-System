package mss301.smms.identityservice.service;

import mss301.smms.identityservice.dto.request.*;
import mss301.smms.identityservice.dto.response.TokenResponse;
import org.springframework.stereotype.Service;

@Service
public interface AuthenticationService {
    TokenResponse login(LoginRequest request);
    TokenResponse refreshToken(RefreshTokenRequest request);
    void logout(String accessToken);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
