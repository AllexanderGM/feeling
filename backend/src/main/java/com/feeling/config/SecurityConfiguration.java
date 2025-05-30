package com.feeling.config;

import com.feeling.infrastructure.entities.user.UserToken;
import com.feeling.infrastructure.repositories.user.IUserTokenRepository;
import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

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
                    // 🔹 Rutas para Swagger/OpenAPI
                    auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll();

                    // 🔹 Rutas para el sistema
                    auth.requestMatchers(HttpMethod.GET, "/", "/system", "/health").permitAll();

                    // 🔹 Rutas de autenticación (públicas)
                    auth.requestMatchers(HttpMethod.POST, "/auth/register").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/register/google").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/login").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/login/google").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/verify-email").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/resend-verification").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/forgot-password").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/auth/reset-password").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/auth/status/**").permitAll();

                    // 🔹 Rutas para atributos (públicas para formularios de registro)
                    auth.requestMatchers(HttpMethod.GET, "/user-attributes/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/category-interests").permitAll();

                    // 🔹 Rutas para tags populares (públicas)
                    auth.requestMatchers(HttpMethod.GET, "/tags/popular").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/tags/search").permitAll();

                    // 🔹 Rutas protegidas para usuarios autenticados
                    auth.requestMatchers(HttpMethod.POST, "/auth/refresh-token").authenticated();
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

                    // 🔹 Rutas protegidas para administradores
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
                            logout(authHeader);
                        })
                        .logoutSuccessHandler((request, response, authentication) ->
                                SecurityContextHolder.clearContext())
                )
                .build();
    }

    private void logout(final String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Token no válido");
        }

        final String jwtToken = token.substring(7);
        final UserToken foundToken = tokenRepository.findByToken(jwtToken)
                .orElseThrow(() -> new IllegalArgumentException("Token no encontrado"));

        foundToken.setExpired(true);
        foundToken.setRevoked(true);
        tokenRepository.save(foundToken);
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
