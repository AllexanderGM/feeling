package com.tours.infrastructure.entities.booking;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.tours.infrastructure.entities.tour.Tour;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "availabilities")
public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "tour_id")
    private Tour tour;

    @Column(nullable = false)
    private LocalDateTime availableDate;

    @Column(nullable = false)
    private Integer availableSlots;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private LocalDateTime returnTime;
}