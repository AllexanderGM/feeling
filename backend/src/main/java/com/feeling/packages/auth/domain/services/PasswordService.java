package com.feeling.packages.auth.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.auth.domain.dto.auth.TokenValidationDTO;
import com.feeling.packages.auth.domain.dto.password.ChangePasswordRequestDTO;
import com.feeling.packages.auth.domain.dto.password.ForgotPasswordRequestDTO;
import com.feeling.packages.auth.domain.dto.password.PasswordValidationResultDTO;
import com.feeling.packages.auth.domain.dto.password.ResetPasswordRequestDTO;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.auth.domain.enums.PasswordStrength;
import com.feeling.packages.auth.infrastructure.entities.AuthPasswordResetToken;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import com.feeling.packages.auth.infrastructure.repositories.IAuthPasswordResetTokenRepository;
import com.feeling.packages.auth.infrastructure.repositories.IAuthTokenRepository;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.common.domain.services.email.EmailService;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Servicio especializado en gestión de contraseñas.
 * <p>
 * Responsabilidades:
 * - Recuperación de contraseñas olvidadas (forgot password)
 * - Restablecimiento de contraseñas con token
 * - Cambio de contraseña para usuarios autenticados
 * - Validación de tokens de recuperación
 * - Validación de políticas de seguridad de contraseñas
 * <p>
 * Arquitectura DDD:
 * - Capa de Dominio: Lógica de negocio de contraseñas
 * - Independiente de AuthService: Separación de responsabilidades
 * - Utiliza métodos de dominio de entidades (isValid, markAsUsed, isExpired)
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see AuthPasswordResetToken
 */
