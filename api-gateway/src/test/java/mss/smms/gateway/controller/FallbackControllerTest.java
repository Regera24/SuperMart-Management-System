package mss.smms.gateway.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import reactor.test.StepVerifier;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class FallbackControllerTest {

    private final FallbackController controller = new FallbackController();

    @Test
    void identityFallbackReturnsServiceUnavailablePayload() {
        StepVerifier.create(controller.identityFallback())
                .assertNext(payload -> assertPayload(payload,
                        "Identity service is temporarily unavailable. Please try again later."))
                .verifyComplete();
    }

    @Test
    void genericFallbackReturnsServiceUnavailablePayload() {
        StepVerifier.create(controller.serviceFallback())
                .assertNext(payload -> assertPayload(payload,
                        "Service is temporarily unavailable. Please try again later."))
                .verifyComplete();
    }

    private void assertPayload(Map<String, Object> payload, String message) {
        assertThat(payload)
                .containsEntry("code", HttpStatus.SERVICE_UNAVAILABLE.value())
                .containsEntry("message", message);
        assertThat(payload.get("timestamp")).isInstanceOf(String.class);
        assertThat((String) payload.get("timestamp")).isNotBlank();
    }
}
