package com.feeling.domain.dto.user;

import com.feeling.domain.dto.validation.ValidationGroups;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * DTO para actualización de datos básicos del usuario
 * Phase 2.2: Validation DTOs Creation - Specific Update DTOs
 */
public record UserBasicUpdateDTO(

        @NotBlank(message = "El nombre es obligatorio", groups = {ValidationGroups.UpdateProfile.class})
        @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
        String name,

        @NotBlank(message = "El apellido es obligatorio", groups = {ValidationGroups.UpdateProfile.class})
        @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
        String lastName,

        @Email(message = "El email debe tener un formato válido")
        String email,

        @Past(message = "La fecha de nacimiento debe ser en el pasado")
        LocalDate dateOfBirth,

        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "El teléfono debe tener un formato válido")
        String phone,

        @Size(max = 5, message = "El código de país no puede superar 5 caracteres")
        String phoneCode

) {}