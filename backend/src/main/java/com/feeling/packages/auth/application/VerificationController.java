package com.feeling.packages.auth.application;

import com.feeling.packages.auth.domain.dto.request.AuthResendCodeRequestDTO;
import com.feeling.packages.auth.domain.dto.request.AuthVerifyCodeDTO;
import com.feeling.packages.auth.domain.dto.response.AuthUserStatusDTO;
import com.feeling.packages.auth.domain.dto.response.EmailAvailabilityDTO;
import com.feeling.packages.auth.domain.dto.response.CodeValidationDTO;
import com.feeling.packages.auth.domain.dto.response.UserVerificationStatusDTO;
import com.feeling.packages.auth.domain.services.AuthService;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/verification")
@RequiredArgsConstructor
@Tag(name = "Verificación de Email", description = "Endpoints para verificación y validación de emails")
public class VerificationController {

    private static final Logger logger = LoggerFactory.getLogger(VerificationController.class);
    private final AuthService authService;

    // ==============================
    // VERIFICACIÓN DE EMAIL
    // ==============================

    @PostMapping("/verify-email")
    @Operation(
        summary = "Verificar código de email",
        description = "Verifica el código de verificación enviado al email del usuario durante el registro"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Email verificado exitosamente",
            content = @Content(schema = @Schema(implementation = MessageResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Código de verificación inválido o expirado"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Email ya verificado"
        )
    })
    public ResponseEntity<MessageResponseDTO> verifyEmail(@Valid @RequestBody AuthVerifyCodeDTO verifyCodeDTO) {
        logger.info("Intento de verificación de email para: {}", verifyCodeDTO.email());

        MessageResponseDTO response = authService.verifyCode(verifyCodeDTO);

        logger.info("Email verificado exitosamente para: {}", verifyCodeDTO.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-code")
    @Operation(
        summary = "Reenviar código de verificación",
        description = "Reenvía un nuevo código de verificación al email del usuario"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Código reenviado exitosamente",
            content = @Content(schema = @Schema(implementation = MessageResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Email ya verificado o solicitud inválida"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado"
        ),
        @ApiResponse(
            responseCode = "429",
            description = "Demasiadas solicitudes de reenvío"
        )
    })
    public ResponseEntity<MessageResponseDTO> resendVerificationCode(@Valid @RequestBody AuthResendCodeRequestDTO resendCodeDTO) {
        logger.info("Solicitud de reenvío de código para: {}", resendCodeDTO.email());

        MessageResponseDTO response = authService.resendCode(resendCodeDTO.email());

        logger.info("Código de verificación reenviado para: {}", resendCodeDTO.email());
        return ResponseEntity.ok(response);
    }

    // ==============================
    // VALIDACIONES DE EMAIL
    // ==============================

    @GetMapping("/check-email/{email}")
    @Operation(
        summary = "Verificar disponibilidad de email",
        description = "Verifica si un email está disponible para registro o ya está en uso"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Estado del email obtenido exitosamente",
            content = @Content(schema = @Schema(implementation = EmailAvailabilityDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Email con formato inválido"
        )
    })
    public ResponseEntity<EmailAvailabilityDTO> checkEmailAvailability(@PathVariable String email) {
        logger.debug("Verificando disponibilidad de email: {}", email);

        EmailAvailabilityDTO availability = authService.checkEmailAvailability(email);

        logger.debug("Estado de email {} - Disponible: {}", email, availability.available());
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/status/{email}")
    @Operation(
        summary = "Obtener estado de verificación del usuario",
        description = "Obtiene el estado completo de verificación y registro de un usuario"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Estado obtenido exitosamente",
            content = @Content(schema = @Schema(implementation = UserVerificationStatusDTO.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado"
        )
    })
    public ResponseEntity<UserVerificationStatusDTO> getUserVerificationStatus(@PathVariable String email) {
        logger.debug("Obteniendo estado de verificación para: {}", email);

        AuthUserStatusDTO authStatus = authService.getUserVerificationStatus(email);
        UserVerificationStatusDTO status = new UserVerificationStatusDTO(
            authStatus.email(),
            authStatus.fullyRegistered(),
            authStatus.verified(),
            authStatus.profileComplete(),
            "LOCAL", // Default, would need to be retrieved from user if needed
            null // Code expiration not available from auth complaintStatus
        );

        logger.debug("Estado de verificación para {}: verified={}, profileComplete={}",
            email, status.verified(), status.profileComplete());
        return ResponseEntity.ok(status);
    }

    // ==============================
    // VALIDACIÓN DE CÓDIGOS
    // ==============================

    @GetMapping("/validate-code")
    @Operation(
        summary = "Validar código sin verificar",
        description = "Valida si un código de verificación es correcto sin marcarlo como usado"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Código validado",
            content = @Content(schema = @Schema(implementation = CodeValidationDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Código inválido o expirado"
        )
    })
    public ResponseEntity<CodeValidationDTO> validateVerificationCode(
        @RequestParam String email,
        @RequestParam String code) {

        logger.debug("Validando código para email: {}", email);

        boolean isValid = authService.isVerificationCodeValid(email, code);
        CodeValidationDTO validation = new CodeValidationDTO(isValid,
            isValid ? "Código válido" : "Código inválido o expirado");

        logger.debug("Validación de código para {}: {}", email, isValid ? "VÁLIDO" : "INVÁLIDO");
        return ResponseEntity.ok(validation);
    }

    // ==============================
    // LIMPIEZA DE CÓDIGOS EXPIRADOS
    // ==============================

    @PostMapping("/cleanup-expired")
    @Operation(
        summary = "Limpiar códigos expirados (Admin)",
        description = "Elimina códigos de verificación expirados del sistema"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Limpieza completada",
            content = @Content(schema = @Schema(implementation = MessageResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Acceso denegado - Solo administradores"
        )
    })
    public ResponseEntity<MessageResponseDTO> cleanupExpiredCodes() {
        logger.info("Iniciando limpieza de códigos de verificación expirados");

        int deletedCount = authService.cleanupExpiredVerificationCodes();

        String message = String.format("Limpieza completada. %d códigos expirados eliminados", deletedCount);
        logger.info(message);

        return ResponseEntity.ok(new MessageResponseDTO(message));
    }
}
