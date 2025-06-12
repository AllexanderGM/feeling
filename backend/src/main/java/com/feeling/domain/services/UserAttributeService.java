package com.feeling.domain.services;

import com.feeling.domain.dto.user.UserAttributeDTO;
import com.feeling.infrastructure.entities.user.UserAttribute;
import com.feeling.infrastructure.repositories.user.IUserAttributeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAttributeService {

    private final IUserAttributeRepository userAttributeRepository;

    /**
     * Obtiene todos los atributos agrupados por tipo
     */
    public Map<String, List<UserAttributeDTO>> getAllAttributesGrouped() {
        List<UserAttribute> attributes = userAttributeRepository.findByActiveTrue();

        return attributes.stream()
                .map(UserAttributeDTO::new)
                .collect(Collectors.groupingBy(UserAttributeDTO::attributeType));
    }

    /**
     * Obtiene atributos de un tipo específico
     */
    public List<UserAttributeDTO> getAttributesByType(String attributeType) {
        return userAttributeRepository.findByAttributeTypeOrderedByDisplay(attributeType.toUpperCase())
                .stream()
                .map(UserAttributeDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un atributo por ID
     */
    public UserAttributeDTO getAttributeById(Long id) {
        return userAttributeRepository.findById(id)
                .map(UserAttributeDTO::new)
                .orElse(null);
    }
}
