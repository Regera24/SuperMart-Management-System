package mss.smms.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .authorizeExchange(exchanges -> exchanges
                // ── Public endpoints (no token needed) ──
                .pathMatchers(HttpMethod.POST,
                    "/auth/login",
                    "/auth/refresh",
                    "/auth/forgot-password",
                    "/auth/reset-password",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password"
                ).permitAll()
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/fallback/**").permitAll()

                // ── Public read-only catalog + file serving ──
                .pathMatchers(HttpMethod.GET, "/products/**", "/categories/**", "/files/**").permitAll()

                // ── ADMIN only: user management ──
                .pathMatchers(HttpMethod.GET, "/users/**").hasRole("ADMIN")
                .pathMatchers(HttpMethod.POST, "/users/**").hasAnyRole("ADMIN", "MANAGER")
                .pathMatchers(HttpMethod.PUT, "/users/**").hasRole("ADMIN")
                .pathMatchers(HttpMethod.PATCH, "/users/**").hasRole("ADMIN")

                // ── Staff self-service: any authenticated user ──
                .pathMatchers("/api/v1/staff/by-account/**").authenticated()
                .pathMatchers("/api/v1/staff/attendance/check-in").authenticated()
                .pathMatchers("/api/v1/staff/attendance/check-out/**").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/staff/attendance").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/staff/shifts/schedules").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/staff/shifts").authenticated()
                .pathMatchers(HttpMethod.POST, "/api/v1/staff/leave").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/staff/leave/my").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/staff/leave").authenticated()
                .pathMatchers(HttpMethod.GET, "/api/v1/staff/payroll/my").authenticated()

                // ── ADMIN / MANAGER: staff management (everything else) ──
                .pathMatchers("/api/v1/staff/**").hasAnyRole("ADMIN", "MANAGER")

                // ── ADMIN / MANAGER: reports ──
                .pathMatchers("/api/v1/reports/**").hasAnyRole("ADMIN", "MANAGER")

                // ── Everything else: just need a valid token ──
                .anyExchange().authenticated()
            )

            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtDecoder(reactiveJwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );

        return http.build();
    }

    @Bean
    public ReactiveJwtDecoder reactiveJwtDecoder() {
        SecretKeySpec secretKey = new SecretKeySpec(
                jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverterAdapter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

        return new ReactiveJwtAuthenticationConverterAdapter(jwtConverter);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
