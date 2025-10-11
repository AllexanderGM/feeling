package com.feeling.packages.user.domain.enums;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;

/**
 * Enumeración que define los roles disponibles en la plataforma Feeling.
 * <p>
 * Estos roles determinan los permisos y privilegios que tiene cada usuario
 * en el sistema, controlando el acceso a diferentes funcionalidades y recursos.
 * <p>
 * Los roles son utilizados por Spring Security a través de la entidad {@link UserRole}
 * que implementa GrantedAuthority.
 * <p>
 * Roles disponibles:
 * - ADMIN: Administrador con acceso completo al sistema
 * - CLIENT: Usuario cliente con permisos estándar (rol por defecto)
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see UserRole
 * @see User
 * @since 1.0
 */
public enum UserRoleList {
    /**
     * Rol de administrador del sistema.
     * <p>
     * Permisos incluidos:
     * - Gestión completa de usuarios (crear, modificar, eliminar, aprobar)
     * - Acceso a métricas y estadísticas globales
     * - Gestión de eventos y tours
     * - Moderación de contenido (tags, quejas, reportes)
     * - Configuración del sistema
     * - Acceso a endpoints administrativos
     */
    ADMIN,

    /**
     * Rol de usuario cliente estándar (por defecto).
     * <p>
     * Permisos incluidos:
     * - Gestión de su propio perfil
     * - Búsqueda y matching con otros usuarios
     * - Envío y recepción de likes/matches
     * - Participación en eventos
     * - Gestión de favoritos
     * - Acceso a endpoints públicos y de usuario
     */
    CLIENT
}
