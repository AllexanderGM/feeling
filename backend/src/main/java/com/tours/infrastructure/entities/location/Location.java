package com.tours.infrastructure.entities.location;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String image;

    private String region;

    private String country;

    @ElementCollection
    private List<String> city;

    @ElementCollection
    private List<String> phone;
}
