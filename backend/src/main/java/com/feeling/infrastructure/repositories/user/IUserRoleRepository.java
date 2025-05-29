package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.UserRole;
import com.feeling.infrastructure.entities.user.UserRoleList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUserRoleRepository extends JpaRepository<UserRole, Long> {
    Optional<UserRole> findByUserRoleList(UserRoleList userRoleList);
}
