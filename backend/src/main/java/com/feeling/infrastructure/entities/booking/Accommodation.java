package com.feeling.infrastructure.entities.booking;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tours_accommodation")
public class Accommodation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AccommodationBooking accommodationBooking;

    public Accommodation(AccommodationBooking accommodationBooking) {
        this.accommodationBooking = accommodationBooking;
    }
}
