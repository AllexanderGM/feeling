package com.feeling.packages.auth.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.auth.infrastructure.entities.AuthVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IAuthVerificationCodeRepository extends JpaRepository<AuthVerificationCode, Long> {
    Optional<AuthVerificationCode> findByCode(String code);

    Optional<AuthVerificationCode> findByUserId(Long userId);

    Optional<AuthVerificationCode> findByUserAndCode(User user, String code);

    List<AuthVerificationCode> findByExpirationTimeBefore(LocalDateTime dateTime);
}
