package com.feeling.packages.auth.infrastructure.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación personalizada para verificar que las contraseñas coincidan.
 * <p>
 * Esta anotación se aplica a nivel de clase y verifica que los campos
 * 'password' y 'confirmPassword' tengan el mismo valor.
 * <p>
 * Uso:
 * <pre>
 * {@code
 * @PasswordMatch(message = "Las contraseñas no coinciden")
 * public record AuthRegisterRequestDTO(
 *     String password,
 *     String confirmPassword
 * ) {}
 * }
 * </pre>
 *
 * @see PasswordMatchValidator
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PasswordMatchValidator.class)
@Documented
public @interface PasswordMatch {

    /**
     * Mensaje de error que se mostrará cuando las contraseñas no coincidan.
     */
    String message() default "Las contraseñas no coinciden";

    /**
     * Permite especificar grupos de validación.
     */
    Class<?>[] groups() default {};

    /**
     * Puede ser usado por clientes de la API de validación para asignar payloads personalizados.
     */
    Class<? extends Payload>[] payload() default {};

    /**
     * Nombre del campo que contiene la contraseña.
     */
    String passwordField() default "password";

    /**
     * Nombre del campo que contiene la confirmación de contraseña.
     */
    String confirmPasswordField() default "confirmPassword";
}
