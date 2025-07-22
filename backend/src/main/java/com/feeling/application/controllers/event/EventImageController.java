package com.feeling.application.controllers.event;

import com.feeling.domain.services.event.EventImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}/images")
@RequiredArgsConstructor
@Tag(name = "Event Images", description = "Event image management endpoints")
public class EventImageController {
    
    private final EventImageService eventImageService;

    @PostMapping("/main")
    @Operation(summary = "Upload main event image", description = "Upload the main image for an event")
    public ResponseEntity<Map<String, String>> uploadMainImage(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @Parameter(description = "Image file") @RequestParam("image") MultipartFile imageFile,
            Authentication authentication) throws IOException {
        
        String userEmail = authentication.getName();
        String imageUrl = eventImageService.uploadMainImage(eventId, imageFile, userEmail);
        
        return ResponseEntity.ok(Map.of(
            "message", "Imagen principal subida exitosamente",
            "imageUrl", imageUrl
        ));
    }

    @PutMapping("/main")
    @Operation(summary = "Update main event image", description = "Replace the main image for an event")
    public ResponseEntity<Map<String, String>> updateMainImage(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @Parameter(description = "New image file") @RequestParam("image") MultipartFile imageFile,
            Authentication authentication) throws IOException {
        
        String userEmail = authentication.getName();
        String imageUrl = eventImageService.updateMainImage(eventId, imageFile, userEmail);
        
        return ResponseEntity.ok(Map.of(
            "message", "Imagen principal actualizada exitosamente",
            "imageUrl", imageUrl
        ));
    }

    @DeleteMapping("/main")
    @Operation(summary = "Delete main event image", description = "Delete the main image for an event")
    public ResponseEntity<Map<String, String>> deleteMainImage(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        eventImageService.deleteMainImage(eventId, userEmail);
        
        return ResponseEntity.ok(Map.of(
            "message", "Imagen principal eliminada exitosamente"
        ));
    }

    @PostMapping("/gallery")
    @Operation(summary = "Upload gallery images", description = "Upload multiple images for event gallery (future feature)")
    public ResponseEntity<Map<String, Object>> uploadGalleryImages(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @Parameter(description = "Gallery image files") @RequestParam("images") List<MultipartFile> imageFiles,
            Authentication authentication) throws IOException {
        
        String userEmail = authentication.getName();
        List<String> imageUrls = eventImageService.uploadGalleryImages(eventId, imageFiles, userEmail);
        
        return ResponseEntity.ok(Map.of(
            "message", "Imágenes de galería subidas exitosamente",
            "imageUrls", imageUrls,
            "count", imageUrls.size()
        ));
    }

    @GetMapping("/main/url")
    @Operation(summary = "Get main image URL", description = "Get the URL of the main event image")
    public ResponseEntity<Map<String, String>> getMainImageUrl(
            @Parameter(description = "Event ID") @PathVariable Long eventId) {
        
        String imageUrl = eventImageService.getMainImageUrl(eventId);
        
        if (imageUrl != null) {
            return ResponseEntity.ok(Map.of(
                "imageUrl", imageUrl
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "message", "El evento no tiene imagen principal"
            ));
        }
    }
}