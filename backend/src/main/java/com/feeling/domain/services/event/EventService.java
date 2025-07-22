package com.feeling.domain.services.event;

import com.feeling.domain.dto.event.*;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.event.Event;
import com.feeling.infrastructure.entities.event.EventCategory;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.event.IEventRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    
    private final IEventRepository eventRepository;
    private final IUserRepository userRepository;
    private final ModelMapper modelMapper;
    private final EventImageService eventImageService;

    @Cacheable(value = "events", key = "'active'")
    public List<EventResponseDTO> getAllActiveEvents() {
        List<Event> events = eventRepository.findByIsActiveTrueOrderByEventDateAsc();
        return events.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Cacheable(value = "events", key = "'active_paginated_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<EventResponseDTO> getAllActiveEvents(Pageable pageable) {
        Page<Event> events = eventRepository.findByIsActiveTrueOrderByEventDateAsc(pageable);
        return events.map(this::convertToResponseDTO);
    }

    @Cacheable(value = "events", key = "'upcoming'")
    public List<EventResponseDTO> getUpcomingEvents() {
        List<Event> events = eventRepository.findUpcomingEvents(LocalDateTime.now());
        return events.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public Page<EventResponseDTO> getUpcomingEvents(Pageable pageable) {
        Page<Event> events = eventRepository.findUpcomingEvents(LocalDateTime.now(), pageable);
        return events.map(this::convertToResponseDTO);
    }

    @Cacheable(value = "events", key = "'category_' + #category.name()")
    public List<EventResponseDTO> getEventsByCategory(EventCategory category) {
        List<Event> events = eventRepository.findByCategoryAndIsActiveTrueOrderByEventDateAsc(category);
        return events.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public Page<EventResponseDTO> getEventsByCategory(EventCategory category, Pageable pageable) {
        Page<Event> events = eventRepository.findByCategoryAndIsActiveTrueOrderByEventDateAsc(category, pageable);
        return events.map(this::convertToResponseDTO);
    }

    public List<EventResponseDTO> searchEvents(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllActiveEvents();
        }
        
        List<Event> events = eventRepository.searchEvents(searchTerm.trim());
        return events.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public Page<EventResponseDTO> searchEvents(String searchTerm, Pageable pageable) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllActiveEvents(pageable);
        }
        
        Page<Event> events = eventRepository.searchEvents(searchTerm.trim(), pageable);
        return events.map(this::convertToResponseDTO);
    }

    public EventResponseDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
        
        if (!event.getIsActive()) {
            throw new NotFoundException("Evento no disponible");
        }
        
        return convertToResponseDTO(event);
    }

    public List<EventResponseDTO> getEventsByCreator(Long userId) {
        List<Event> events = eventRepository.findByCreatedBy(userId);
        return events.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public Page<EventResponseDTO> getEventsByCreator(Long userId, Pageable pageable) {
        Page<Event> events = eventRepository.findByCreatedBy(userId, pageable);
        return events.map(this::convertToResponseDTO);
    }

    public List<EventResponseDTO> getEventsByCreatorEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        return getEventsByCreator(user.getId());
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

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .eventDate(request.eventDate())
                .price(request.price())
                .maxCapacity(request.maxCapacity())
                .category(request.category())
                .mainImage(request.mainImage())
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
        Event event = eventRepository.findById(eventId)
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

        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public void deleteEvent(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
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
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only the creator or admin can toggle status
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

    private EventResponseDTO convertToResponseDTO(Event event) {
        return new EventResponseDTO(
            event.getId(),
            event.getTitle(),
            event.getDescription(),
            event.getEventDate(),
            event.getPrice(),
            event.getMaxCapacity(),
            event.getCurrentAttendees(),
            event.getAvailableSpots(),
            event.getCategory(),
            event.getCategory().getDisplayName(),
            event.getMainImage(),
            event.getCreatedAt(),
            event.getUpdatedAt(),
            event.getIsActive(),
            event.isFull(),
            event.hasAvailableSpots(),
            event.getCreatedBy() != null ? event.getCreatedBy().getName() + " " + event.getCreatedBy().getLastName() : null,
            event.getCreatedBy() != null ? event.getCreatedBy().getId() : null
        );
    }
}