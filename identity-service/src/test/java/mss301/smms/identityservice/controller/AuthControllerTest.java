package mss301.smms.identityservice.controller;

import mss301.smms.identityservice.dto.response.TokenResponse;
import mss301.smms.identityservice.service.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    AuthenticationService authenticationService;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AuthController(authenticationService))
                .build();
    }

    @Test
    void loginStoresRefreshTokenInHttpOnlyCookieAndOmitsItFromBody() throws Exception {
        when(authenticationService.login(any())).thenReturn(tokenResponse("access-token", "refresh-token"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"admin\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.containsString("smms-refresh-token=refresh-token"),
                        org.hamcrest.Matchers.containsString("Path=/api/auth/refresh"),
                        org.hamcrest.Matchers.containsString("Max-Age=2592000"),
                        org.hamcrest.Matchers.containsString("HttpOnly"),
                        org.hamcrest.Matchers.containsString("Secure"),
                        org.hamcrest.Matchers.containsString("SameSite=Lax")
                )))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist());
    }

    @Test
    void refreshReadsRefreshTokenFromCookieWhenRequestBodyIsEmpty() throws Exception {
        when(authenticationService.refreshToken(any())).thenReturn(tokenResponse("new-access", "cookie-refresh"));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new MockCookie("smms-refresh-token", "cookie-refresh")))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString(
                        "smms-refresh-token=cookie-refresh")))
                .andExpect(jsonPath("$.data.accessToken").value("new-access"))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist());

        ArgumentCaptor<mss301.smms.identityservice.dto.request.RefreshTokenRequest> captor =
                ArgumentCaptor.forClass(mss301.smms.identityservice.dto.request.RefreshTokenRequest.class);
        verify(authenticationService).refreshToken(captor.capture());
        assertThat(captor.getValue().getRefreshToken()).isEqualTo("cookie-refresh");
    }

    @Test
    void logoutClearsRefreshCookieUsingSamePath() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer access-token"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.containsString("smms-refresh-token="),
                        org.hamcrest.Matchers.containsString("Path=/api/auth/refresh"),
                        org.hamcrest.Matchers.containsString("Max-Age=0"),
                        org.hamcrest.Matchers.containsString("HttpOnly"),
                        org.hamcrest.Matchers.containsString("Secure"),
                        org.hamcrest.Matchers.containsString("SameSite=Lax")
                )));

        verify(authenticationService).logout("access-token");
    }

    private TokenResponse tokenResponse(String accessToken, String refreshToken) {
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessExpiresIn(200)
                .refreshExpiresIn(2592000)
                .build();
    }
}
