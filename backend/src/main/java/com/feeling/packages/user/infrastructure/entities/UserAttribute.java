package com.feeling.packages.user.infrastructure.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que representa un atributo de usuario predefinido en la plataforma Feeling.
 * Los atributos son valores estándar que los usuarios pueden seleccionar para describir sus características.
 * <p>
 * Esta entidad maneja características categorizadas como:
 * - Géneros (MALE, FEMALE, etc.)
 * - Religiones (CATHOLIC, PROTESTANT, etc.)
 * - Tipos de cuerpo (ATHLETIC, SLIM, etc.)
 * - Colores de ojos (BROWN, BLUE, etc.)
 * - Niveles educativos (HIGH_SCHOOL, UNIVERSITY, etc.)
 * - Estados civiles (SINGLE, MARRIED, etc.)
 * - Y otros atributos específicos por categoría de interés
 * <p>
 * Los atributos son gestionados por administradores y proporcionan:
 * - Consistencia en la información de usuarios
 * - Facilidad para búsquedas y matching
 * - Soporte multiidioma a través del campo 'name'
 * - Ordenamiento personalizable para formularios
 * - Activación/desactivación sin pérdida de datos
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "user_attributes", uniqueConstraints = @UniqueConstraint(columnNames = {"code", "attribute_type"}))
public class UserAttribute {
    /**
     * Identificador único del atributo en la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Código único identificador del atributo dentro de su tipo.
     * Se almacena en UPPERCASE para consistencia (ej: "MALE", "FEMALE", "CATHOLIC").
     * Es único en combinación con attributeType.
     */
    @Column(nullable = false)
    private String code;

    /**
     * Nombre legible del atributo para mostrar en la interfaz de usuario.
     * Puede ser personalizado por idioma (ej: "Masculino", "Femenino", "Católico").
     */
    @Column(nullable = false)
    private String name;

    /**
     * Tipo de atributo que categoriza este elemento.
     * Define a qué campo del usuario corresponde (ej: "GENDER", "RELIGION", "BODY_TYPE").
     * Se almacena en UPPERCASE para consistencia.
     */
    @Column(name = "attribute_type", nullable = false)
    private String attributeType;

    /**
     * Descripción opcional del atributo.
     * Puede contener información adicional para ayudar al usuario a entender la opción.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Campo de detalle flexible para información específica del atributo.
     * Puede contener: HTML, códigos de color, nombres de iconos, URLs, etc.
     * Ejemplos: "<i class='icon-male'></i>", "#3498db", "male-icon.svg"
     */
    @Column(columnDefinition = "TEXT")
    private String detail;

    /**
     * Orden de presentación del atributo en formularios y listas.
     * Números menores aparecen primero. Permite reorganizar sin modificar datos.
     */
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Indica si el atributo está activo para selección por usuarios.
     * Los atributos inactivos se mantienen en la base de datos, pero no están disponibles.
     * Útil para deprecar opciones sin afectar usuarios existentes.
     */
    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    /**
     * Fecha y hora de creación del atributo.
     */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora de la última actualización del atributo.
     * Se actualiza automáticamente con @PreUpdate.
     */
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ========================================
    // CONSTRUCTORES DE UTILIDAD
    // ========================================

