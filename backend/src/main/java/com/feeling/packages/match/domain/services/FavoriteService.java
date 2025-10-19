package com.feeling.packages.match.domain.services;

import com.feeling.packages.match.domain.dto.FavoriteRequestDTO;
import com.feeling.packages.match.domain.dto.FavoriteResponseDTO;
import com.feeling.packages.match.infrastructure.entities.UserFavorite;
import com.feeling.packages.match.infrastructure.repositories.IMatchRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserFavoriteRepository;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.services.UserService;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final IUserFavoriteRepository userFavoriteRepository;
    private final IUserRepository userRepository;
    private final UserService userService;
    private final MatchSuggestionService matchSuggestionService;
    private final IMatchRepository matchRepository;

    @Transactional
    public FavoriteResponseDTO addFavorite(User user, FavoriteRequestDTO request) {
        log.info("User {} adding user {} to favorites", user.getId(), request.getFavoriteUserId());

        if (user.getId().equals(request.getFavoriteUserId())) {
            throw new RuntimeException("No puedes agregarte a favoritos.");
        }

        User favoriteUser = userRepository.findById(request.getFavoriteUserId())
            .orElseThrow(() -> new RuntimeException("No se encontró al usuario con id: " + request.getFavoriteUserId()));

        if (userFavoriteRepository.existsByUserAndFavoriteUser(user, favoriteUser)) {
            throw new RuntimeException("Este usuario ya está en tus favoritos.");
        }

        // Un usuario descartado no puede añadirse a favoritos
        // Si estaba descartado, eliminamos el descarte para permitir el favorito
        matchSuggestionService.removeDismissed(user, request.getFavoriteUserId());

        // Si existe un match rechazado entre ambos, no permitir favorito
        if (matchRepository.existsRejectedMatchBetweenUsers(user, favoriteUser)) {
            throw new RuntimeException("No puedes agregar a favoritos un usuario con quien ya rechazaste un match.");
        }

        UserFavorite userFavorite = new UserFavorite(user, favoriteUser);
        userFavorite = userFavoriteRepository.save(userFavorite);

        log.info("User {} successfully added user {} to favorites", user.getId(), favoriteUser.getId());

        return convertToResponseDTO(userFavorite);
    }

    @Transactional
    public void removeFavorite(User user, Long favoriteUserId) {
        log.info("User {} removing user {} from favorites", user.getId(), favoriteUserId);

        User favoriteUser = userRepository.findById(favoriteUserId)
            .orElseThrow(() -> new RuntimeException("No se encontró al usuario con id: " + favoriteUserId));

        UserFavorite userFavorite = userFavoriteRepository.findByUserAndFavoriteUser(user, favoriteUser)
            .orElseThrow(() -> new RuntimeException("No se encontró este favorito."));

        userFavoriteRepository.delete(userFavorite);

        log.info("User {} successfully removed user {} from favorites", user.getId(), favoriteUserId);
    }

    public Page<FavoriteResponseDTO> getUserFavorites(User user, Pageable pageable) {
        log.debug("Getting favorites for user: {}", user.getId());
        return userFavoriteRepository.findUserFavorites(user, pageable)
            .map(this::convertToResponseDTO);
    }

    public boolean isFavorite(User user, Long favoriteUserId) {
        log.debug("Checking if user {} is favorite of user {}", favoriteUserId, user.getId());

        try {
            User favoriteUser = userRepository.findById(favoriteUserId)
                .orElse(null);

            if (favoriteUser == null) {
                return false;
            }

            return userFavoriteRepository.existsByUserAndFavoriteUser(user, favoriteUser);
        } catch (Exception e) {
            log.error("Error checking if user is favorite", e);
            return false;
        }
    }

    public Long countUserFavorites(User user) {
        log.debug("Counting favorites for user: {}", user.getId());
        return userFavoriteRepository.countUserFavorites(user);
    }

    private FavoriteResponseDTO convertToResponseDTO(UserFavorite userFavorite) {
        UserResponseDTO favoriteUserDTO = userService.get(userFavorite.getFavoriteUser().getEmail(), null, "public");

        return new FavoriteResponseDTO(
            userFavorite.getId(),
            favoriteUserDTO,
            userFavorite.getCreatedAt()
        );
    }
}
