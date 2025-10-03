package com.feeling.packages.booking.domain.dto;

import com.feeling.packages.booking.infrastructure.validators.DateInFuture;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BookingRequestDTO {
    @NotNull(message = "El ID del evento es requerido")
    private Long eventId;

    @NotNull(message = "La fecha de reserva es requerida")
    @DateInFuture(message = "La fecha de reserva debe ser en el futuro")
    private LocalDateTime bookingDate;

    @NotNull(message = "La cantidad de asistentes es requerida")
    @Min(value = 1, message = "La cantidad de asistentes debe ser mayor a 0")
    private Integer attendees;

    @Size(max = 500, message = "Las solicitudes especiales no pueden exceder 500 caracteres")
    private String specialRequests;

    private Long paymentMethodId;
}
