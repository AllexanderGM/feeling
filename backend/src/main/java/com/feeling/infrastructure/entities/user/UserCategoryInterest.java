package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_category_interest")
public class UserCategoryInterest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_interest", length = 20)
    @Enumerated(EnumType.STRING)
    private UserCategoryInterestList categoryInterest;

    public UserCategoryInterest(UserCategoryInterestList categoryInterest) {
        this.categoryInterest = categoryInterest;
    }
}
