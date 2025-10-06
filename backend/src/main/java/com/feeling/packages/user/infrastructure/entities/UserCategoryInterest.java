package com.feeling.packages.user.infrastructure.entities;

import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa las categorías de interés disponibles en la plataforma Feeling.
 * Define los diferentes tipos de experiencias y conexiones que los usuarios pueden buscar.
 * <p>
 * Las categorías principales son:
 * - ESSENCE: Conexiones auténticas y relaciones emocionales profundas
 * - ROUSE: Experiencias sensuales y encuentros apasionados
 * - SPIRIT: Conexiones espirituales y compatibilidad de valores
 * <p>
 * Esta entidad gestiona:
 * - Información descriptiva de cada categoría
 * - Características específicas (features) de cada experiencia
 * - Público objetivo y contenido personalizado
 * - Configuración de presentación (iconos, orden)
 * - Estado de activación para mostrar/ocultar categorías
 * <p>
 * Cada categoría determina:
 * - Algoritmos de matching específicos
 * - Campos obligatorios en el perfil del usuario
 * - Funcionalidades disponibles en la aplicación
 * - Contenido y experiencia personalizada
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_category_interest")
public class UserCategoryInterest {

    /**
     * Identificador único de la categoría de interés.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Valor enum que identifica la categoría de manera única.
     * Corresponde a ESSENCE, ROUSE o SPIRIT.
     */
    @Column(name = "category_interest_enum", length = 20, unique = true)
    @Enumerated(EnumType.STRING)
    private UserCategoryInterestList categoryInterestEnum;

    /**
     * Nombre legible de la categoría para mostrar en la interfaz de usuario.
     * Ejemplo: "Essence", "Rouse", "Spirit"
     */
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    /**
     * Descripción breve de la categoría (hasta 500 caracteres).
     * Texto conciso que explica qué tipo de experiencia ofrece.
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * Nombre del icono asociado a la categoría.
     * Utilizado para la representación visual en la interfaz.
     */
    @Column(name = "icon", length = 10)
    private String icon;

    /**
     * Descripción completa y detallada de la categoría.
     * Texto extenso que explica en profundidad la experiencia, valores y propósito.
     */
    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    /**
     * Descripción del público objetivo de la categoría.
     * Define el perfil de usuarios ideal para cada tipo de experiencia.
     */
    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    /**
     * Lista de características específicas de la categoría.
     * Define las funcionalidades y beneficios únicos que ofrece cada experiencia.
     * Almacenado en tabla separada para flexibilidad.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "category_features",
        joinColumns = @JoinColumn(name = "category_id")
    )
    @Column(name = "feature", length = 500)
    private List<String> features;

    /**
     * Indica si la categoría está activa y disponible para selección.
     * Permite desactivar categorías temporalmente sin eliminar datos.
     */
    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    /**
     * Orden de presentación en la interfaz de usuario.
     * Números menores aparecen primero en listas y selecciones.
     */
    @Column(name = "display_order")
    private Integer displayOrder;

    /**
     * Fecha y hora de creación de la categoría.
     */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora de la última actualización.
     * Se actualiza automáticamente con @PreUpdate.
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ========================================
    // CONSTRUCTORES DE UTILIDAD
    // ========================================

    /**
     * Constructor de compatibilidad para crear una categoría básica desde el enum.
     * Útil para migración de datos y casos donde solo se necesita el tipo de categoría.
     *
     * @param categoryInterest Enum de la categoría (ESSENCE, ROUSE, SPIRIT)
     */
    public UserCategoryInterest(UserCategoryInterestList categoryInterest) {
        this.categoryInterestEnum = categoryInterest;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    // ========================================
    // MÉTODOS DEL CICLO DE VIDA JPA
    // ========================================

    /**
     * Método ejecutado automáticamente antes de actualizar la entidad.
     * Actualiza la fecha de modificación.
     */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ========================================
    // MÉTODOS DE UTILIDAD PARA NEGOCIO
    // ========================================

    /**
     * Verifica si la categoría está disponible para selección por usuarios.
     *
     * @return true si la categoría está activa
     */
    public boolean isAvailable() {
        return this.isActive;
    }

    /**
     * Activa la categoría para que esté disponible para los usuarios.
     */
    public void activate() {
        this.isActive = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Desactiva la categoría sin eliminar los datos.
     * Los usuarios existentes conservan su categoría, pero no estará disponible para nuevas selecciones.
     */
    public void deactivate() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Verifica si esta es la categoría ESSENCE.
     *
     * @return true si es categoría ESSENCE
     */
    public boolean isEssence() {
        return UserCategoryInterestList.ESSENCE.equals(this.categoryInterestEnum);
    }

    /**
     * Verifica si esta es la categoría ROUSE.
     *
     * @return true si es categoría ROUSE
     */
    public boolean isRouse() {
        return UserCategoryInterestList.ROUSE.equals(this.categoryInterestEnum);
    }

    /**
     * Verifica si esta es la categoría SPIRIT.
     *
     * @return true si es categoría SPIRIT
     */
    public boolean isSpirit() {
        return UserCategoryInterestList.SPIRIT.equals(this.categoryInterestEnum);
    }

    /**
     * Obtiene el nombre de la categoría para mostrar, usando el nombre personalizado o el enum como fallback.
     *
     * @return Nombre de la categoría para mostrar al usuario
     */
    public String getDisplayName() {
        return (this.name != null && !this.name.trim().isEmpty()) ?
            this.name : this.categoryInterestEnum.name();
    }

    /**
     * Obtiene una descripción para mostrar, usando la descripción personalizada o la completa como fallback.
     *
     * @return Descripción de la categoría para mostrar al usuario
     */
    public String getDisplayDescription() {
        if (this.description != null && !this.description.trim().isEmpty()) {
            return this.description;
        }
        return (this.fullDescription != null && !this.fullDescription.trim().isEmpty()) ?
            this.fullDescription : "Experiencia " + getDisplayName();
    }

    /**
     * Añade una nueva característica a la lista de features de la categoría.
     *
     * @param feature Característica a añadir
     */
    public void addFeature(String feature) {
        if (this.features == null) {
            this.features = new java.util.ArrayList<>();
        }
        if (feature != null && !feature.trim().isEmpty() && !this.features.contains(feature.trim())) {
            this.features.add(feature.trim());
            this.updatedAt = LocalDateTime.now();
        }
    }

    /**
     * Remueve una característica de la lista de features.
     *
     * @param feature Característica a remover
     */
    public void removeFeature(String feature) {
        if (this.features != null && feature != null) {
            this.features.remove(feature.trim());
            this.updatedAt = LocalDateTime.now();
        }
    }
}
