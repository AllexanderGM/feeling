package com.feeling.packages.user.infrastructure.entities;

import java.util.Arrays;

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
 * @since 1.0
 * @see UserRole
 * @see User
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
    CLIENT;

    /**
     * Busca un rol por su nombre de forma case-insensitive.
     * <p>
     * Este método permite buscar roles de manera flexible, ignorando mayúsculas
     * y minúsculas. Si no se encuentra el rol especificado, retorna CLIENT
     * como valor por defecto seguro.
     * <p>
     * Ejemplos de uso:
     * <pre>
     * UserRoleList.lookup("admin")   -> ADMIN
     * UserRoleList.lookup("ADMIN")   -> ADMIN
     * UserRoleList.lookup("client")  -> CLIENT
     * UserRoleList.lookup("invalid") -> CLIENT (default)
     * UserRoleList.lookup(null)      -> CLIENT (default)
     * </pre>
     *
     * @param rol Nombre del rol a buscar (puede ser null o en cualquier formato de capitalización)
     * @return El rol encontrado, o CLIENT si no existe o es null
     */
    public static UserRoleList lookup(String rol) {
        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase(rol))
                .findFirst()
                .orElse(CLIENT);
    }
}
