package com.feeling.application.controllers.event;

import com.feeling.domain.dto.event.TourRequestDTO;
import com.feeling.domain.dto.event.TourResponseDTO;
import com.feeling.domain.dto.event.filter.TourFilterDTO;
import com.feeling.domain.services.event.FilterTourService;
import com.feeling.domain.services.event.TourService;
import com.feeling.infrastructure.entities.tour.TagTourOptions;
import com.feeling.infrastructure.entities.tour.Tour;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tours")
@RequiredArgsConstructor
public class TourController {
    private final TourService tourService;
    private final FilterTourService filterTourService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(tourService.getAll());
    }

    @GetMapping("/random")
    public ResponseEntity<?> getAllRandom() {
        return ResponseEntity.ok(tourService.getAllRandom());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getById(id));
    }

    @GetMapping("/paginated")
    public ResponseEntity<?> listPaginated(Pageable pageable) {
        return ResponseEntity.ok(tourService.listPaginated(pageable));
    }

    @PostMapping
    //public ResponseEntity<?> add(@RequestBody TourRequestDTO tour) {
    // return ResponseEntity.ok(tourService.add(tour));
    public ResponseEntity<Optional<TourResponseDTO>> addTour(@Valid @RequestBody TourRequestDTO tourRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tourService.add(tourRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TourRequestDTO tour) {
        return ResponseEntity.ok(tourService.update(id, tour));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable Long id) {
        tourService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/tags")
    public ResponseEntity<?> updateTags(@PathVariable Long id, @RequestBody List<TagTourOptions> tags) {
        return ResponseEntity.ok(tourService.updateTags(id, tags));
    }

    @GetMapping("/filter/category")
    public ResponseEntity<List<Tour>> filterByCategory(@RequestBody TourFilterDTO filtro) {
        List<Tour> tours = filterTourService.filterByCategory(filtro);
        return ResponseEntity.ok(tours);
    }

    @GetMapping("/filter/name")
    public ResponseEntity<List<Tour>> searchByName(@RequestParam String name) {
        List<Tour> tours = tourService.searchByName(name);
        return ResponseEntity.ok(tours);
    }

    @GetMapping("/filter/advanced")
    public ResponseEntity<List<Tour>> searchByNameAndAvailability(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Tour> tours = tourService.searchByNameAndDate(name, startDate, endDate);
        return ResponseEntity.ok(tours);
    }
}
