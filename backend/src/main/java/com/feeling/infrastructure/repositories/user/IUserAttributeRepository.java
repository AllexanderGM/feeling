package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.UserAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserAttributeRepository extends JpaRepository<UserAttribute, Long> {

    // Buscar por código y tipo
    Optional<UserAttribute> findByCodeAndAttributeType(String code, String attributeType);

    // Buscar todos los atributos de un tipo específico
    List<UserAttribute> findByAttributeTypeAndActiveTrue(String attributeType);

    // Buscar todos los atributos de un tipo ordenados por displayOrder
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :attributeType AND ua.active = true ORDER BY ua.displayOrder ASC")
    List<UserAttribute> findByAttributeTypeOrderedByDisplay(@Param("attributeType") String attributeType);

    // Buscar atributos activos
    List<UserAttribute> findByActiveTrue();

    // Contar atributos por tipo
    long countByAttributeType(String attributeType);
}
