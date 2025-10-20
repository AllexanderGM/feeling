package com.feeling.packages.booking.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.feeling.packages.booking.infrastructure.entities.Booking;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BookingResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventTitle;
    private String eventDescription;
    private String eventLocation;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime bookingDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    private Integer attendees;
    private BigDecimal totalPrice;
    private String currency;
    private String status;
    private String specialRequests;
    private String paymentMethod;
    private String paymentIntentId;
    private String paymentStatus;
    private String paymentClientSecret;

    public BookingResponseDTO(Booking booking) {
        this.id = booking.getId();
        this.userId = booking.getUser().getId();
        this.userName = booking.getUser().getName() + " " + booking.getUser().getLastName();
        this.eventId = booking.getEvent().getId();
        this.eventTitle = booking.getEvent().getTitle();
        this.eventDescription = booking.getEvent().getDescription();
        this.eventLocation = booking.getEvent().getLocation();
        this.bookingDate = booking.getBookingDate();
        this.createdAt = booking.getCreatedAt();
        this.updatedAt = booking.getUpdatedAt();
        this.attendees = booking.getAttendees();
        this.totalPrice = booking.getTotalPrice();
        this.currency = booking.getCurrency();
        this.status = booking.getStatus().name();
        this.specialRequests = booking.getSpecialRequests();
        this.paymentIntentId = booking.getPaymentIntentId();
        this.paymentStatus = booking.getPaymentStatus();

        if (booking.getPayment() != null && booking.getPayment().getPaymentMethod() != null) {
            this.paymentMethod = booking.getPayment().getPaymentMethod().getName();
        }
    }
}
