package com.feeling.packages.match.infrastructure.entities;

import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_dismissed_suggestions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "dismissed_user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDismissedSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dismissed_user_id", nullable = false)
    private User dismissedUser;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public UserDismissedSuggestion(User user, User dismissedUser) {
        this.user = user;
        this.dismissedUser = dismissedUser;
    }
}
