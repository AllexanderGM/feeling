package com.feeling.config;

import com.feeling.infrastructure.repositories.user.IUserTokenRepository;
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
    private final IUserTokenRepository tokenRepository;
    private final AuthenticationProvider authenticationProvider;

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
                    // ========================================
                    // 🔓 RUTAS PÚBLICAS
                    // ========================================
                    
                    // Sistema y documentación
                    auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/", "/system", "/health").permitAll();
                    auth.requestMatchers("/favicon.ico", "/error").permitAll();

                    // Autenticación y registro
                    auth.requestMatchers(HttpMethod.POST, "/auth/register").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/login").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/google/register").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/google/login").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/verify-email").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/resend-verification").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/forgot-password").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/reset-password").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/refresh-token").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/auth/check-email/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/auth/check-method/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/auth/status/**").permitAll();

                    // Datos de configuración (públicos para registro)
                    auth.requestMatchers("/geographic/**").permitAll();
                    auth.requestMatchers("/user-attributes", "/user-attributes/**").permitAll();
                    auth.requestMatchers("/category-interests", "/category-interests/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/tags/popular", "/tags/popular/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/tags/search", "/tags/search/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/tags/trending", "/tags/trending/**").permitAll();

                    // ========================================
                    // 🔒 RUTAS AUTENTICADAS (USUARIOS)
                    // ========================================
                    
                    // Sesión y logout
                    auth.requestMatchers(HttpMethod.POST, "/auth/logout").authenticated();
                    auth.requestMatchers(HttpMethod.GET, "/auth/session-info").authenticated();

                    // Perfil propio (self-modification controlado por filtro)
                    auth.requestMatchers(HttpMethod.GET, "/users/profile").authenticated();
                    auth.requestMatchers(HttpMethod.PUT, "/users/profile").authenticated();
                    auth.requestMatchers(HttpMethod.POST, "/users/complete-profile").authenticated();
                    auth.requestMatchers(HttpMethod.PUT, "/users/deactivate-account").authenticated();

                    // Gestión de usuarios (lectura pública para matching, modificación restringida)
                    auth.requestMatchers(HttpMethod.GET, "/users/**").authenticated();
                    auth.requestMatchers(HttpMethod.PUT, "/users/**").authenticated(); // Controlado por SelfModificationFilter
                    auth.requestMatchers(HttpMethod.PATCH, "/users/**").authenticated(); // Controlado por SelfModificationFilter

                    // Tags de usuario
                    auth.requestMatchers("/users/tags/**").authenticated();

                    // Matching y búsquedas
                    auth.requestMatchers("/matches/**").authenticated();
                    auth.requestMatchers("/users/search").authenticated();
                    auth.requestMatchers("/users/suggestions").authenticated();

                    // Eventos (lectura pública, creación/modificación autenticada)
                    auth.requestMatchers(HttpMethod.GET, "/api/events/**").permitAll(); // Eventos públicos
                    auth.requestMatchers(HttpMethod.POST, "/api/events/**").authenticated();
                    auth.requestMatchers(HttpMethod.PUT, "/api/events/**").authenticated();
                    auth.requestMatchers(HttpMethod.DELETE, "/api/events/**").authenticated();

                    // Reservas
                    auth.requestMatchers("/api/bookings/**").authenticated();

                    // Sistema de soporte y quejas
                    auth.requestMatchers(HttpMethod.POST, "/api/support/complaints").authenticated();
                    auth.requestMatchers(HttpMethod.GET, "/api/support/my-complaints").authenticated();
                    auth.requestMatchers(HttpMethod.GET, "/api/support/my-complaints/**").authenticated(); // SelfModificationFilter aplica

                    // ========================================
                    // 👑 RUTAS ADMINISTRATIVAS (ADMIN)
                    // ========================================
                    
                    // Panel administrativo general
                    auth.requestMatchers("/api/admin/**").hasRole("ADMIN");
                    
                    // Gestión de usuarios (admin)
                    auth.requestMatchers(HttpMethod.GET, "/api/admin/users/**").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/api/admin/users/*/approve").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/api/admin/users/*/revoke-approval").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/api/admin/users/*/reactivate").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/api/admin/users/**").hasRole("ADMIN");
                    
                    // Gestión de roles (admin)
                    auth.requestMatchers(HttpMethod.PUT, "/api/admin/users/*/grant-admin").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/api/admin/users/*/revoke-admin").hasRole("ADMIN");

                    // Sistema de soporte (admin)
                    auth.requestMatchers(HttpMethod.GET, "/api/support/admin/**").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/api/support/admin/**").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/api/support/admin/**").hasRole("ADMIN");

                    // Eventos (admin)
                    auth.requestMatchers("/api/admin/events/**").hasRole("ADMIN");

                    // Rutas de gestión legacy (admin)
                    auth.requestMatchers(HttpMethod.POST, "/users/{id}/admin").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/users/{id}/admin").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/users/{id}").hasRole("ADMIN");

                    // ========================================
                    // 🔒 CUALQUIER OTRA RUTA REQUIERE AUTENTICACIÓN
                    // ========================================
                    auth.anyRequest().authenticated();
                })
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(management ->
                        management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        // Prevenir que la página se renderice en iframes (protección XSS)
                        .frameOptions(frameOptionsConfig -> frameOptionsConfig.deny())
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