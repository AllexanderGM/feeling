package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.UserRole;
import com.feeling.packages.user.infrastructure.entities.UserRoleList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUserRoleRepository extends JpaRepository<UserRole, Long> {
    Optional<UserRole> findByUserRoleList(UserRoleList userRoleList);
}
