package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para gestión de roles de usuario.
 * Proporciona métodos para búsqueda y asignación de roles en el sistema.
 * <p>
 * Los roles disponibles en el sistema están definidos en {@link UserRoleList}:
 * - USER: Usuario regular de la plataforma
 * - MODERATOR: Moderador con permisos de revisión de contenido
 * - ADMIN: Administrador con permisos completos
 * - SUPER_ADMIN: Super administrador con acceso total al sistema
 * <p>
 * Este repositorio es utilizado principalmente en:
 * - Registro de usuarios (asignación de rol USER por defecto)
 * - Actualización de roles por administradores
 * - Inicialización de datos del sistema
 *
 * @author J. Alexander Gavilán M.
 * @see UserRole
 * @see UserRoleList
 */
@Repository
public interface IUserRoleRepository extends JpaRepository<UserRole, Long> {

    /**
     * Busca un rol por su tipo de rol.
     * Usado para asignar roles a usuarios durante registro o actualización de permisos.
     *
     * @param userRoleList Tipo de rol a buscar (USER, MODERATOR, ADMIN, SUPER_ADMIN)
     * @return Optional con el rol si existe, Optional.empty() si no
     */
    Optional<UserRole> findByUserRoleList(UserRoleList userRoleList);
}
