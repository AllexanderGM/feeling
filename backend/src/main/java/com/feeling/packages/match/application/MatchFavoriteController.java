package com.feeling.packages.match.application;

import com.feeling.packages.match.domain.dto.FavoriteRequestDTO;
import com.feeling.packages.match.domain.dto.FavoriteResponseDTO;
import com.feeling.packages.match.domain.services.FavoriteService;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchFavoriteController {

    private final FavoriteService favoriteService;
    private final UserAuthorizationService userAuthorizationService;

    // ========================================
    // CLIENTE - CREACIÓN
    // ========================================

    @PostMapping("/favorites")
    public ResponseEntity<FavoriteResponseDTO> addFavorite(
        @Valid @RequestBody FavoriteRequestDTO request,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} adding favorite", user.getId());

        FavoriteResponseDTO result = favoriteService.addFavorite(user, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/favorites/{favoriteUserId}")
    public ResponseEntity<Void> removeFavorite(
        @PathVariable Long favoriteUserId,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} removing favorite {}", user.getId(), favoriteUserId);

        favoriteService.removeFavorite(user, favoriteUserId);
        return ResponseEntity.ok().build();
    }

    // ========================================
    // CLIENTE - LECTURAS
    // ========================================

    @GetMapping("/favorites")
    public ResponseEntity<Page<FavoriteResponseDTO>> getFavorites(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);

        Page<FavoriteResponseDTO> favorites = favoriteService.getUserFavorites(user, pageable);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/favorites/{userId}/check")
    public ResponseEntity<Map<String, Boolean>> checkIfFavorite(
        @PathVariable Long userId,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        boolean isFavorite = favoriteService.isFavorite(user, userId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);

        return ResponseEntity.ok(response);
    }
}
