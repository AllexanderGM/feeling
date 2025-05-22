package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.UserVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUserVerificationCodeRepository extends JpaRepository<UserVerificationCode, Long> {
    Optional<UserVerificationCode> findByCode(String code);

    Optional<UserVerificationCode> findByUserId(Long userId);
}
