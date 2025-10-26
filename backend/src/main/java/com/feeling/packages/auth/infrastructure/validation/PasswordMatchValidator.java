package com.feeling.packages.auth.infrastructure.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;

/**
 * Validador personalizado para la anotación {@link PasswordMatch}.
 * <p>
 * Verifica que los campos 'password' y 'confirmPassword' de un objeto tengan el mismo valor.
 * Utiliza reflexión para acceder a los campos especificados en la anotación.
 * <p>
 * Este validador:
 * <ul>
 *   <li>Accede a los campos mediante reflexión</li>
 *   <li>Maneja campos privados haciéndolos accesibles temporalmente</li>
 *   <li>Valida que ambos campos no sean nulos y sean iguales</li>
 *   <li>Retorna false si los campos no coinciden o si ocurre un error de acceso</li>
 * </ul>
 *
 * @see PasswordMatch
 */
public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, Object> {

    private String passwordField;
    private String confirmPasswordField;

    /**
     * Inicializa el validador con los nombres de los campos de la anotación.
     *
     * @param constraintAnnotation la anotación PasswordMatch que contiene la configuración
     */
    @Override
    public void initialize(PasswordMatch constraintAnnotation) {
        this.passwordField = constraintAnnotation.passwordField();
        this.confirmPasswordField = constraintAnnotation.confirmPasswordField();
    }

    /**
     * Valida que los campos de contraseña y confirmación coincidan.
     *
     * @param value   el objeto a validar (normalmente un DTO)
     * @param context contexto en el cual se evalúa la restricción
     * @return true si las contraseñas coinciden, false en caso contrario
     */
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Si el objeto es nulo, no aplicar esta validación
        }

        try {
            // Obtener los campos usando reflexión
            Field passwordFieldObj = value.getClass().getDeclaredField(passwordField);
            Field confirmPasswordFieldObj = value.getClass().getDeclaredField(confirmPasswordField);

            // Hacer los campos accesibles (en caso de que sean privados)
            passwordFieldObj.setAccessible(true);
            confirmPasswordFieldObj.setAccessible(true);

            // Obtener los valores de los campos
            Object passwordValue = passwordFieldObj.get(value);
            Object confirmPasswordValue = confirmPasswordFieldObj.get(value);

            // Verificar que ambos valores no sean nulos y sean iguales
            if (passwordValue == null || confirmPasswordValue == null) {
                return false; // Si alguno es nulo, no son válidos
            }

            return passwordValue.equals(confirmPasswordValue);

        } catch (NoSuchFieldException | IllegalAccessException e) {
            // Si hay un error al acceder a los campos, considerar como inválido
            return false;
        }
    }
}