@Service
@RequiredArgsConstructor
public class PasswordService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(PasswordService.class);

    @Value("${cors.allowed.origins}")
    private String frontendUrl;

    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile(".*[@$!%*?&].*");

    private static final List<String> COMMON_PASSWORDS = List.of(
        "12345678", "password", "123456789", "qwertyui", "abc123456",
        "password123", "admin123", "welcome123", "letmein123", "monkey123",
        "dragon123", "princess123", "qwerty123", "football123", "baseball123"
    );

    private static final List<Pattern> INSECURE_PATTERNS = List.of(
        Pattern.compile("^(.)\\1{3,}$"),
        Pattern.compile("^(\\d{4,})$"),
        Pattern.compile("^([a-zA-Z]+)$"),
        Pattern.compile("^(\\d{1,2}/\\d{1,2}/\\d{2,4})$"),
        Pattern.compile("^(qwerty|asdfgh|zxcvbn|qazwsx).*$", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^(abc|123).*$", Pattern.CASE_INSENSITIVE)
    );

    private static final List<String> COMPROMISED_PASSWORDS = List.of(
        "123456", "password", "123456789", "guest", "qwerty",
        "12345678", "111111", "12345", "colonel", "abc123",
        "password1", "1234", "1234567890", "admin", "Password123"
    );

    private final IUserRepository userRepository;
    private final IAuthPasswordResetTokenRepository passwordResetTokenRepository;
    private final IAuthTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    // ==============================
    // RECUPERACIÓN DE CONTRASEÑA
    // ==============================

    /**
     * Solicita recuperación de contraseña enviando token por email.
     * <p>
     * Validaciones:
     * - Usuario debe existir
     * - Usuario debe estar verificado
     * - Usuario debe usar autenticación LOCAL (no OAuth)
     * <p>
     * Seguridad:
     * - Genera token único UUID + timestamp
     * - Expiración: 1 hora
     * - Elimina tokens anteriores
     *
     * @param request DTO con el email del usuario
     * @return Mensaje de confirmación
     * @throws NotFoundException     si el usuario no existe
     * @throws UnauthorizedException si el usuario no puede recuperar contraseña
     */
    @Transactional
    public MessageResponseDTO forgotPassword(ForgotPasswordRequestDTO request) {
        try {
            // Buscar usuario por email
            User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new NotFoundException("No encontramos ninguna cuenta asociada a este email"));

            // Verificar que el usuario esté verificado
            if (!user.isVerified()) {
                throw new UnauthorizedException("Debes verificar tu correo electrónico antes de recuperar tu contraseña");
            }

            // Verificar que sea usuario LOCAL (no OAuth)
            if (user.getUserAuthProvider() != AuthProvider.LOCAL) {
                String message = switch (user.getUserAuthProvider()) {
                    case GOOGLE ->
                        "Esta cuenta está registrada con Google. Usa 'Iniciar Sesión con Google' en su lugar.";
                    case FACEBOOK ->
                        "Esta cuenta está registrada con Facebook. Usa 'Iniciar Sesión con Facebook' en su lugar.";
                    default -> "Esta cuenta usa un método de autenticación externo.";
                };
                throw new UnauthorizedException(message);
            }

            // Generar token único
            String resetToken = generatePasswordResetToken();
            LocalDateTime expirationTime = LocalDateTime.now().plusHours(1); // 1 hora de validez

            // Eliminar tokens anteriores si existen
            passwordResetTokenRepository.deleteByUserId(user.getId());

            // Crear nuevo token de recuperación
            AuthPasswordResetToken passwordResetToken = AuthPasswordResetToken.builder()
                .token(resetToken)
                .user(user)
                .expirationTime(expirationTime)
                .used(false)
                .build();

            passwordResetTokenRepository.save(passwordResetToken);

            // Enviar email con el enlace de recuperación
            String resetLink = frontendUrl + "/reset-password/" + resetToken;
            emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getName() + " " + user.getLastName(),
                resetLink,
                60 // minutos de validez
            );

            logger.logUserOperation("password_reset_token_sent", request.email(), null);
            return new MessageResponseDTO(
                "Hemos enviado un enlace de recuperación a tu correo electrónico. " +
                    "Revisa tu bandeja de entrada y spam. El enlace expira en 1 hora."
            );

        } catch (NotFoundException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado en recuperación de contraseña", e);
            throw new RuntimeException("Error al procesar la solicitud de recuperación de contraseña");
        }
    }

    /**
     * Restablece la contraseña usando un token de recuperación válido.
     * <p>
     * Validaciones:
     * - Contraseñas deben coincidir
     * - Token debe ser válido (no usado, no expirado)
     * - Usuario debe seguir siendo LOCAL
     * <p>
     * Seguridad:
     * - Marca token como usado (previene reutilización)
     * - Revoca todas las sesiones activas
     * - Envía email de confirmación
     * - Utiliza métodos de dominio de entidad
     *
     * @param request DTO con token, nueva contraseña y confirmación
     * @return Mensaje de confirmación
     * @throws IllegalArgumentException si las contraseñas no coinciden
     * @throws UnauthorizedException    si el token es inválido
     */
    @Transactional
    public MessageResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        try {
            // Validar que las contraseñas coincidan
            if (!request.passwordsMatch()) {
                throw new IllegalArgumentException("Las contraseñas no coinciden");
            }

            // Buscar y validar token
            AuthPasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new UnauthorizedException("Token de recuperación inválido"));

            // Verificar validez del token usando método de dominio
            if (!resetToken.isValid()) {
                if (resetToken.isUsed()) {
                    throw new UnauthorizedException("Este token de recuperación ya ha sido utilizado");
                }
                if (resetToken.isExpired()) {
                    throw new UnauthorizedException("El token de recuperación ha expirado. Solicita uno nuevo.");
                }
                throw new UnauthorizedException("Token de recuperación inválido");
            }

            User user = resetToken.getUser();

            // Verificar que el usuario siga siendo LOCAL
            if (user.getUserAuthProvider() != AuthProvider.LOCAL) {
                throw new UnauthorizedException("No puedes cambiar la contraseña de una cuenta OAuth");
            }

            PasswordValidationResultDTO validationResult = validatePassword(request.password(), user.getEmail());

            if (!validationResult.isValid()) {
                String errorMessages = String.join(". ", validationResult.errors());
                throw new IllegalArgumentException("La contraseña no cumple los requisitos de seguridad: " + errorMessages);
            }

            // Actualizar contraseña
            user.setPassword(passwordEncoder.encode(request.password()));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            // Marcar token como usado usando método de dominio
            resetToken.markAsUsed();
            passwordResetTokenRepository.save(resetToken);

            // Revocar todas las sesiones activas por seguridad
            revokeAllUserAuthTokens(user);

            // Enviar email de confirmación
            try {
                emailService.sendPasswordChangeConfirmationEmail(
                    user.getEmail(),
                    user.getName() + " " + user.getLastName()
                );
            } catch (Exception emailError) {
                logger.warn("Error al enviar email de confirmación", Map.of("error", emailError.getMessage()));
            }

            logger.logUserOperation("password_reset_complete", user.getEmail(), null);
            return new MessageResponseDTO(
                "Tu contraseña ha sido restablecida exitosamente. " +
                    "Ya puedes iniciar sesión con tu nueva contraseña."
            );

        } catch (IllegalArgumentException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al restablecer contraseña", e);
            throw new RuntimeException("Error al restablecer la contraseña");
        }
    }

    /**
     * Valida un token de recuperación sin consumirlo.
     * <p>
     * Verifica:
     * - Existencia del token
     * - Estado de uso
     * - Expiración
     * - Calcula tiempo restante
     * <p>
     * Utiliza métodos de dominio de la entidad para validaciones.
     *
     * @param token Token UUID de recuperación
     * @return DTO con validez, email, mensaje y minutos restantes
     */
    public TokenValidationDTO validateResetToken(String token) {
        try {
            Optional<AuthPasswordResetToken> resetTokenOpt = passwordResetTokenRepository.findByToken(token);

            if (resetTokenOpt.isEmpty()) {
                return new TokenValidationDTO(
                    false,
                    null,
                    "Token de recuperación inválido",
                    null
                );
            }

            AuthPasswordResetToken resetToken = resetTokenOpt.get();

            // Verificar si ya fue usado usando método de dominio
            if (resetToken.isUsed()) {
                return new TokenValidationDTO(
                    false,
                    resetToken.getUser().getEmail(),
                    "Este token ya ha sido utilizado",
                    null
                );
            }

            // Verificar expiración usando método de dominio
            if (resetToken.isExpired()) {
                return new TokenValidationDTO(
                    false,
                    resetToken.getUser().getEmail(),
                    "El token ha expirado",
                    null
                );
            }

            // Calcular tiempo restante
            LocalDateTime now = LocalDateTime.now();
            long minutesRemaining = java.time.Duration.between(now, resetToken.getExpirationTime()).toMinutes();

            return new TokenValidationDTO(
                true,
                resetToken.getUser().getEmail(),
                "Token válido",
                minutesRemaining
            );

        } catch (Exception e) {
            logger.error("Error validando token de recuperación", e);
            throw new RuntimeException("Error al validar token de recuperación");
        }
    }

    // ==============================
    // CAMBIO DE CONTRASEÑA
    // ==============================

    /**
     * Cambia la contraseña de un usuario autenticado.
     * <p>
     * Validaciones:
     * - Usuario autenticado mediante JWT
     * - Contraseña actual debe ser correcta
     * - Nueva contraseña debe cumplir políticas de seguridad
     * - Contraseñas deben coincidir
     * <p>
     * Seguridad:
     * - Verifica contraseña actual antes del cambio
     * - Valida nueva contraseña contra las políticas de seguridad
     * - NO revoca sesiones (usuario sigue autenticado)
     *
     * @param request    DTO con contraseña actual, nueva y confirmación
     * @param authHeader Header Authorization con token JWT
     * @return Mensaje de confirmación
     * @throws NotFoundException        si el usuario no existe
     * @throws UnauthorizedException    si la contraseña actual es incorrecta
     * @throws IllegalArgumentException si la nueva contraseña no cumple requisitos
     */
    @Transactional
    public MessageResponseDTO changePassword(ChangePasswordRequestDTO request, String authHeader) {
        try {
            // Extraer email del token JWT
            String userEmail = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

            // Verificar que las contraseñas nuevas coincidan
            if (!request.passwordsMatch()) {
                throw new IllegalArgumentException("La nueva contraseña y su confirmación no coinciden");
            }

            // Verificar contraseña actual
            if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                logger.logAuth("change_password", userEmail, "failed - incorrect current password");
                throw new UnauthorizedException("La contraseña actual es incorrecta");
            }

            PasswordValidationResultDTO validationResult = validatePassword(request.newPassword(), user.getEmail());

            if (!validationResult.isValid()) {
                String errorMessages = String.join(". ", validationResult.errors());
                logger.logAuth("change_password", userEmail, "failed - weak password");
                throw new IllegalArgumentException("La contraseña no cumple los requisitos de seguridad: " + errorMessages);
            }

            // Verificar que no sea la misma contraseña
            if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
                throw new IllegalArgumentException("La nueva contraseña debe ser diferente a la actual");
            }

            // Cambiar contraseña
            user.setPassword(passwordEncoder.encode(request.newPassword()));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            // Enviar email de notificación (opcional)
            try {
                emailService.sendPasswordChangeConfirmationEmail(
                    user.getEmail(),
                    user.getName() + " " + user.getLastName()
                );
            } catch (Exception emailError) {
                logger.warn("Error al enviar email de confirmación", Map.of("error", emailError.getMessage()));
            }

            logger.logAuth("change_password", userEmail, "success");
            return new MessageResponseDTO("Contraseña cambiada exitosamente");

        } catch (NotFoundException | UnauthorizedException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error al cambiar contraseña", e);
            throw new RuntimeException("Error inesperado al cambiar contraseña");
        }
    }

    // ==============================
    // VALIDACIÓN DE CONTRASEÑAS
    // ==============================

    /**
     * Valida una contraseña contra las políticas de seguridad.
     * <p>
     * - Complejidad (mayúscula, minúscula, número, símbolo)
     * - Longitud (8-128 caracteres)
     * - Entropía mínima
     * - Contraseñas comunes
     * - Patrones inseguros
     * - Información personal del usuario
     *
     * @param password  Contraseña a validar
     * @param userEmail Email del usuario (para validar contra información personal)
     * @return Resultado con validez, errores, sugerencias y fuerza
     */
    public PasswordValidationResultDTO validatePassword(String password, String userEmail) {
        List<String> errors = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (password == null || password.length() < 8) {
            errors.add("La contraseña debe tener al menos 8 caracteres");
            suggestions.add("Usa una combinación de letras, números y símbolos");
        }

        if (password != null && password.length() > 128) {
            errors.add("La contraseña no puede exceder 128 caracteres");
        }

        if (password != null) {
            if (!LOWERCASE_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos una letra minúscula");
                suggestions.add("Agrega letras minúsculas como: a, b, c");
            }

            if (!UPPERCASE_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos una letra mayúscula");
                suggestions.add("Agrega letras mayúsculas como: A, B, C");
            }

            if (!DIGIT_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos un número");
                suggestions.add("Agrega números como: 0, 1, 2");
            }

            if (!SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos un símbolo (@$!%*?&)");
                suggestions.add("Agrega símbolos como: @, $, !, %");
            }

            if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
                errors.add("Esta contraseña es muy común y fácil de adivinar");
                suggestions.add("Usa una combinación única y personal");
            }

            for (Pattern pattern : INSECURE_PATTERNS) {
                if (pattern.matcher(password).matches()) {
                    errors.add("La contraseña contiene un patrón inseguro");
                    suggestions.add("Evita secuencias predecibles y repeticiones");
                    break;
                }
            }

            if (userEmail != null) {
                String emailPrefix = userEmail.split("@")[0].toLowerCase();
                if (password.toLowerCase().contains(emailPrefix) && emailPrefix.length() > 3) {
                    errors.add("La contraseña no debe contener partes de tu email");
                    suggestions.add("Usa palabras no relacionadas con tu información personal");
                }
            }

            double entropy = calculateEntropy(password);
            if (entropy < 40) {
                errors.add("La contraseña es predecible - aumenta la variedad de caracteres");
                suggestions.add("Combina palabras, números y símbolos de forma creativa");
            }
        }

        boolean isValid = errors.isEmpty();
        PasswordStrength strength = calculateStrength(password, errors.size());

        return new PasswordValidationResultDTO(isValid, errors, suggestions, strength);
    }

    /**
     * Verifica si una contraseña está comprometida en brechas conocidas.
     *
     * @param password Contraseña a verificar
     * @return true si la contraseña está en lista de comprometidas
     */
    public boolean isPasswordCompromised(String password) {
        if (password == null) {
            return false;
        }
        return COMPROMISED_PASSWORDS.contains(password);
    }

    /**
     * Genera sugerencias de contraseñas seguras.
     *
     * @return Lista de contraseñas sugeridas que cumplen políticas
     */
    public List<String> generatePasswordSuggestions() {
        return List.of(
            "Casa$Verde123",
            "Playa&Sol2024",
            "Cafe@Manana99",
            "Luna*Brillante7",
            "Viento#Fuerte85",
            "Rio!Azul456",
            "Montana&Alta12",
            "Mar@Tranquilo34"
        );
    }

    // ==============================
    // MÉTODOS PRIVADOS
    // ==============================

    /**
     * Genera un token único para recuperación de contraseña.
     * <p>
     * Formato: UUID sin guiones + timestamp en milisegundos
     * Ejemplo: a1b2c3d4e5f61234567890123456789012345678901234567890
     *
     * @return Token único de recuperación
     */
    private String generatePasswordResetToken() {
        return UUID.randomUUID().toString().replace("-", "") +
            System.currentTimeMillis();
    }

    /**
     * Revoca todos los tokens de autenticación de un usuario.
     * <p>
     * Utilizado en:
     * - Reset password (forzar reautenticación)
     * - Cambios de seguridad críticos
     * <p>
     * Marca como expirados y revocados:
     * - Access tokens
     * - Refresh tokens
     *
     * @param user Usuario al que revocar tokens
     */
    private void revokeAllUserAuthTokens(User user) {
        try {
            List<AuthToken> validAuthTokens = tokenRepository.findAllValidTokensByUserId(user.getId());

            if (!validAuthTokens.isEmpty()) {
                validAuthTokens.forEach(token -> {
                    token.setExpired(true);
                    token.setRevoked(true);
                });
                tokenRepository.saveAll(validAuthTokens);

                logger.logUserOperation(
                    "auth_tokens_revoked",
                    user.getEmail(),
                    Map.of("count", validAuthTokens.size())
                );
            }
        } catch (Exception e) {
            logger.error("Error al revocar tokens", Map.of("userEmail", user.getEmail()), e);
            throw new RuntimeException("Error al revocar tokens existentes: " + e.getMessage(), e);
        }
    }

    /**
     * Calcula la entropía de una contraseña (medida de aleatoriedad).
     *
     * @param password Contraseña a evaluar
     * @return Entropía en bits
     */
    private double calculateEntropy(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }

        int poolSize = 0;
        boolean hasLower = LOWERCASE_PATTERN.matcher(password).matches();
        boolean hasUpper = UPPERCASE_PATTERN.matcher(password).matches();
        boolean hasDigit = DIGIT_PATTERN.matcher(password).matches();
        boolean hasSpecial = SPECIAL_CHAR_PATTERN.matcher(password).matches();

        if (hasLower) poolSize += 26;
        if (hasUpper) poolSize += 26;
        if (hasDigit) poolSize += 10;
        if (hasSpecial) poolSize += 8;

        if (poolSize == 0) {
            return 0;
        }

        return password.length() * (Math.log(poolSize) / Math.log(2));
    }

    /**
     * Calcula la fuerza de una contraseña considerando errores y entropía.
     *
     * @param password   Contraseña evaluada
     * @param errorCount Cantidad de errores detectados
     * @return Nivel de fuerza asignado
     */
    private PasswordStrength calculateStrength(String password, int errorCount) {
        if (password == null || password.isEmpty()) {
            return PasswordStrength.VERY_WEAK;
        }

        if (errorCount > 3) {
            return PasswordStrength.VERY_WEAK;
        }
        if (errorCount > 2) {
            return PasswordStrength.WEAK;
        }
        if (errorCount > 1) {
            return PasswordStrength.FAIR;
        }
        if (errorCount == 1) {
            return PasswordStrength.GOOD;
        }

        double entropy = calculateEntropy(password);
        long specialCount = password.chars()
            .filter(c -> "@$!%*?&".indexOf(c) >= 0)
            .count();

        if (password.length() >= 12 && entropy > 60 && specialCount > 1) {
            return PasswordStrength.VERY_STRONG;
        }
        if (password.length() >= 10 && entropy > 50) {
            return PasswordStrength.STRONG;
        }
        return PasswordStrength.GOOD;
    }
}
