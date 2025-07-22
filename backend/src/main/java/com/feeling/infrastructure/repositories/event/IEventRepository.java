package com.feeling.infrastructure.repositories.event;

import com.feeling.infrastructure.entities.event.Event;
import com.feeling.infrastructure.entities.event.EventCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IEventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByIsActiveTrueOrderByEventDateAsc();
    
    Page<Event> findByIsActiveTrueOrderByEventDateAsc(Pageable pageable);
    
    List<Event> findByCategoryAndIsActiveTrueOrderByEventDateAsc(EventCategory category);
    
    Page<Event> findByCategoryAndIsActiveTrueOrderByEventDateAsc(EventCategory category, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.eventDate >= :fromDate ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.eventDate >= :fromDate ORDER BY e.eventDate ASC")
    Page<Event> findUpcomingEvents(@Param("fromDate") LocalDateTime fromDate, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND " +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY e.eventDate ASC")
    List<Event> searchEvents(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND " +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY e.eventDate ASC")
    Page<Event> searchEvents(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.createdBy.id = :userId ORDER BY e.createdAt DESC")
    List<Event> findByCreatedBy(@Param("userId") Long userId);
    
    @Query("SELECT e FROM Event e WHERE e.createdBy.id = :userId ORDER BY e.createdAt DESC")
    Page<Event> findByCreatedBy(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(e) FROM Event e WHERE e.isActive = true")
    Long countActiveEvents();
    
    @Query("SELECT COUNT(e) FROM Event e WHERE e.isActive = true AND e.category = :category")
    Long countActiveEventsByCategory(@Param("category") EventCategory category);
}