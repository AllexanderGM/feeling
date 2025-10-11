package com.feeling.config.security;

import com.feeling.packages.auth.infrastructure.repositories.IAuthTokenRepository;
import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final Filter loggingFilter;
    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final SelfModificationAuthorizationFilter selfModificationAuthorizationFilter;
    private final IAuthTokenRepository tokenRepository;
    private final AuthenticationProvider authenticationProvider;
    private final RouteSecurityConfig routeSecurityConfig;

    private static final String[] SWAGGER_ENDPOINTS = {
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/swagger-ui.html"
    };

    private static final String[] AUTH_PUBLIC_POST_ENDPOINTS = {
        "/auth/register",
        "/auth/verify-email",
        "/auth/resend-verification",
        "/auth/login",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/refresh-token",
        "/auth/password/forgot",
        "/auth/password/reset",
        "/auth/password/validate",
        "/auth/password/check-compromised",
        "/auth/verification/verify-email",
        "/auth/verification/resend-code",
        "/auth/oauth/google/register",
        "/auth/oauth/google/login",
        "/auth/oauth/facebook/register",
        "/auth/oauth/facebook/login",
        "/auth/oauth/apple/register",
        "/auth/oauth/apple/login"
    };

    private static final String[] AUTH_PUBLIC_GET_ENDPOINTS = {
        "/auth/check-auth-method/**",
        "/auth/check-email/**",
        "/auth/validate-reset-token/**",
        "/auth/status/**",
        "/auth/password/suggestions",
        "/auth/password/policy",
        "/auth/verification/check-email/**",
        "/auth/verification/status/**",
        "/auth/verification/validate-code",
        "/auth/oauth/providers",
        "/auth/oauth/methods/**"
    };

    private static final String[] AUTH_AUTHENTICATED_POST_ENDPOINTS = {
        "/auth/logout",
        "/auth/password/change",
        "/auth/oauth/unlink/**"
    };

    private static final String[] AUTH_AUTHENTICATED_GET_ENDPOINTS = {
        "/auth/session-info"
    };

    private static final String[] COMPLAINT_CLIENT_GET_ENDPOINTS = {
        "/complaints/me",
        "/complaints/me/**"
    };

    private static final String[] COMPLAINT_CLIENT_POST_ENDPOINTS = {
        "/complaints"
    };

    private static final String[] COMPLAINT_ADMIN_GET_ENDPOINTS = {
        "/complaints",
        "/complaints/stats",
        "/complaints/pending",
        "/complaints/urgent",
        "/complaints/overdue",
        "/complaints/resolved",
        "/complaints/type/**",
        "/complaints/priority/**"
    };

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Configurar los orígenes permitidos
        configuration.setAllowedOriginPatterns(List.of(allowedOrigins));

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Headers permitidos
        configuration.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));

        // Headers expuestos al cliente
        configuration.setExposedHeaders(List.of(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));

        // Permitir credenciales (cookies, headers de autorización, etc.)
        configuration.setAllowCredentials(true);

        // Tiempo de cache para preflight requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .cors(Customizer.withDefaults())
            .exceptionHandling(exceptionHandling ->
                exceptionHandling.authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint()))
            .authorizeHttpRequests(auth -> {
                configurePublicRoutes(auth);
                configureAuthRoutes(auth);
                configureUserRoutes(auth);
                configureMatchRoutes(auth);
                configureEventRoutes(auth);
                configureBookingRoutes(auth);
                configureSupportRoutes(auth);
                configureComplaintRoutes(auth);
                configureAdministrativeRoutes(auth);
                auth.anyRequest().authenticated();
            })
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(management ->
                management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                    // Prevenir que la página se renderice en iframes (protección XSS)
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                    // Forzar detección de tipo MIME para prevenir ataques de tipo confusion
                    .contentTypeOptions(Customizer.withDefaults())
                    // Habilitar HSTS (HTTP Strict Transport Security)
                    .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                        .maxAgeInSeconds(31536000) // 1 año
                        .includeSubDomains(true))
                    // Política de referrer para proteger información sensible
                    .referrerPolicy(policy -> policy.policy(
                        org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                // Headers personalizados adicionales se manejan en WebSecurityCustomizer
            )
            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(selfModificationAuthorizationFilter, JwtAuthFilter.class)
            .addFilterAfter(loggingFilter, SelfModificationAuthorizationFilter.class)
            .addFilterBefore(securityHeadersFilter(), UsernamePasswordAuthenticationFilter.class)
            .authenticationProvider(authenticationProvider)
            .logout(logout -> logout
                .logoutUrl("/auth/logout")
                .addLogoutHandler((request, response, authentication) -> {
                    final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
                    // Manejar errores en logout
                    try {
                        logout(authHeader);
                    } catch (Exception e) {
                        // Log error pero no fallar el logout
                        System.err.println("Error en logout: " + e.getMessage());
                    }
                })
                .logoutSuccessHandler((request, response, authentication) -> {
                    SecurityContextHolder.clearContext();
                    response.setStatus(200);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\": \"Logout exitoso\"}");
                })
            )
            .build();
    }

    private void configurePublicRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers(SWAGGER_ENDPOINTS).permitAll();
        routeSecurityConfig.getAllPublicRoutes().forEach(route -> auth.requestMatchers(route).permitAll());
        auth.requestMatchers(HttpMethod.GET, AUTH_PUBLIC_GET_ENDPOINTS).permitAll();
        auth.requestMatchers(HttpMethod.POST, AUTH_PUBLIC_POST_ENDPOINTS).permitAll();
    }

    private void configureAuthRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers(HttpMethod.POST, AUTH_AUTHENTICATED_POST_ENDPOINTS).authenticated();
        auth.requestMatchers(HttpMethod.GET, AUTH_AUTHENTICATED_GET_ENDPOINTS).authenticated();
    }

    private void configureUserRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers(HttpMethod.GET, "/user", "/user/**").authenticated();
        auth.requestMatchers(HttpMethod.PUT, "/user", "/user/**").authenticated();
        auth.requestMatchers(HttpMethod.PATCH, "/user/**").authenticated();
        auth.requestMatchers(HttpMethod.POST, "/user/complete-profile").authenticated();
        auth.requestMatchers(HttpMethod.PUT, "/user/deactivate").authenticated();
        auth.requestMatchers("/user-tags/**").authenticated();
    }

    private void configureMatchRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers("/matches/**").authenticated();
        auth.requestMatchers("/user/suggestions").authenticated();
    }

    private void configureEventRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers(HttpMethod.GET, "/events/**").permitAll();
        auth.requestMatchers(HttpMethod.POST, "/events/**").authenticated();
        auth.requestMatchers(HttpMethod.PUT, "/events/**").authenticated();
        auth.requestMatchers(HttpMethod.DELETE, "/events/**").authenticated();
    }

    private void configureBookingRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers("/bookings/**").authenticated();
    }

    private void configureSupportRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers(HttpMethod.POST, "/support/complaints").authenticated();
        auth.requestMatchers(HttpMethod.GET, "/support/my-complaints", "/support/my-complaints/**").authenticated();
    }

    private void configureComplaintRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers(HttpMethod.GET, COMPLAINT_CLIENT_GET_ENDPOINTS).authenticated();
        auth.requestMatchers(HttpMethod.POST, COMPLAINT_CLIENT_POST_ENDPOINTS).authenticated();
        auth.requestMatchers(HttpMethod.GET, COMPLAINT_ADMIN_GET_ENDPOINTS).hasAuthority("ADMIN");
        auth.requestMatchers(HttpMethod.PUT, "/complaints/**").hasAuthority("ADMIN");
        auth.requestMatchers(HttpMethod.DELETE, "/complaints/**").hasAuthority("ADMIN");
    }

    private void configureAdministrativeRoutes(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        routeSecurityConfig.getAllAdminRoutes().forEach(route ->
            auth.requestMatchers(route).hasAuthority("ADMIN"));
    }

    /**
     * Manejo de logout con mejor control de errores
     */
    private void logout(final String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Token no válido");
        }

        final String jwtToken = token.substring(7);

        // Revocar solo si existe, no fallar si no existe
        tokenRepository.findByToken(jwtToken).ifPresent(foundToken -> {
            foundToken.setExpired(true);
            foundToken.setRevoked(true);
            tokenRepository.save(foundToken);
        });
    }


    /**
     * Filtro para agregar headers de seguridad adicionales
     */
    @Bean
    public Filter securityHeadersFilter() {
        return (request, response, chain) -> {
            jakarta.servlet.http.HttpServletResponse httpResponse = (jakarta.servlet.http.HttpServletResponse) response;

            // Content Security Policy
            httpResponse.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data: https:; " +
                    "font-src 'self' https:; " +
                    "connect-src 'self' https:");

            // Headers adicionales de seguridad
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");

            chain.doFilter(request, response);
        };
    }
}
