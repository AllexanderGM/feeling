package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_category_interest")
public class UserCategoryInterest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_interest_enum", length = 20, unique = true)
    @Enumerated(EnumType.STRING)
    private UserCategoryInterestList categoryInterestEnum;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "icon", length = 10)
    private String icon;

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    // Features como JSON o tabla separada
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "category_features",
            joinColumns = @JoinColumn(name = "category_id")
    )
    @Column(name = "feature", length = 500)
    private List<String> features;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructor de compatibilidad
    public UserCategoryInterest(UserCategoryInterestList categoryInterest) {
        this.categoryInterestEnum = categoryInterest;
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
