package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
import com.feeling.packages.user.infrastructure.entities.UserCategoryInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestión de categorías de interés de usuarios.
 * Maneja las categorías principales del sistema (ESSENCE, SPIRIT, ADVENTURE, etc.).
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Repository
public interface IUserCategoryInterestRepository extends JpaRepository<UserCategoryInterest, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca una categoría de interés por su enum.
     * Método derivado de Spring Data JPA (no requiere @Query explícita).
     *
     * @param categoryInterestEnum Enum de categoría de interés
     * @return Optional con la categoría si existe
     */
    Optional<UserCategoryInterest> findByCategoryInterestEnum(UserCategoryInterestList categoryInterestEnum);

    /**
     * Busca todas las categorías activas ordenadas por displayOrder.
     *
     * @return Lista de categorías activas ordenadas
     */
    List<UserCategoryInterest> findByActiveTrueOrderByDisplayOrder();

    /**
     * Busca todas las categorías ordenadas por displayOrder.
     *
     * @return Lista de todas las categorías ordenadas
     */
    List<UserCategoryInterest> findAllByOrderByDisplayOrder();
}
