package com.feeling.domain.services.event;

import com.feeling.domain.dto.event.EventRegistrationRequestDTO;
import com.feeling.domain.dto.event.EventRegistrationResponseDTO;
import com.feeling.domain.dto.event.EventResponseDTO;
import com.feeling.domain.services.email.EmailService;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.event.Event;
import com.feeling.infrastructure.entities.event.EventRegistration;
import com.feeling.infrastructure.entities.event.PaymentStatus;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.event.IEventRegistrationRepository;
import com.feeling.infrastructure.repositories.event.IEventRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {
    
    private final IEventRegistrationRepository registrationRepository;
    private final IEventRepository eventRepository;
    private final IUserRepository userRepository;
    private final ModelMapper modelMapper;
    private final EmailService emailService;

    public List<EventRegistrationResponseDTO> getUserRegistrations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        List<EventRegistration> registrations = registrationRepository.findByUserIdOrderByRegistrationDateDesc(user.getId());
        return registrations.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public Page<EventRegistrationResponseDTO> getUserRegistrations(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        Page<EventRegistration> registrations = registrationRepository.findByUserIdOrderByRegistrationDateDesc(user.getId(), pageable);
        return registrations.map(this::convertToResponseDTO);
    }

    public List<EventRegistrationResponseDTO> getEventAttendees(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only event creator or admin can see attendees
        if (!event.getCreatedBy().getId().equals(user.getId()) && 
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para ver los asistentes de este evento");
        }

        List<EventRegistration> registrations = registrationRepository.findByEventIdOrderByRegistrationDateAsc(eventId);
        return registrations.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public Page<EventRegistrationResponseDTO> getEventAttendees(Long eventId, String userEmail, Pageable pageable) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only event creator or admin can see attendees
        if (!event.getCreatedBy().getId().equals(user.getId()) && 
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para ver los asistentes de este evento");
        }

        Page<EventRegistration> registrations = registrationRepository.findByEventIdOrderByRegistrationDateAsc(eventId, pageable);
        return registrations.map(this::convertToResponseDTO);
    }

    public List<EventRegistrationResponseDTO> getConfirmedAttendees(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only event creator or admin can see confirmed attendees
        if (!event.getCreatedBy().getId().equals(user.getId()) && 
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para ver los asistentes de este evento");
        }

        List<EventRegistration> registrations = registrationRepository.findConfirmedAttendeesByEventId(eventId);
        return registrations.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Transactional
    public EventRegistrationResponseDTO registerForEvent(EventRegistrationRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        // Validate event is active and not in the past
        if (!event.getIsActive()) {
            throw new BadRequestException("El evento no está disponible para inscripciones");
        }

        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("No se puede registrar en un evento que ya ha pasado");
        }

        // Check if user is already registered
        if (registrationRepository.existsByUserIdAndEventId(user.getId(), event.getId())) {
            throw new BadRequestException("Ya estás registrado en este evento");
        }

        // Check if event has available spots
        if (event.isFull()) {
            throw new BadRequestException("El evento está lleno");
        }

        // Create registration
        EventRegistration registration = EventRegistration.builder()
                .user(user)
                .event(event)
                .paymentStatus(PaymentStatus.PENDING)
                .isConfirmed(false)
                .build();

        EventRegistration savedRegistration = registrationRepository.save(registration);
        return convertToResponseDTO(savedRegistration);
    }

    @Transactional
    public void confirmPayment(Long registrationId, BigDecimal amount, String stripePaymentIntentId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new NotFoundException("Registro no encontrado"));

        registration.markAsPaid(amount, stripePaymentIntentId);
        
        // Increment event attendees count
        Event event = registration.getEvent();
        event.incrementAttendees();
        
        registrationRepository.save(registration);
        eventRepository.save(event);
        
        // Send confirmation email
        try {
            EventRegistrationResponseDTO registrationDTO = convertToResponseDTO(registration);
            EventResponseDTO eventDTO = convertEventToResponseDTO(event);
            emailService.sendEventRegistrationConfirmation(registrationDTO, eventDTO);
        } catch (MessagingException e) {
            // Log error but don't fail the transaction
            System.err.println("Error sending confirmation email: " + e.getMessage());
        }
    }

    @Transactional
    public void markPaymentFailed(Long registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new NotFoundException("Registro no encontrado"));

        registration.markAsFailed();
        registrationRepository.save(registration);
    }

    @Transactional
    public void cancelRegistration(Long registrationId, String userEmail) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new NotFoundException("Registro no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Only the user who registered or admin can cancel
        if (!registration.getUser().getId().equals(user.getId()) && 
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para cancelar este registro");
        }

        // Check if event is not in the past
        if (registration.getEvent().getEventDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("No se puede cancelar un registro de un evento que ya ha pasado");
        }

        // If payment was completed, decrement attendees count
        if (registration.isPaid()) {
            Event event = registration.getEvent();
            event.decrementAttendees();
            eventRepository.save(event);
        }

        registration.cancel();
        registrationRepository.save(registration);
    }

    public boolean isUserRegistered(Long eventId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        return registrationRepository.existsByUserIdAndEventId(user.getId(), eventId);
    }

    public EventRegistrationResponseDTO getUserEventRegistration(Long eventId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        EventRegistration registration = registrationRepository.findByUserIdAndEventId(user.getId(), eventId)
                .orElseThrow(() -> new NotFoundException("No estás registrado en este evento"));

        return convertToResponseDTO(registration);
    }

    public EventRegistrationResponseDTO getRegistrationByStripePaymentIntent(String stripePaymentIntentId) {
        EventRegistration registration = registrationRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new NotFoundException("Registro no encontrado para este pago"));

        return convertToResponseDTO(registration);
    }

    public Long countUserCompletedRegistrations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        return registrationRepository.countCompletedRegistrationsByUserId(user.getId());
    }

    public Long countEventConfirmedAttendees(Long eventId) {
        return registrationRepository.countConfirmedAttendeesByEventId(eventId);
    }

    private EventRegistrationResponseDTO convertToResponseDTO(EventRegistration registration) {
        return new EventRegistrationResponseDTO(
            registration.getId(),
            registration.getUser() != null ? registration.getUser().getId() : null,
            registration.getUser() != null ? registration.getUser().getName() + " " + registration.getUser().getLastName() : null,
            registration.getEvent() != null ? registration.getEvent().getId() : null,
            registration.getEvent() != null ? registration.getEvent().getTitle() : null,
            registration.getEvent() != null ? registration.getEvent().getEventDate() : null,
            registration.getRegistrationDate(),
            registration.getPaymentStatus(),
            registration.getPaymentStatus().getDisplayName(),
            registration.getAmountPaid(),
            registration.getStripePaymentIntentId(),
            registration.getPaymentDate(),
            registration.getCancellationDate(),
            registration.getIsConfirmed(),
            registration.isPaid(),
            registration.isPending(),
            registration.isCancelled()
        );
    }

    private EventResponseDTO convertEventToResponseDTO(Event event) {
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
            event.getStatus(),
            event.getStatus().getDisplayName(),
            event.getMainImage(),
            event.getImages(),
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
}