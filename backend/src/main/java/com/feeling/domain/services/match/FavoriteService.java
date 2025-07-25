package com.feeling.domain.services.match;

import com.feeling.domain.dto.match.FavoriteRequestDTO;
import com.feeling.domain.dto.match.FavoriteResponseDTO;
import com.feeling.domain.dto.user.UserPublicResponseDTO;
import com.feeling.domain.services.user.UserService;
import com.feeling.infrastructure.entities.match.UserFavorite;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.match.IUserFavoriteRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
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

    @Transactional
    public FavoriteResponseDTO addFavorite(User user, FavoriteRequestDTO request) {
        log.info("User {} adding user {} to favorites", user.getId(), request.getFavoriteUserId());

        if (user.getId().equals(request.getFavoriteUserId())) {
            throw new RuntimeException("Cannot add yourself to favorites");
        }

        User favoriteUser = userRepository.findById(request.getFavoriteUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getFavoriteUserId()));

        if (userFavoriteRepository.existsByUserAndFavoriteUser(user, favoriteUser)) {
            throw new RuntimeException("User is already in favorites");
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
                .orElseThrow(() -> new RuntimeException("User not found with id: " + favoriteUserId));

        UserFavorite userFavorite = userFavoriteRepository.findByUserAndFavoriteUser(user, favoriteUser)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));

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
        UserPublicResponseDTO favoriteUserDTO = userService.convertToUserPublicResponseDTO(userFavorite.getFavoriteUser());

        return new FavoriteResponseDTO(
                userFavorite.getId(),
                favoriteUserDTO,
                userFavorite.getCreatedAt()
        );
    }
}