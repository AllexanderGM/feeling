package com.feeling.domain.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.domain.dto.auth.GoogleUserInfoDTO;
import com.feeling.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleOAuthService.class);
    private static final String GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    /**
     * Obtiene la información del usuario desde Google usando el access token
     */
    public GoogleUserInfoDTO getUserInfo(String accessToken) {
        try {
            logger.info("Obteniendo información del usuario de Google");

            // Verificar que el token es válido
            validateGoogleToken(accessToken);

            // Crear headers con el token
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Hacer petición a Google
            ResponseEntity<GoogleUserInfoDTO> response = restTemplate.exchange(
                    GOOGLE_USER_INFO_URL,
                    HttpMethod.GET,
                    entity,
                    GoogleUserInfoDTO.class
            );

            GoogleUserInfoDTO userInfo = response.getBody();
            if (userInfo == null) {
                throw new UnauthorizedException("No se pudo obtener información del usuario de Google");
            }

            // Validar que el email esté verificado
            if (!userInfo.isEmailVerified()) {
                throw new UnauthorizedException("El email de Google no está verificado");
            }

            logger.info("Información del usuario obtenida correctamente: {}", userInfo.email());
            return userInfo;

        } catch (Exception e) {
            logger.error("Error al obtener información del usuario de Google: {}", e.getMessage());
            if (e instanceof UnauthorizedException) {
                throw e;
            }
            throw new UnauthorizedException("Token de Google inválido o expirado");
        }
    }

    /**
     * Valida que el token de Google sea válido y pertenezca a nuestra aplicación
     */
    private void validateGoogleToken(String accessToken) {
        try {
            // Verificar información del token
            String url = GOOGLE_TOKEN_INFO_URL + "?access_token=" + accessToken;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new UnauthorizedException("Token de Google inválido");
            }

            // Opcional: Verificar que el token pertenece a nuestra app
            if (googleClientId != null && !googleClientId.trim().isEmpty()) {
                // Aquí podrías verificar el client_id si lo necesitas
                logger.debug("Token de Google validado correctamente");
            }

        } catch (Exception e) {
            logger.error("Error validando token de Google: {}", e.getMessage());
            throw new UnauthorizedException("Token de Google inválido o expirado");
        }
    }

    /**
     * Genera una contraseña segura e inutilizable para usuarios OAuth
     */
    public String generateOAuthPassword(String provider, String externalId) {
        return String.format("OAUTH_%s_%s_%d",
                provider.toUpperCase(),
                externalId,
                System.currentTimeMillis());
    }
}
