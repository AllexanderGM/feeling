package com.feeling.packages.event.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.event.domain.dto.EventCreateRequestDTO;
import com.feeling.packages.event.domain.dto.EventResponseDTO;
import com.feeling.packages.event.domain.dto.EventUpdateRequestDTO;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.event.infrastructure.entities.EventCategory;
import com.feeling.packages.event.infrastructure.entities.EventStatus;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final IEventRepository eventRepository;
    private final IUserRepository userRepository;
    private final ModelMapper modelMapper;
    private final EventImageService eventImageService;

    public Page<EventResponseDTO> getAllActiveEvents(Pageable pageable) {
        finalizeExpiredEvents();
        Pageable effectivePageable = resolvePageable(pageable);
        Page<Event> events = eventRepository.findByIsActiveTrueOrderByEventDateAsc(effectivePageable);
        return events.map(this::convertToResponseDTO);
    }

    public Page<EventResponseDTO> getUpcomingEvents(String searchTerm, Pageable pageable) {
        finalizeExpiredEvents();
        Pageable effectivePageable = resolvePageable(pageable);
        Page<Event> events;

        if (StringUtils.hasText(searchTerm)) {
            events = eventRepository.findUpcomingEventsWithSearch(LocalDateTime.now(), searchTerm.trim(), effectivePageable);
        } else {
            events = eventRepository.findUpcomingEvents(LocalDateTime.now(), effectivePageable);
        }

        return events.map(this::convertToResponseDTO);
    }

    public Page<EventResponseDTO> getEventsByCategory(EventCategory category, Pageable pageable) {
        finalizeExpiredEvents();
        Pageable effectivePageable = resolvePageable(pageable);
        Page<Event> events = eventRepository.findByCategoryAndIsActiveTrueOrderByEventDateAsc(category, effectivePageable);
        return events.map(this::convertToResponseDTO);
    }

    public Page<EventResponseDTO> searchEvents(String searchTerm, Pageable pageable) {
        Pageable effectivePageable = resolvePageable(pageable);

        if (!StringUtils.hasText(searchTerm)) {
            return getAllActiveEvents(effectivePageable);
        }

        Page<Event> events = eventRepository.searchEvents(searchTerm.trim(), effectivePageable);
        return events.map(this::convertToResponseDTO);
    }

    public EventResponseDTO getEventById(Long id) {
        Event event = eventRepository.findByIdWithCreatedBy(id)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        if (!event.getIsActive()) {
            throw new NotFoundException("Evento no disponible");
        }

        return convertToResponseDTO(event);
    }

    public Page<EventResponseDTO> getEventsByCreator(Long userId, Pageable pageable) {
        Pageable effectivePageable = resolvePageable(pageable);
        Page<Event> events = eventRepository.findByCreatedBy(userId, effectivePageable);
        return events.map(this::convertToResponseDTO);
    }

    public Page<EventResponseDTO> getEventsByCreatorEmail(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        return getEventsByCreator(user.getId(), pageable);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO createEvent(EventCreateRequestDTO request, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        List<String> galleryImages = normalizeGalleryImages(request.images());

        Event event = Event.builder()
            .title(request.title())
            .description(request.description())
            .location(request.location())
            .eventDate(request.eventDate())
            .price(request.price())
            .maxCapacity(request.maxCapacity())
            .category(request.category())
            .mainImage(request.mainImage())
            .images(galleryImages)
            .seoTitle(normalizeSeoText(request.seoTitle()))
            .seoDescription(normalizeSeoText(request.seoDescription()))
            .seoKeywords(normalizeSeoKeywords(request.seoKeywords()))
            .seoImage(normalizeSeoText(request.seoImage()))
            .createdBy(creator)
            .currentAttendees(0)
            .isActive(true)
            .build();

        Event savedEvent = eventRepository.save(event);
        return convertToResponseDTO(savedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO updateEvent(Long eventId, EventUpdateRequestDTO request, String userEmail) {
        Event event = eventRepository.findByIdWithCreatedBy(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only the creator or admin can update the event
        if (!event.getCreatedBy().getId().equals(user.getId()) &&
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para modificar este evento");
        }

        // Update only non-null fields
        if (request.title() != null) {
            event.setTitle(request.title());
        }
        if (request.description() != null) {
            event.setDescription(request.description());
        }
        if (request.location() != null) {
            event.setLocation(request.location());
        }
        if (request.eventDate() != null) {
            if (request.eventDate().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("La fecha del evento debe ser en el futuro");
            }
            event.setEventDate(request.eventDate());
        }
        if (request.price() != null) {
            event.setPrice(request.price());
        }
        if (request.maxCapacity() != null) {
            if (request.maxCapacity() < event.getCurrentAttendees()) {
                throw new BadRequestException("La nueva capacidad no puede ser menor al número actual de asistentes");
            }
            event.setMaxCapacity(request.maxCapacity());
        }
        if (request.category() != null) {
            event.setCategory(request.category());
        }
        if (request.mainImage() != null) {
            event.setMainImage(request.mainImage());
        }
        if (request.isActive() != null) {
            event.setIsActive(request.isActive());
        }
        if (request.images() != null) {
            event.setImages(normalizeGalleryImages(request.images()));
        }
        if (request.seoTitle() != null) {
            event.setSeoTitle(normalizeSeoText(request.seoTitle()));
        }
        if (request.seoDescription() != null) {
            event.setSeoDescription(normalizeSeoText(request.seoDescription()));
        }
        if (request.seoKeywords() != null) {
            event.setSeoKeywords(normalizeSeoKeywords(request.seoKeywords()));
        }
        if (request.seoImage() != null) {
            event.setSeoImage(normalizeSeoText(request.seoImage()));
        }

        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public void deleteEvent(Long eventId, String userEmail) {
        Event event = eventRepository.findByIdWithCreatedBy(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only the creator or admin can delete the event
        if (!event.getCreatedBy().getId().equals(user.getId()) &&
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para eliminar este evento");
        }

        // Check if there are any confirmed registrations
        if (event.getCurrentAttendees() > 0) {
            throw new BadRequestException("No se puede eliminar un evento con asistentes confirmados");
        }

        // Delete event images from storage before deleting the event
        if (event.getMainImage() != null) {
            try {
                eventImageService.deleteMainImage(eventId, userEmail);
            } catch (Exception e) {
                // Log error but continue with deletion
                System.err.println("Error deleting event image: " + e.getMessage());
            }
        }

        eventRepository.delete(event);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO toggleEventStatus(Long eventId, String userEmail) {
        Event event = eventRepository.findByIdWithCreatedBy(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only the creator or admin can toggle complaintStatus
        if (!event.getCreatedBy().getId().equals(user.getId()) &&
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para modificar este evento");
        }

        event.setIsActive(!event.getIsActive());
        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    public Long countActiveEvents() {
        return eventRepository.countActiveEvents();
    }

    public Long countActiveEventsByCategory(EventCategory category) {
        return eventRepository.countActiveEventsByCategory(category);
    }

    // ==============================
    // EVENT STATUS MANAGEMENT
    // ==============================

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO publishEvent(Long eventId, String userEmail) {
        Event event = validateEventAndPermissions(eventId, userEmail);

        if (!event.isEditable()) {
            throw new BadRequestException("El evento no puede ser publicado desde su estado actual");
        }

        event.publish();
        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO pauseEvent(Long eventId, String userEmail) {
        Event event = validateEventAndPermissions(eventId, userEmail);

        if (event.getStatus() != EventStatus.PUBLICADO) {
            throw new BadRequestException("Solo se pueden pausar eventos publicados");
        }

        event.pause();
        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO cancelEvent(Long eventId, String userEmail) {
        Event event = validateEventAndPermissions(eventId, userEmail);

        if (event.isFinalStatus()) {
            throw new BadRequestException("El evento ya está en un estado final");
        }

        event.cancel();
        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO finishEvent(Long eventId, String userEmail) {
        Event event = validateEventAndPermissions(eventId, userEmail);

        if (event.getStatus() != EventStatus.PUBLICADO) {
            throw new BadRequestException("Solo se pueden finalizar eventos publicados");
        }

        event.finish();
        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO backToEdition(Long eventId, String userEmail) {
        Event event = validateEventAndPermissions(eventId, userEmail);

        if (event.getStatus() != EventStatus.PAUSADO) {
            throw new BadRequestException("Solo se pueden devolver a edición eventos pausados");
        }

        event.backToEdition();
        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO activateEvent(Long eventId, String userEmail) {
        Event event = validateEventAndPermissions(eventId, userEmail);

        if (event.getStatus() != EventStatus.CANCELADO) {
            throw new BadRequestException("Solo se pueden activar eventos cancelados");
        }

        event.activate();
        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }


    // ==============================
    // EVENT REGISTRATIONS MANAGEMENT
    // ==============================

    public List<Map<String, Object>> getEventRegistrations(Long eventId) {
        Event event = eventRepository.findByIdWithCreatedBy(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        return event.getRegistrations().stream()
            .map(registration -> {
                Map<String, Object> regInfo = new HashMap<>();
                User user = registration.getUser();
                regInfo.put("id", registration.getId());
                regInfo.put("userId", user.getId());
                regInfo.put("userName", user.getName() + " " + user.getLastName());
                regInfo.put("userEmail", user.getEmail());
                regInfo.put("registrationDate", registration.getRegistrationDate());
                regInfo.put("paymentStatus", registration.getPaymentStatus());
                regInfo.put("amountPaid", registration.getAmountPaid());
                return regInfo;
            })
            .collect(Collectors.toList());
    }

    public Page<EventResponseDTO> getUserRegisteredEvents(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Pageable effectivePageable = resolvePageable(pageable);
        Page<Event> events = eventRepository.findEventsByUserRegistrations(user.getId(), effectivePageable);
        return events.map(this::convertToResponseDTO);
    }

    public boolean isEventCreator(Long eventId, String userEmail) {
        Event event = eventRepository.findByIdWithCreatedBy(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return event.getCreatedBy().getId().equals(user.getId());
    }

    // ==============================
    // EVENTOS POR ESTADO
    // ==============================

    public Page<EventResponseDTO> getEventsByStatus(EventStatus status, Pageable pageable) {
        finalizeExpiredEvents();
        Pageable effectivePageable = resolvePageable(pageable);
        Page<Event> events = eventRepository.findByStatus(status, effectivePageable);
        return events.map(this::convertToResponseDTO);
    }

    public Page<EventResponseDTO> getEventsByStatusWithSearch(EventStatus status, String searchTerm, Pageable pageable) {
        finalizeExpiredEvents();
        Pageable effectivePageable = resolvePageable(pageable);
        if (!StringUtils.hasText(searchTerm)) {
            return getEventsByStatus(status, effectivePageable);
        }
        Page<Event> events = eventRepository.findByStatusAndTitleContainingIgnoreCase(status, searchTerm.trim(), effectivePageable);
        return events.map(this::convertToResponseDTO);
    }

    // ==============================
    // HELPER METHODS
    // ==============================

    private Pageable resolvePageable(Pageable pageable) {
        return pageable == null ? Pageable.unpaged() : pageable;
    }

    private Event validateEventAndPermissions(Long eventId, String userEmail) {
        Event event = eventRepository.findByIdWithCreatedBy(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only the creator or admin can manage the event
        if (!event.getCreatedBy().getId().equals(user.getId()) &&
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para gestionar este evento");
        }

        return event;
    }

    private EventResponseDTO convertToResponseDTO(Event event) {
        return new EventResponseDTO(
            event.getId(),
            event.getTitle(),
            event.getDescription(),
            event.getLocation(),
            event.getEventDate(),
            event.getPrice(),
            event.getMaxCapacity(),
            event.getCurrentAttendees(),
            event.getAvailableSpots(),
            event.getCategory(),
            event.getCategory() != null ? event.getCategory().getDisplayName() : null,
            event.getStatus(),
            event.getStatus() != null ? event.getStatus().getDisplayName() : null,
            event.getMainImage(),
            event.getImages(),
            event.getSeoTitle(),
            event.getSeoDescription(),
            event.getSeoKeywords(),
            event.getSeoImage(),
            event.getCreatedAt(),
            event.getUpdatedAt(),
            event.getIsActive(),
            event.isFull(),
            event.hasAvailableSpots(),
            event.isPublished(),
            event.canAcceptRegistrations(),
            event.getCreatedBy() != null ? event.getCreatedBy().getName() + " " + event.getCreatedBy().getLastName() : null,
            event.getCreatedBy() != null ? event.getCreatedBy().getId() : null
        );
    }

    private void finalizeExpiredEvents() {
        List<Event> expiredEvents = eventRepository.findEventsToFinalize(
            LocalDateTime.now(),
            List.of(EventStatus.CANCELADO, EventStatus.TERMINADO)
        );

        if (expiredEvents.isEmpty()) {
            return;
        }

        expiredEvents.forEach(Event::finish);
        eventRepository.saveAll(expiredEvents);
    }

    private List<String> normalizeGalleryImages(List<String> images) {
        if (images == null) {
            return new ArrayList<>();
        }

        return images.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(image -> !image.isEmpty())
            .distinct()
            .limit(5)
            .collect(Collectors.toCollection(ArrayList::new));
    }

    private String normalizeSeoText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeSeoKeywords(String value) {
        String normalized = normalizeSeoText(value);
        if (normalized == null) {
            return null;
        }
        return Arrays.stream(normalized.split(","))
            .map(String::trim)
            .filter(keyword -> !keyword.isEmpty())
            .collect(Collectors.joining(", "));
    }
}
