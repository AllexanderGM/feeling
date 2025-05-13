package com.feeling.infrastructure.entities.tour;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.feeling.infrastructure.entities.booking.Availability;
import com.feeling.infrastructure.entities.booking.Booking;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tours")
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal adultPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal childPrice;

    @Column(nullable = false)
    private LocalDate creationDate;

    @ElementCollection
    private List<String> images;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private StatusTour statusTour;

    @ManyToMany
    @JoinTable(
            name = "tour_tag_relation",
            joinColumns = @JoinColumn(name = "tour_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @JsonManagedReference
    private List<TagTour> tags = new ArrayList<>();


    @ManyToMany
    @JoinTable(
            name = "tour_include-tours",
            joinColumns = @JoinColumn(name = "tour_id"),
            inverseJoinColumns = @JoinColumn(name = "include_tours_id")
    )
    @JsonManagedReference
    private List<IncludeTours> includeTours;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "destination_id")
    private DestinationTour destinationTour;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private HotelTour hotelTour;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Availability> availabilities;

    @OneToMany(mappedBy = "tour",  cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;

}
