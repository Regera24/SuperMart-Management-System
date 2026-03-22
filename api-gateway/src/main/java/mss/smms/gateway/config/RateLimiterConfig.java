package mss.smms.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

import java.util.Objects;

/**
 * Rate limiter configuration for the API Gateway.
 * Resolves the rate-limit key by client IP address.
 * Can be used with RequestRateLimiter filter on specific routes.
 */
@Configuration
public class RateLimiterConfig {

    /**
     * Resolves rate-limit key by client IP address.
     * Falls back to "anonymous" if IP cannot be determined.
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String ip = Objects.requireNonNull(exchange.getRequest().getRemoteAddress())
                    .getAddress().getHostAddress();
            return Mono.just(ip != null ? ip : "anonymous");
        };
    }
}
