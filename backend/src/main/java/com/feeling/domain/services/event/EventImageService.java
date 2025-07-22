package com.feeling.domain.services.event;

import com.feeling.domain.services.storage.StorageService;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.event.Event;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.event.IEventRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventImageService {
    
    private final StorageService storageService;
    private final IEventRepository eventRepository;
    private final IUserRepository userRepository;
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String EVENTS_FOLDER = "events";

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public String uploadMainImage(Long eventId, MultipartFile imageFile, String userEmail) throws IOException {
        Event event = validateEventAndPermissions(eventId, userEmail);
        validateImageFile(imageFile);
        
        String imageUrl = storageService.uploadImage(imageFile, EVENTS_FOLDER);
        
        // Delete old image if exists
        if (event.getMainImage() != null) {
            storageService.deleteImage(event.getMainImage());
        }
        
        event.setMainImage(imageUrl);
        eventRepository.save(event);
        
        return imageUrl;
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public String updateMainImage(Long eventId, MultipartFile imageFile, String userEmail) throws IOException {
        Event event = validateEventAndPermissions(eventId, userEmail);
        validateImageFile(imageFile);
        
        // Delete old image if exists
        if (event.getMainImage() != null) {
            storageService.deleteImage(event.getMainImage());
        }
        
        String imageUrl = storageService.uploadImage(imageFile, EVENTS_FOLDER);
        event.setMainImage(imageUrl);
        eventRepository.save(event);
        
        return imageUrl;
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public void deleteMainImage(Long eventId, String userEmail) {
        Event event = validateEventAndPermissions(eventId, userEmail);
        
        if (event.getMainImage() != null) {
            storageService.deleteImage(event.getMainImage());
            event.setMainImage(null);
            eventRepository.save(event);
        }
    }

    public List<String> uploadGalleryImages(Long eventId, List<MultipartFile> imageFiles, String userEmail) throws IOException {
        Event event = validateEventAndPermissions(eventId, userEmail);
        
        if (imageFiles.size() > 5) {
            throw new BadRequestException("No se pueden subir más de 5 imágenes a la vez");
        }
        
        // Validate all files first
        for (MultipartFile file : imageFiles) {
            validateImageFile(file);
        }
        
        return storageService.uploadImages(imageFiles, EVENTS_FOLDER);
    }

    public String getMainImageUrl(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
        
        return event.getMainImage();
    }

    private Event validateEventAndPermissions(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        
        // Only the creator or admin can manage event images
        if (!event.getCreatedBy().getId().equals(user.getId()) && 
            !user.getUserRole().getAuthority().equals("ADMIN")) {
            throw new UnauthorizedException("No tienes permisos para gestionar las imágenes de este evento");
        }
        
        return event;
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("El archivo de imagen es requerido");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("El archivo excede el tamaño máximo permitido de 5MB");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Nombre de archivo inválido");
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Formato de archivo no permitido. Solo se permiten: " + 
                String.join(", ", ALLOWED_EXTENSIONS));
        }
        
        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("El archivo debe ser una imagen");
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}