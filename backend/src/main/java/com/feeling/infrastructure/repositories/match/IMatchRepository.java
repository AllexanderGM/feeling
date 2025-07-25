package com.feeling.infrastructure.repositories.match;

import com.feeling.infrastructure.entities.match.Match;
import com.feeling.infrastructure.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IMatchRepository extends JpaRepository<Match, Long> {

    @Query("SELECT m FROM Match m " +
           "WHERE m.initiatorUser = :user " +
           "ORDER BY m.createdAt DESC")
    Page<Match> findSentMatches(@Param("user") User user, Pageable pageable);

    @Query("SELECT m FROM Match m " +
           "WHERE m.targetUser = :user " +
           "ORDER BY m.createdAt DESC")
    Page<Match> findReceivedMatches(@Param("user") User user, Pageable pageable);

    @Query("SELECT m FROM Match m " +
           "WHERE m.targetUser = :user AND m.status = 'PENDING' " +
           "ORDER BY m.createdAt DESC")
    Page<Match> findPendingReceivedMatches(@Param("user") User user, Pageable pageable);

    @Query("SELECT m FROM Match m " +
           "WHERE ((m.initiatorUser = :user OR m.targetUser = :user) AND m.status = 'ACCEPTED') " +
           "ORDER BY m.respondedAt DESC")
    Page<Match> findAcceptedMatches(@Param("user") User user, Pageable pageable);

    @Query("SELECT m FROM Match m " +
           "WHERE m.initiatorUser = :initiator AND m.targetUser = :target")
    Optional<Match> findMatchBetweenUsers(@Param("initiator") User initiator, @Param("target") User target);

    @Query("SELECT COUNT(m) FROM Match m " +
           "WHERE m.initiatorUser = :user AND m.status = 'PENDING'")
    Long countPendingSentMatches(@Param("user") User user);

    @Query("SELECT COUNT(m) FROM Match m " +
           "WHERE m.targetUser = :user AND m.status = 'PENDING'")
    Long countPendingReceivedMatches(@Param("user") User user);

    @Query("SELECT COUNT(m) FROM Match m " +
           "WHERE ((m.initiatorUser = :user OR m.targetUser = :user) AND m.status = 'ACCEPTED')")
    Long countAcceptedMatches(@Param("user") User user);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
           "WHERE ((m.initiatorUser = :user1 AND m.targetUser = :user2) OR " +
           "(m.initiatorUser = :user2 AND m.targetUser = :user1))")
    boolean existsMatchBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
}