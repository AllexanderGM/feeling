package com.tours.infrastructure.repositories.user;

import com.tours.infrastructure.entities.user.Role;
import com.tours.infrastructure.entities.user.UserRol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IRoleUserRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByUserRol(UserRol userRol);
}
