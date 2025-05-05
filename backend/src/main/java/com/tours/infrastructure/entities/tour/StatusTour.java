package com.tours.infrastructure.entities.tour;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tour_status")
public class StatusTour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private StatusTourOptions status;

    public StatusTour(StatusTourOptions statusTourOptions) {
        this.status = statusTourOptions;
    }
}
