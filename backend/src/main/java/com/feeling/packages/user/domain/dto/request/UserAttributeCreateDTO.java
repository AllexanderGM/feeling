package com.feeling.packages.user.domain.dto.request;

import com.feeling.packages.common.domain.validation.ValidHexColor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO para creación de atributos de usuario.
 * <p>
 * Incluye validaciones completas de formato y contenido:
 * - Nombre obligatorio entre 2 y 100 caracteres
 * - Solo letras, números, espacios y guiones permitidos en el nombre
 * - Detalle opcional hasta 500 caracteres
 * - Si el detalle es un color, debe ser hexadecimal válido (#RGB o #RRGGBB)
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserAttributeCreateDTO(
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s\\-]+$",
        message = "El nombre solo puede contener letras, números, espacios y guiones")
    String name,

    @Size(max = 500, message = "El detalle no puede superar los 500 caracteres")
    @ValidHexColor(onlyIfStartsWithHash = true)
    String detail
) {
    /**
     * Constructor compacto que normaliza los valores de entrada.
     * Elimina espacios en blanco al inicio y final de los campos.
     */
    public UserAttributeCreateDTO {
        name = name != null ? name.trim() : null;
        detail = detail != null ? detail.trim() : null;
    }
}
