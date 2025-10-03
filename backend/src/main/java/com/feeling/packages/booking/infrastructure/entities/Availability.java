package com.feeling.packages.booking.infrastructure.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.feeling.packages.event.infrastructure.entities.Event;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "event_availability")
public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "available_date", nullable = false)
    private LocalDateTime availableDate;

    @Column(name = "available_slots", nullable = false)
    private Integer availableSlots;

    @Column(name = "booked_slots", nullable = false)
    @Builder.Default
    private Integer bookedSlots = 0;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;
}
