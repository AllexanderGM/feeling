package com.feeling.packages.user.domain.services;

import com.feeling.packages.user.domain.dto.profile.request.UserRequestDTO;
import com.feeling.packages.user.domain.enums.UserApprovalStatus;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Servicio para validaciones de negocio centralizadas relacionadas con usuarios.
 * <p>
 * Este servicio contiene toda la lógica de validación de reglas de negocio para usuarios,
 * proporcionando métodos reutilizables que otros servicios pueden consumir.
 * <p>
 * No tiene dependencias de repositorios, solo trabaja con entidades para mantener
 * la lógica de validación pura y fácil de testear.
 * <p>
 * Tipos de validaciones incluidas:
 * - Validaciones de aprobación de usuarios
 * - Validaciones de roles y permisos
 * - Validaciones de estado de cuenta (activación/desactivación)
 * - Validaciones de eliminación
 * - Validaciones de perfil
 * - Validaciones de matching
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserValidationService {

    /**
     * Email del administrador principal del sistema.
     * Este usuario tiene protecciones especiales y no puede ser eliminado ni modificado ciertos roles.
     */
    @Value("${app.admin.email}")
    private String adminEmail;

    // ========================================
    // VALIDACIONES DE APROBACIÓN
    // ========================================

    /**
     * Determina si un usuario puede ser aprobado.
     * <p>
     * Un usuario solo puede aprobarse si actualmente NO está en estado APPROVED.
     * Esto permite aprobar usuarios que estén en PENDING o REJECTED.
     *
     * @param user Usuario a validar
     * @return true si el usuario puede ser aprobado, false si ya está aprobado
     */
    public boolean canBeApproved(User user) {
        if (user == null) {
            return false;
        }
        return user.getUserApprovalStatus() != UserApprovalStatus.APPROVED;
    }

    /**
     * Determina si un usuario puede ser rechazado.
     * <p>
     * Un usuario solo puede rechazarse si actualmente NO está en estado REJECTED.
     * Esto permite rechazar usuarios que estén en PENDING o APPROVED.
     *
     * @param user Usuario a validar
     * @return true si el usuario puede ser rechazado, false si ya está rechazado
     */
    public boolean canBeRejected(User user) {
        if (user == null) {
            return false;
        }
        return user.getUserApprovalStatus() != UserApprovalStatus.REJECTED;
    }

    /**
     * Determina si el estado de aprobación de un usuario puede ser reseteado a PENDING.
     * <p>
     * Útil para dar segundas oportunidades a usuarios rechazados o revertir aprobaciones.
     *
     * @param user Usuario a validar
     * @return true si el estado puede cambiarse a PENDING
     */
    public boolean canBeResetToPending(User user) {
        if (user == null) {
            return false;
        }
        return user.getUserApprovalStatus() != UserApprovalStatus.PENDING;
    }

    // ========================================
    // VALIDACIONES DE ROLES
    // ========================================

    /**
     * Determina si a un usuario se le puede otorgar el rol de administrador.
     * <p>
     * Condiciones para otorgar rol de admin:
     * - El usuario NO debe tener actualmente el rol ADMIN
     *
     * @param user Usuario a validar
     * @return true si se le puede otorgar el rol de admin
     */
    public boolean canGrantAdminRole(User user) {
        if (user == null || user.getUserRole() == null) {
            return false;
        }
        return user.getUserRole().getUserRoleList() != UserRoleList.ADMIN;
    }

    /**
     * Determina si a un usuario se le puede revocar el rol de administrador.
     * <p>
     * Condiciones para revocar rol de admin:
     * 1. El usuario DEBE tener actualmente el rol ADMIN
     * 2. El usuario NO debe ser el administrador principal del sistema
     * (protección para evitar quedarse sin acceso administrativo)
     *
     * @param user Usuario a validar
     * @return true si se le puede revocar el rol de admin
     */
    public boolean canRevokeAdminRole(User user) {
        if (user == null || user.getUserRole() == null) {
            return false;
        }

        // Protección: El admin principal nunca puede perder su rol
        if (isSystemAdmin(user)) {
            return false;
        }

        return user.getUserRole().getUserRoleList() == UserRoleList.ADMIN;
    }

    /**
     * Verifica si un usuario es el administrador principal del sistema.
     * <p>
     * El administrador principal tiene protecciones especiales y no puede:
     * - Ser eliminado
     * - Que se le revoque el rol de admin
     * - Ser desactivado permanentemente
     *
     * @param user Usuario a verificar
     * @return true si es el administrador principal del sistema
     */
    public boolean isSystemAdmin(User user) {
        if (user == null || user.getEmail() == null) {
            return false;
        }
        return user.getEmail().equals(adminEmail);
    }

    /**
     * Verifica si un usuario tiene un rol específico.
     *
     * @param user Usuario a verificar
     * @param role Rol a verificar
     * @return true si el usuario tiene el rol especificado
     */
    public boolean hasRole(User user, UserRoleList role) {
        if (user == null || user.getUserRole() == null || role == null) {
            return false;
        }
        return user.getUserRole().getUserRoleList() == role;
    }

    // ========================================
    // VALIDACIONES DE ESTADO DE CUENTA
    // ========================================

    /**
     * Determina si una cuenta de usuario puede ser desactivada.
     * <p>
     * Condiciones:
     * - La cuenta NO debe estar ya desactivada
     * - El usuario NO debe ser el administrador principal (protección)
     *
     * @param user Usuario a validar
     * @return true si la cuenta puede ser desactivada
     */
    public boolean canBeDeactivated(User user) {
        if (user == null) {
            return false;
        }

        // Protección: El admin principal no puede ser desactivado
        if (isSystemAdmin(user)) {
            return false;
        }

        return !user.isAccountDeactivated();
    }

    /**
     * Determina si una cuenta de usuario puede ser reactivada.
     * <p>
     * Solo cuentas actualmente desactivadas pueden ser reactivadas.
     *
     * @param user Usuario a validar
     * @return true si la cuenta puede ser reactivada
     */
    public boolean canBeReactivated(User user) {
        if (user == null) {
            return false;
        }
        return user.isAccountDeactivated();
    }

    // ========================================
    // VALIDACIONES DE ELIMINACIÓN
    // ========================================

    /**
     * Determina si un usuario puede ser eliminado permanentemente del sistema.
     * <p>
     * Protección crítica: El administrador principal NUNCA puede ser eliminado
     * para prevenir pérdida total de acceso administrativo al sistema.
     *
     * @param user Usuario a validar
     * @return true si el usuario puede ser eliminado
     */
    public boolean canBeDeleted(User user) {
        if (user == null) {
            return false;
        }

        // Protección crítica: El admin principal nunca puede ser eliminado
        return !isSystemAdmin(user);
    }

    // ========================================
    // VALIDACIONES DE PERFIL
    // ========================================

    /**
     * Verifica si el perfil de un usuario está completo.
     * <p>
     * Un perfil completo debe tener:
     * - Nombre y apellido
     * - Email verificado
     * - Categoría de interés seleccionada
     * - Fecha de nacimiento
     * - Ubicación básica (país, ciudad)
     *
     * @param user Usuario a validar
     * @return true si el perfil está completo según las reglas de negocio
     */
    public boolean isProfileComplete(User user) {
        if (user == null) {
            return false;
        }

        return user.isProfileComplete();
    }

    /**
     * Valida si un usuario puede actualizar su perfil con los datos proporcionados.
     * <p>
     * Validaciones incluidas:
     * - El usuario debe existir
     * - El usuario debe estar verificado para ciertos campos
     * - El usuario no debe estar desactivado
     *
     * @param user      Usuario que intenta actualizar
     * @param updateDTO Datos de actualización
     * @return true si puede realizar la actualización
     */
    public boolean canUpdateProfile(User user, UserRequestDTO updateDTO) {
        if (user == null || updateDTO == null) {
            return false;
        }

        // Usuario desactivado no puede actualizar perfil
        if (user.isAccountDeactivated()) {
            return false;
        }

        // Para actualizar ciertos campos sensibles, debe estar verificado
        return updateDTO.categoryInterest().isEmpty() || user.isVerified();
    }

    /**
     * Verifica si un usuario puede acceder al perfil de otro usuario.
     * <p>
     * Reglas de acceso:
     * - Un usuario siempre puede ver su propio perfil
     * - Solo usuarios activos y aprobados pueden ver otros perfiles
     * - Perfiles desactivados solo son visibles para admins
     *
     * @param viewer Usuario que intenta ver el perfil
     * @param target Usuario cuyo perfil se intenta ver
     * @return true si el viewer puede acceder al perfil del target
     */
    public boolean canAccessProfile(User viewer, User target) {
        if (viewer == null || target == null) {
            return false;
        }

        // Un usuario siempre puede ver su propio perfil
        if (viewer.getId().equals(target.getId())) {
            return true;
        }

        // Los admins pueden ver cualquier perfil
        if (hasRole(viewer, UserRoleList.ADMIN)) {
            return true;
        }

        // El viewer debe estar activo y aprobado
        if (viewer.isAccountDeactivated() || !viewer.isApproved()) {
            return false;
        }

        // El target debe estar activo para ser visible
        return !target.isAccountDeactivated();
    }

    // ========================================
    // VALIDACIONES DE MATCHING
    // ========================================

    /**
     * Verifica si un usuario es elegible para participar en el sistema de matching.
     * <p>
     * Requisitos para matching:
     * - Cuenta verificada
     * - Perfil completo
     * - Estado de aprobación: APPROVED
     * - Cuenta activa (no desactivada)
     *
     * @param user Usuario a validar
     * @return true si el usuario puede participar en matching
     */
    public boolean isEligibleForMatching(User user) {
        if (user == null) {
            return false;
        }

        return user.isVerified()
            && user.isProfileComplete()
            && user.isApproved()
            && !user.isAccountDeactivated();
    }

    /**
     * Verifica si un usuario NO es elegible para matching.
     * Método helper para validaciones negativas.
     *
     * @param user Usuario a validar
     * @return true si el usuario NO es elegible para matching
     */
    public boolean isNotEligibleForMatching(User user) {
        return !isEligibleForMatching(user);
    }

    /**
     * Verifica si dos usuarios pueden hacer match entre sí.
     * <p>
     * Ambos usuarios deben:
     * - Ser elegibles para matching
     * - No ser la misma persona
     * - Pertenecer a categorías de interés compatibles (según lógica de negocio)
     *
     * @param user1 Primer usuario
     * @param user2 Segundo usuario
     * @return true si los usuarios pueden hacer match
     */
    public boolean canMatch(User user1, User user2) {
        if (user1 == null || user2 == null) {
            return false;
        }

        // No se puede hacer match consigo mismo
        if (user1.getId().equals(user2.getId())) {
            return false;
        }

        // Ambos deben ser elegibles
        return isEligibleForMatching(user1) && isEligibleForMatching(user2);
    }

    // ========================================
    // VALIDACIONES DE VERIFICACIÓN
    // ========================================

    /**
     * Verifica si un usuario necesita completar la verificación de email.
     *
     * @param user Usuario a verificar
     * @return true si el usuario necesita verificar su email
     */
    public boolean needsEmailVerification(User user) {
        if (user == null) {
            return false;
        }
        return !user.isVerified();
    }

    /**
     * Verifica si un usuario necesita completar su perfil.
     *
     * @param user Usuario a verificar
     * @return true si el usuario necesita completar su perfil
     */
    public boolean needsProfileCompletion(User user) {
        if (user == null) {
            return false;
        }
        return user.isVerified() && !user.isProfileComplete();
    }

    /**
     * Verifica si un usuario está pendiente de aprobación administrativa.
     *
     * @param user Usuario a verificar
     * @return true si el usuario está pendiente de aprobación
     */
    public boolean isPendingApproval(User user) {
        if (user == null) {
            return false;
        }
        return user.isVerified()
            && user.isProfileComplete()
            && user.getUserApprovalStatus() == UserApprovalStatus.PENDING;
    }
}
