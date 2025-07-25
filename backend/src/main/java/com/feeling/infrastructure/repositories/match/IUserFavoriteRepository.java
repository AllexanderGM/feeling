package com.feeling.infrastructure.repositories.match;

import com.feeling.infrastructure.entities.match.UserFavorite;
import com.feeling.infrastructure.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUserFavoriteRepository extends JpaRepository<UserFavorite, Long> {

    @Query("SELECT uf FROM UserFavorite uf " +
           "WHERE uf.user = :user " +
           "ORDER BY uf.createdAt DESC")
    Page<UserFavorite> findUserFavorites(@Param("user") User user, Pageable pageable);

    @Query("SELECT uf FROM UserFavorite uf " +
           "WHERE uf.user = :user AND uf.favoriteUser = :favoriteUser")
    Optional<UserFavorite> findByUserAndFavoriteUser(@Param("user") User user, @Param("favoriteUser") User favoriteUser);

    @Query("SELECT CASE WHEN COUNT(uf) > 0 THEN true ELSE false END FROM UserFavorite uf " +
           "WHERE uf.user = :user AND uf.favoriteUser = :favoriteUser")
    boolean existsByUserAndFavoriteUser(@Param("user") User user, @Param("favoriteUser") User favoriteUser);

    @Query("SELECT COUNT(uf) FROM UserFavorite uf WHERE uf.user = :user")
    Long countUserFavorites(@Param("user") User user);

    void deleteByUserAndFavoriteUser(User user, User favoriteUser);
}