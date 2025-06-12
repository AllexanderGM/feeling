package com.feeling.application.controllers;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserTagDTO;
import com.feeling.domain.dto.user.UserTagRequestDTO;
import com.feeling.domain.dto.user.UserTagStatisticsDTO;
import com.feeling.domain.dto.user.UserTagUpdateRequestDTO;
import com.feeling.domain.services.UserTagService;
import com.feeling.infrastructure.entities.user.UserTag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class UserTagController {

    private final UserTagService userTagService;

    // ========================================
    // GESTIÓN DE TAGS PERSONAL
    // ========================================

    /**
     * Obtiene todos los tags del usuario autenticado
     */
    @GetMapping("/my-tags")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserTagDTO>> getMyTags() {
        String userEmail = getCurrentUserEmail();
        List<UserTagDTO> tags = userTagService.getUserTags(userEmail);
        return ResponseEntity.ok(tags);
    }

    /**
     * Añade un nuevo tag al perfil del usuario
     */
    @PostMapping("/my-tags")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserTagDTO> addTagToMyProfile(@Valid @RequestBody UserTagRequestDTO request) {
        String userEmail = getCurrentUserEmail();
        UserTag tag = userTagService.addTagToUser(userEmail, request.name());
        return ResponseEntity.ok(new UserTagDTO(tag));
    }

    /**
     * Remueve un tag del perfil del usuario
     */
    @DeleteMapping("/my-tags/{tagName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponseDTO> removeTagFromMyProfile(@PathVariable String tagName) {
        String userEmail = getCurrentUserEmail();
        MessageResponseDTO response = userTagService.removeTagFromUser(userEmail, tagName);
        return ResponseEntity.ok(response);
    }

    /**
     * Reemplaza todos los tags del usuario con una nueva lista
     */
    @PutMapping("/my-tags")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserTagDTO>> updateMyTags(@Valid @RequestBody UserTagUpdateRequestDTO request) {
        String userEmail = getCurrentUserEmail();
        List<UserTagDTO> updatedTags = userTagService.replaceUserTags(userEmail, request.tags());
        return ResponseEntity.ok(updatedTags);
    }

    // ========================================
    // BÚSQUEDA Y DESCUBRIMIENTO
    // ========================================

    /**
     * Busca tags por nombre
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserTagDTO>> searchTags(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "20") int limit) {
        List<UserTagDTO> tags = userTagService.searchTags(query, limit);
        return ResponseEntity.ok(tags);
    }

    /**
     * Obtiene los tags más populares del sistema
     */
    @GetMapping("/popular")
    public ResponseEntity<List<UserTagDTO>> getPopularTags(
            @RequestParam(defaultValue = "20") int limit) {
        List<UserTagDTO> tags = userTagService.getPopularTags(limit);
        return ResponseEntity.ok(tags);
    }

    /**
     * Obtiene los tags en tendencia
     */
    @GetMapping("/trending")
    public ResponseEntity<List<UserTagDTO>> getTrendingTags(
            @RequestParam(defaultValue = "15") int limit) {
        List<UserTagDTO> tags = userTagService.getTrendingTags(limit);
        return ResponseEntity.ok(tags);
    }

    /**
     * Obtiene sugerencias de tags para el usuario autenticado
     */
    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserTagDTO>> getTagSuggestions(
            @RequestParam(defaultValue = "10") int limit) {
        String userEmail = getCurrentUserEmail();
        List<UserTagDTO> suggestions = userTagService.getSuggestedTagsForUser(userEmail, limit);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Obtiene sugerencias de tags basadas en la categoría del usuario
     */
    @GetMapping("/suggestions/category")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserTagDTO>> getCategorySuggestions() {
        String userEmail = getCurrentUserEmail();
        List<UserTagDTO> suggestions = userTagService.getTagsSuggestedByCategory(userEmail);
        return ResponseEntity.ok(suggestions);
    }

    // ========================================
    // MATCHING Y COMPATIBILIDAD
    // ========================================

    /**
     * Encuentra usuarios con tags similares para matching
     */
    @GetMapping("/similar-users")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> findUsersWithSimilarTags(
            @RequestParam(defaultValue = "10") int limit) {
        String userEmail = getCurrentUserEmail();
        List<String> similarUsers = userTagService.findUsersWithSimilarTags(userEmail, limit);
        return ResponseEntity.ok(similarUsers);
    }

    /**
     * Calcula la compatibilidad con otro usuario basada en tags
     */
    @GetMapping("/compatibility/{otherUserEmail}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Double> calculateCompatibility(@PathVariable String otherUserEmail) {
        String userEmail = getCurrentUserEmail();
        double compatibility = userTagService.calculateTagCompatibility(userEmail, otherUserEmail);
        return ResponseEntity.ok(compatibility);
    }

    /**
     * Obtiene recomendaciones de usuarios para matching basadas en tags
     */
    @GetMapping("/match-recommendations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getMatchRecommendations(
            @RequestParam(defaultValue = "20") int limit) {
        String userEmail = getCurrentUserEmail();
        List<String> recommendations = userTagService.getMatchRecommendationsByTags(userEmail, limit);
        return ResponseEntity.ok(recommendations);
    }

    // ========================================
    // ESTADÍSTICAS Y ANÁLISIS
    // ========================================

    /**
     * Obtiene estadísticas generales del sistema de tags
     */
    @GetMapping("/statistics")
    public ResponseEntity<UserTagStatisticsDTO> getTagStatistics() {
        UserTagStatisticsDTO statistics = userTagService.getTagStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Obtiene tags populares por categoría de interés
     */
    @GetMapping("/popular/category/{categoryInterest}")
    public ResponseEntity<List<UserTagDTO>> getPopularTagsByCategory(
            @PathVariable String categoryInterest,
            @RequestParam(defaultValue = "15") int limit) {
        List<UserTagDTO> tags = userTagService.getPopularTagsByCategory(categoryInterest, limit);
        return ResponseEntity.ok(tags);
    }

    // ========================================
    // ADMINISTRACIÓN (Solo para ADMIN)
    // ========================================

    /**
     * Limpieza manual de tags sin uso (solo administradores)
     */
    @PostMapping("/admin/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponseDTO> cleanupUnusedTags() {
        String adminEmail = getCurrentUserEmail();
        MessageResponseDTO response = userTagService.cleanupUnusedTagsManually(adminEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Fuerza la actualización de métricas de tags (solo administradores)
     */
    @PostMapping("/admin/update-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponseDTO> updateTagMetrics() {
        userTagService.updateTagMetrics();
        return ResponseEntity.ok(new MessageResponseDTO("Métricas de tags actualizadas correctamente"));
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    /**
     * Obtiene el email del usuario autenticado
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
