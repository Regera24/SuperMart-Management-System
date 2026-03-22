package mss.smms.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Adds security response headers to every Gateway response.
 * Best practice headers for XSS, clickjacking, MIME-sniffing, and HSTS.
 */
@Component
public class SecurityHeadersFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            HttpHeaders headers = exchange.getResponse().getHeaders();

            // Prevent MIME-sniffing
            headers.set("X-Content-Type-Options", "nosniff");

            // Prevent clickjacking
            headers.set("X-Frame-Options", "DENY");

            // XSS protection (legacy browsers)
            headers.set("X-XSS-Protection", "1; mode=block");

            // Referrer policy
            headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

            // Content Security Policy — basic
            headers.set("Content-Security-Policy", "default-src 'self'");

            // HSTS (enable in production when using HTTPS)
            // headers.set("Strict-Transport-Security",
            //         "max-age=31536000; includeSubDomains; preload");
        }));
    }

    @Override
    public int getOrder() {
        // Run after all other filters
        return Ordered.LOWEST_PRECEDENCE;
    }
}
