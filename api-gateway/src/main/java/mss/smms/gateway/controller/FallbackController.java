package mss.smms.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Fallback controller invoked when a Circuit Breaker in the API Gateway
 * transitions to OPEN state for any downstream service.
 * Returns a standardized 503 response so the frontend can display a friendly message.
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> serviceFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/identity", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> identityFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Identity service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/product", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> productFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Product service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/inventory", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> inventoryFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Inventory service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> orderFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Order service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> customerFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Customer service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/staff", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> staffFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Staff service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/notification", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> notificationFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Notification service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping(value = "/report", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> reportFallback() {
        return Mono.just(Map.of(
                "code", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", "Report service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
