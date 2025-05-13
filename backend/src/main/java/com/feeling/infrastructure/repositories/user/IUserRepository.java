package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.Role;
import com.feeling.infrastructure.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByRole(Role role);
}
