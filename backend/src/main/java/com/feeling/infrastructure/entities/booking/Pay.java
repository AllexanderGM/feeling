package com.feeling.infrastructure.entities.booking;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class Pay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double paymentAmount;
    private LocalDateTime PaymentDate;

    @ManyToOne
    @JoinColumn(name = "id_metodo_pago")
    private PaymentMethod paymentMethod;
}
