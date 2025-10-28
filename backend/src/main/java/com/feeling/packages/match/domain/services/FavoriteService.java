package com.feeling.packages.match.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.match.domain.dto.FavoriteRequestDTO;
import com.feeling.packages.match.domain.dto.FavoriteResponseDTO;
import com.feeling.packages.match.infrastructure.entities.UserFavorite;
import com.feeling.packages.match.infrastructure.repositories.IMatchRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserFavoriteRepository;
import com.feeling.packages.user.domain.dto.mapper.UserResponseFactory;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio que administra la relación de favoritos entre usuarios.
 * <p>
 * Gestiona la creación y eliminación de favoritos, además de exponer consultas
 * paginadas y contadores para la experiencia de usuario.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final IUserFavoriteRepository userFavoriteRepository;
    private final IUserRepository userRepository;
    private final UserResponseFactory userResponseFactory;
    private final MatchSuggestionService matchSuggestionService;
    private final IMatchRepository matchRepository;

    @Transactional
    public FavoriteResponseDTO addFavorite(User user, FavoriteRequestDTO request) {
        log.info("User {} adding user {} to favorites", user.getId(), request.getFavoriteUserId());

        if (user.getId().equals(request.getFavoriteUserId())) {
            throw new BadRequestException("No puedes agregarte a favoritos.");
        }

        User favoriteUser = userRepository.findById(request.getFavoriteUserId())
            .orElseThrow(() -> new NotFoundException("No se encontró al usuario con id: " + request.getFavoriteUserId()));

        if (userFavoriteRepository.existsByUserAndFavoriteUser(user, favoriteUser)) {
            throw new BadRequestException("Este usuario ya está en tus favoritos.");
        }

        matchSuggestionService.removeDismissed(user, request.getFavoriteUserId());

        if (matchRepository.existsRejectedMatchBetweenUsers(user, favoriteUser)) {
            throw new BadRequestException("No puedes agregar a favoritos un usuario con quien ya rechazaste un match.");
        }

        UserFavorite userFavorite = new UserFavorite(user, favoriteUser);
        userFavorite = userFavoriteRepository.save(userFavorite);

        log.info("User {} successfully added user {} to favorites", user.getId(), favoriteUser.getId());

        return convertToResponseDTO(userFavorite, user);
    }

    @Transactional
    public void removeFavorite(User user, Long favoriteUserId) {
        log.info("User {} removing user {} from favorites", user.getId(), favoriteUserId);

        User favoriteUser = userRepository.findById(favoriteUserId)
            .orElseThrow(() -> new NotFoundException("No se encontró al usuario con id: " + favoriteUserId));

        UserFavorite userFavorite = userFavoriteRepository.findByUserAndFavoriteUser(user, favoriteUser)
            .orElseThrow(() -> new NotFoundException("No se encontró este favorito."));

        userFavoriteRepository.delete(userFavorite);

        log.info("User {} successfully removed user {} from favorites", user.getId(), favoriteUserId);
    }

    @Transactional(readOnly = true)
    public Page<FavoriteResponseDTO> getUserFavorites(User user, Pageable pageable) {
        log.debug("Getting favorites for user: {}", user.getId());
        Page<UserFavorite> favoritesPage = userFavoriteRepository.findUserFavorites(user, pageable);

        return favoritesPage.map(favorite -> convertToResponseDTO(favorite, user));
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(User user, Long favoriteUserId) {
        log.debug("Checking if user {} is favorite of user {}", favoriteUserId, user.getId());

        return userRepository.findById(favoriteUserId)
            .map(favoriteUser -> userFavoriteRepository.existsByUserAndFavoriteUser(user, favoriteUser))
            .orElse(false);
    }

    @Transactional(readOnly = true)
    public Long countUserFavorites(User user) {
        log.debug("Counting favorites for user: {}", user.getId());
        return userFavoriteRepository.countUserFavorites(user);
    }

    private FavoriteResponseDTO convertToResponseDTO(UserFavorite userFavorite, User currentUser) {
        UserResponseDTO favoriteUserDTO = userResponseFactory.create(
            userFavorite.getFavoriteUser(),
            UserResponseLevel.PUBLIC
        );

        // Determinar estado de match con este usuario favorito
        Long favoriteUserId = userFavorite.getFavoriteUser().getId();
        boolean hasPendingMatch = matchRepository.existsPendingMatchBetweenUsers(currentUser, userFavorite.getFavoriteUser());
        boolean hasAcceptedMatch = matchRepository.existsAcceptedMatchBetweenUsers(currentUser, userFavorite.getFavoriteUser());

        return new FavoriteResponseDTO(
            userFavorite.getId(),
            favoriteUserDTO,
            userFavorite.getCreatedAt(),
            hasPendingMatch,
            hasAcceptedMatch
        );
    }
}
