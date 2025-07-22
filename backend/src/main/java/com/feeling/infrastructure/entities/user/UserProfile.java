package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    
    @Id
    private Long userId; // Mismo ID que User para relación 1:1
    
    // ========================================
    // DATOS PERSONALES BÁSICOS
    // ========================================
    
    @ElementCollection
    @CollectionTable(name = "user_profile_images", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();
    
    @Pattern(regexp = "^$|^[0-9]{7,15}$", message = "El documento debe contener entre 7 y 15 dígitos")
    private String document;
    
    @Pattern(regexp = "^$|^\\d{7,15}$", message = "El teléfono debe contener entre 7 y 15 dígitos")
    private String phone;
    
    @Pattern(regexp = "^$|^\\+\\d{1,4}$", message = "El código de país debe tener formato +XX")
    @Column(name = "phone_code")
    private String phoneCode;
    
    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // ========================================
    // UBICACIÓN GEOGRÁFICA
    // ========================================
    
    @Size(max = 100, message = "El país no puede exceder 100 caracteres")
    private String country;
    
    @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
    private String city;
    
    @Size(max = 100, message = "El departamento no puede exceder 100 caracteres")
    private String department;
    
    @Size(max = 100, message = "La localidad no puede exceder 100 caracteres")
    private String locality;
    
    // ========================================
    // CARACTERÍSTICAS FÍSICAS
    // ========================================
    
    @Min(value = 100, message = "La altura mínima es 100 cm")
    @Max(value = 250, message = "La altura máxima es 250 cm")
    @Column(name = "height_cm")
    private Integer height;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private UserAttribute gender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eye_color_id")
    private UserAttribute eyeColor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hair_color_id")
    private UserAttribute hairColor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_type_id")
    private UserAttribute bodyType;
    
    // ========================================
    // INFORMACIÓN SOCIO-ECONÓMICA
    // ========================================
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marital_status_id")
    private UserAttribute maritalStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "education_level_id")
    private UserAttribute education;
    
    @Size(max = 100, message = "La profesión no puede exceder 100 caracteres")
    private String profession;
    
    // ========================================
    // CAMPOS DE AUDITORIA
    // ========================================
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // ========================================
    // RELACIÓN CON USER
    // ========================================
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================
    
    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }
    
    public String getMainImage() {
        if (images != null && !images.isEmpty()) {
            return images.get(0);
        }
        return null;
    }
    
    public boolean hasCompleteBasicInfo() {
        return document != null && !document.trim().isEmpty() &&
               phone != null && !phone.trim().isEmpty() &&
               dateOfBirth != null &&
               country != null && !country.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               images != null && !images.isEmpty();
    }
    
    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN
    // ========================================
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
}