    /**
     * Constructor básico para crear un atributo con los campos mínimos requeridos.
     * Normaliza automáticamente code y attributeType a UPPERCASE.
     *
     * @param code          Código del atributo (será convertido a UPPERCASE)
     * @param name          Nombre legible del atributo
     * @param attributeType Tipo del atributo (será convertido a UPPERCASE)
     */
    public UserAttribute(String code, String name, String attributeType) {
        this.code = code.toUpperCase();
        this.name = name;
        this.attributeType = attributeType.toUpperCase();
        this.active = true;
        this.displayOrder = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Constructor con descripción y orden de visualización.
     *
     * @param code          Código del atributo
     * @param name          Nombre legible del atributo
     * @param attributeType Tipo del atributo
     * @param description   Descripción opcional del atributo
     * @param displayOrder  Orden para mostrar en formularios (null = 0)
     */
    public UserAttribute(String code, String name, String attributeType, String description, Integer displayOrder) {
        this(code, name, attributeType);
        this.description = description;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    /**
     * Constructor que incluye campo de detalle personalizado.
     *
     * @param code          Código del atributo
     * @param name          Nombre legible del atributo
     * @param attributeType Tipo del atributo
     * @param description   Descripción opcional del atributo
     * @param detail        Información de detalle (HTML, color, icono, etc.)
     * @param displayOrder  Orden para mostrar en formularios
     */
    public UserAttribute(String code, String name, String attributeType, String description, String detail, Integer displayOrder) {
        this(code, name, attributeType);
        this.description = description;
        this.detail = detail;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    /**
     * Constructor completo con todos los parámetros opcionales.
     *
     * @param code          Código del atributo
     * @param name          Nombre legible del atributo
     * @param attributeType Tipo del atributo
     * @param description   Descripción opcional del atributo
     * @param detail        Información de detalle personalizada
     * @param displayOrder  Orden para mostrar en formularios
     * @param active        Si el atributo está activo para selección
     */
    public UserAttribute(String code, String name, String attributeType, String description, String detail, Integer displayOrder, boolean active) {
        this(code, name, attributeType, description, detail, displayOrder);
        this.active = active;
    }

    // ========================================
    // MÉTODOS DEL CICLO DE VIDA JPA
    // ========================================

    /**
     * Método ejecutado automáticamente antes de actualizar el atributo.
     * Actualiza la fecha de modificación.
     */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Método ejecutado automáticamente antes de persistir el atributo.
     * Inicializa fechas y normaliza code y attributeType a UPPERCASE.
     */
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.code != null) {
            this.code = this.code.toUpperCase();
        }
        if (this.attributeType != null) {
            this.attributeType = this.attributeType.toUpperCase();
        }
    }

    // ========================================
    // MÉTODOS DE COMPARACIÓN Y PRESENTACIÓN
    // ========================================

    /**
     * Compara dos atributos basándose en su código y tipo.
     * Dos atributos son iguales si tienen el mismo code y attributeType.
     *
     * @param obj Objeto a comparar
     * @return true si los atributos son equivalentes
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        UserAttribute that = (UserAttribute) obj;
        return code != null && code.equals(that.code) &&
                attributeType != null && attributeType.equals(that.attributeType);
    }

    /**
     * Genera un hash code basado en code y attributeType.
     * Mantiene consistencia con el método equals().
     *
     * @return Hash code del atributo
     */
    @Override
    public int hashCode() {
        return java.util.Objects.hash(code, attributeType);
    }

    /**
     * Representación en string del atributo para debugging y logging.
     * Incluye los campos más relevantes para identificación.
     *
     * @return Representación legible del atributo
     */
    @Override
    public String toString() {
        return "UserAttribute{id=" + id + ", code='" + code + "', name='" + name +
               "', attributeType='" + attributeType + "', active=" + active +
               ", displayOrder=" + displayOrder + "}";
    }

    // ========================================
    // MÉTODOS DE UTILIDAD PARA NEGOCIO
    // ========================================

    /**
     * Verifica si este atributo pertenece a un tipo específico.
     *
     * @param type Tipo de atributo a verificar (será convertido a UPPERCASE)
     * @return true si el atributo es del tipo especificado
     */
    public boolean isOfType(String type) {
        return this.attributeType != null && this.attributeType.equals(type.toUpperCase());
    }

    /**
     * Verifica si este atributo tiene un código específico.
     *
     * @param codeToCheck Código a verificar (será convertido a UPPERCASE)
     * @return true si el atributo tiene el código especificado
     */
    public boolean hasCode(String codeToCheck) {
        return this.code != null && this.code.equals(codeToCheck.toUpperCase());
    }

    /**
     * Obtiene una representación completa del atributo incluyendo tipo.
     * Útil para mostrar información contextual en la interfaz.
     *
     * @return String en formato "Tipo: Nombre (Código)"
     */
    public String getFullDisplayName() {
        return String.format("%s: %s (%s)",
                this.attributeType != null ? this.attributeType.toLowerCase() : "unknown",
                this.name != null ? this.name : "sin nombre",
                this.code != null ? this.code : "sin código");
    }

    /**
     * Verifica si el atributo está disponible para uso por usuarios.
     * Un atributo está disponible si está marcado como activo.
     *
     * @return true si el atributo puede ser seleccionado por usuarios
     */
    public boolean isAvailable() {
        return this.active;
    }

    /**
     * Activa el atributo para selección por usuarios.
     */
    public void activate() {
        this.active = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Desactiva el atributo (no estará disponible para selección).
     * Los usuarios que ya tengan este atributo lo conservarán.
     */
    public void deactivate() {
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }
}
