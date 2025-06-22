package com.feeling.domain.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.feeling.domain.dto.event.availability.AvailabilityResponseDTO;
import com.feeling.infrastructure.entities.tour.Tour;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TourResponseDTO(
        Long id,
        String name,
        String description,
        BigDecimal adultPrice,
        BigDecimal childPrice,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate creationDate,
        List<String> images,
        StatusDTO status,
        List<String> tags,
        List<IncludeDTO> includes,
        DestinationResponseDTO destination,
        HotelDTO hotel,
        List<AvailabilityResponseDTO> availability
) {
    private static final Logger logger = LoggerFactory.getLogger(TourResponseDTO.class);

    public TourResponseDTO(Tour tour) {
        this(
                tour.getId(),
                tour.getName(),
                tour.getDescription(),
                tour.getAdultPrice(),
                tour.getChildPrice(),
                tour.getCreationDate(),
                tour.getImages(),

                new StatusDTO(tour.getStatusTour()),
                //tour.getTags() != null ? String.valueOf(new TagDTO(tour.getTags()).tag().getDisplayName()) : "Sin etiqueta",
                tour.getTags() != null ? tour.getTags().stream()
                        .map(tag -> tag.getTagTourOptions().getDisplayName())
                        .toList() : List.of(),

                tour.getIncludeTours() != null ? tour.getIncludeTours().stream().map(IncludeDTO::new).toList() : List.of(),

                new DestinationResponseDTO(tour.getDestinationTour()),
                tour.getHotelTour() != null ? new HotelDTO(tour.getHotelTour()) : null,
                tour.getAvailabilities().stream()
                        .map(avail -> new AvailabilityResponseDTO(avail, false))
                        .toList()
        );
        if (tour.getHotelTour() == null) {
            logger.warn("El tour '{}' no tiene un hotel asociado", tour.getName());
        }
    }
}
