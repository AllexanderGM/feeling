package com.feeling.infrastructure.entities.tour;

import com.feeling.infrastructure.entities.location.Location;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tour_hotels")
public class HotelTour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Integer stars;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
}
