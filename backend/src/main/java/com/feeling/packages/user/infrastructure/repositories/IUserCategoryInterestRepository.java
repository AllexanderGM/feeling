package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.UserCategoryInterest;
import com.feeling.packages.user.infrastructure.entities.UserCategoryInterestList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserCategoryInterestRepository extends JpaRepository<UserCategoryInterest, Long> {

    // CORREGIDO: Usar categoryInterestEnum en lugar de categoryInterest
    @Query("SELECT uci FROM UserCategoryInterest uci WHERE uci.categoryInterestEnum = :category")
    Optional<UserCategoryInterest> findByCategoryInterestEnum(@Param("category") UserCategoryInterestList category);

    // Métodos nuevos para la estructura expandida
    List<UserCategoryInterest> findByIsActiveTrueOrderByDisplayOrder();

    List<UserCategoryInterest> findAllByOrderByDisplayOrder();

    // Método de compatibilidad - DEPRECATED pero mantenido para no romper código existente
    @Deprecated
    @Query("SELECT uci FROM UserCategoryInterest uci WHERE uci.categoryInterestEnum = :category")
    Optional<UserCategoryInterest> findByCategoryInterest(@Param("category") UserCategoryInterestList category);
}
