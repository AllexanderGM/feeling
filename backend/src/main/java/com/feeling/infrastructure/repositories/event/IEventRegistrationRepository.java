package com.feeling.infrastructure.repositories.event;

import com.feeling.infrastructure.entities.event.EventRegistration;
import com.feeling.infrastructure.entities.event.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IEventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    
    List<EventRegistration> findByUserIdOrderByRegistrationDateDesc(Long userId);
    
    Page<EventRegistration> findByUserIdOrderByRegistrationDateDesc(Long userId, Pageable pageable);
    
    List<EventRegistration> findByEventIdOrderByRegistrationDateAsc(Long eventId);
    
    Page<EventRegistration> findByEventIdOrderByRegistrationDateAsc(Long eventId, Pageable pageable);
    
    Optional<EventRegistration> findByUserIdAndEventId(Long userId, Long eventId);
    
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    
    List<EventRegistration> findByPaymentStatus(PaymentStatus paymentStatus);
    
    @Query("SELECT er FROM EventRegistration er WHERE er.user.id = :userId AND er.paymentStatus = :status ORDER BY er.registrationDate DESC")
    List<EventRegistration> findByUserIdAndPaymentStatus(@Param("userId") Long userId, @Param("status") PaymentStatus status);
    
    @Query("SELECT er FROM EventRegistration er WHERE er.event.id = :eventId AND er.paymentStatus = :status ORDER BY er.registrationDate ASC")
    List<EventRegistration> findByEventIdAndPaymentStatus(@Param("eventId") Long eventId, @Param("status") PaymentStatus status);
    
    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event.id = :eventId AND er.paymentStatus = 'COMPLETED'")
    Long countConfirmedAttendeesByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.user.id = :userId AND er.paymentStatus = 'COMPLETED'")
    Long countCompletedRegistrationsByUserId(@Param("userId") Long userId);
    
    Optional<EventRegistration> findByStripePaymentIntentId(String stripePaymentIntentId);
    
    @Query("SELECT er FROM EventRegistration er WHERE er.event.id = :eventId AND er.isConfirmed = true ORDER BY er.registrationDate ASC")
    List<EventRegistration> findConfirmedAttendeesByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT er FROM EventRegistration er WHERE er.event.id = :eventId AND er.isConfirmed = true ORDER BY er.registrationDate ASC")
    Page<EventRegistration> findConfirmedAttendeesByEventId(@Param("eventId") Long eventId, Pageable pageable);
}