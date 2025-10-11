package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para solicitud de cambio de contraseña.
 * <p>
 * Contiene la contraseña actual para validación y la nueva contraseña
 * con su confirmación para evitar errores de digitación.
 *
 * @param currentPassword Contraseña actual del usuario
 * @param newPassword Nueva contraseña deseada
 * @param confirmPassword Confirmación de la nueva contraseña
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
public record ChangePasswordRequestDTO(
    @NotBlank(message = "La contraseña actual es obligatoria")
    String currentPassword,

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String newPassword,

    @NotBlank(message = "La confirmación de contraseña es obligatoria")
    String confirmPassword
) {
    /**
     * Valida que la nueva contraseña y su confirmación coincidan.
     *
     * @return true si newPassword y confirmPassword son iguales
     */
    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
