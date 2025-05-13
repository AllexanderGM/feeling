package com.feeling.infrastructure.entities.tour;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tour_tags")

public class TagTour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag", nullable = false, unique = true)
    private TagTourOptions tagTourOptions;

    @ManyToMany(mappedBy = "tags")
    @JsonBackReference
    private List<Tour> tours = new ArrayList<>();
    public TagTour(TagTourOptions tagTourOptions) {
        this.tagTourOptions = tagTourOptions;
    }
}
