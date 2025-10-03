package com.feeling.packages.user.infrastructure.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;

/**
 * Entidad que representa un rol de usuario en la plataforma Feeling.
 * Implementa GrantedAuthority para integración con Spring Security.
 * <p>
 * Esta entidad gestiona los roles de autorización del sistema, que determinan
 * los permisos y privilegios de cada usuario dentro de la plataforma.
 * <p>
 * Los roles disponibles están definidos en el enum {@link UserRoleList} y
 * controlan el acceso a diferentes funcionalidades:
 * - ADMIN: Acceso completo a todas las funcionalidades administrativas
 * - USER: Usuario regular con permisos estándar
 * - MODERATOR: Permisos de moderación y gestión de contenido (futuro)
 * - etc.
 * <p>
 * Cada usuario ({@link User}) tiene asignado un rol a través de una relación
 * ManyToOne, lo que permite que múltiples usuarios compartan el mismo rol.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 * @see User
 * @see UserRoleList
 * @see GrantedAuthority
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_roles")
public class UserRole implements GrantedAuthority {
    /**
     * Identificador único del rol en la base de datos.
     * Generado automáticamente mediante estrategia de auto-incremento.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tipo de rol del usuario definido mediante enum.
     * Este campo determina los permisos y privilegios del usuario en el sistema.
     * <p>
     * Se almacena como STRING en la base de datos para facilitar lectura y
     * mantener compatibilidad con cambios futuros en el enum.
     * <p>
     * Ejemplos de roles:
     * - ADMIN: Administrador con acceso completo al sistema
     * - USER: Usuario estándar con permisos básicos
     * - MODERATOR: Moderador con permisos de gestión de contenido
     *
     * @see UserRoleList
     */
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private UserRoleList userRoleList;

    /**
     * Constructor de conveniencia que permite crear un UserRole solo con el tipo de rol.
     * Útil para creación rápida de roles sin especificar el ID (que será autogenerado).
     *
     * @param userRoleList El tipo de rol a asignar
     */
    public UserRole(UserRoleList userRoleList) {
        this.userRoleList = userRoleList;
    }

    /**
     * Implementación del método getAuthority de GrantedAuthority.
     * Spring Security utiliza este método para obtener el nombre del rol
     * al evaluar permisos y restricciones de acceso.
     * <p>
     * El valor retornado se utiliza en anotaciones como:
     * - @PreAuthorize("hasAuthority('ADMIN')")
     * - @Secured("ADMIN")
     * - @RolesAllowed("ADMIN")
     *
     * @return El nombre del rol como String (ej: "ADMIN", "USER")
     */
    @Override
    public String getAuthority() {
        return userRoleList.name();
    }
}
