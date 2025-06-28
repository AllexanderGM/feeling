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
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
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
                    // 🔹Rutas para Swagger/OpenAPI y sistema
                    auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/", "/system", "/health").permitAll();
                    auth.requestMatchers("/favicon.ico", "/error").permitAll();

                    // 🔹RUTAS DE AUTENTICACIÓN (PÚBLICAS) - CORREGIDAS
                    auth.requestMatchers(HttpMethod.POST, "/auth/register").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/login").permitAll();

                    // 🔹Rutas Google OAuth actualizadas
                    auth.requestMatchers(HttpMethod.POST, "/auth/google/register").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/google/login").permitAll();

                    // 🔹Verificación de email
                    auth.requestMatchers(HttpMethod.POST, "/auth/verify-email").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/resend-verification").permitAll();

                    // 🔹Recuperación de contraseña
                    auth.requestMatchers(HttpMethod.POST, "/auth/forgot-password").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/reset-password").permitAll();

                    // 🔹Refresh token debe ser PÚBLICO (no autenticado)
                    auth.requestMatchers(HttpMethod.POST, "/auth/refresh-token").permitAll();

                    // 🔹Verificación de email y métodos
                    auth.requestMatchers(HttpMethod.GET, "/auth/check-email/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/auth/check-method/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/auth/status/**").permitAll();

                    // 🔹 Rutas de ubicaciones (públicas)
                    auth.requestMatchers("/geographic/**").permitAll();

                    // 🔹 Rutas de atributos de usuario (públicas)
                    auth.requestMatchers("/user-attributes/**").permitAll();

                    // 🔹 Rutas para categorías de interés (públicas)
                    auth.requestMatchers("/category-interests/**").permitAll();

                    // 🔹 Rutas para tags populares (públicas)
                    auth.requestMatchers(HttpMethod.GET, "/tags/popular").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/tags/search").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/tags/popular/category/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/tags/trending").permitAll();

                    // 🔹 RUTAS PROTEGIDAS PARA USUARIOS AUTENTICADOS
                    // Logout (requiere autenticación)
                    auth.requestMatchers(HttpMethod.POST, "/auth/logout").authenticated();

                    // Perfil de usuario
                    auth.requestMatchers(HttpMethod.GET, "/users/profile").authenticated();
                    auth.requestMatchers(HttpMethod.PUT, "/users/profile").authenticated();
                    auth.requestMatchers(HttpMethod.POST, "/users/complete-profile").authenticated();

                    // Tags de usuario
                    auth.requestMatchers("/users/tags/**").authenticated();

                    // Matching y búsquedas
                    auth.requestMatchers("/matches/**").authenticated();
                    auth.requestMatchers("/users/search").authenticated();

                    // 🔹 RUTAS PROTEGIDAS PARA ADMINISTRADORES
                    auth.requestMatchers("/admin/**").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.POST, "/users/{id}/admin").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/users/{id}/admin").hasRole("ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN");

                    // 🔹 Cualquier otra ruta requiere autenticación
                    auth.anyRequest().authenticated();
                })
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(management ->
                        management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(loggingFilter, JwtAuthFilter.class)
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

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/swagger-ui.html",
                "/favicon.ico",
                "/error"
        );
    }
}