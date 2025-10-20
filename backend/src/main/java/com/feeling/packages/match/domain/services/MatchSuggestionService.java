package com.feeling.packages.match.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.match.infrastructure.entities.UserDismissedSuggestion;
import com.feeling.packages.match.infrastructure.repositories.IUserDismissedRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio que administra las sugerencias descartadas por los usuarios.
 * <p>
 * Permite registrar descartes, consultar estados y limpiar registros cuando
 * cambia la relación entre usuarios (por ejemplo, al marcarlos como favoritos).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MatchSuggestionService {

    private final IUserDismissedRepository userDismissedRepository;
    private final IUserRepository userRepository;

    @Transactional
    public void dismissSuggestion(User user, Long targetUserId) {
        if (user.getId().equals(targetUserId)) {
            throw new BadRequestException("No puedes descartarte de las sugerencias.");
        }

        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new NotFoundException("No se encontró al usuario con id: " + targetUserId));

        userDismissedRepository.findByUserAndDismissedUser(user, targetUser)
            .ifPresentOrElse(
                dismissed -> {
                    dismissed.setUpdatedAt(LocalDateTime.now());
                    log.debug("Ya existía un descarte de sugerencia para el usuario {} y objetivo {}", user.getId(), targetUserId);
                },
                () -> {
                    userDismissedRepository.save(new UserDismissedSuggestion(user, targetUser));
                    log.info("User {} dismissed suggestion for user {}", user.getId(), targetUserId);
                }
            );
    }

    @Transactional(readOnly = true)
    public boolean isDismissed(User user, User targetUser) {
        return userDismissedRepository.findByUserAndDismissedUser(user, targetUser).isPresent();
    }

    @Transactional
    public void removeDismissed(User user, Long targetUserId) {
        userRepository.findById(targetUserId).ifPresent(target ->
            userDismissedRepository.findByUserAndDismissedUser(user, target)
                .ifPresent(userDismissedRepository::delete)
        );
    }
}
