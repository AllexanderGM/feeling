package com.feeling.packages.match.infrastructure.repositories;

import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.user.infrastructure.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
            "WHERE ((m.initiatorUser = :user1 AND m.targetUser = :user2) OR " +
            "(m.initiatorUser = :user2 AND m.targetUser = :user1)) AND m.status = 'REJECTED'")
    boolean existsRejectedMatchBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT CASE WHEN m.initiatorUser.id = :userId THEN m.targetUser.id ELSE m.initiatorUser.id END " +
            "FROM Match m " +
            "WHERE (m.initiatorUser.id = :userId OR m.targetUser.id = :userId) AND m.status = 'REJECTED'")
    List<Long> findRejectedUserIds(@Param("userId") Long userId);

    @Query("SELECT m.targetUser.id FROM Match m WHERE m.initiatorUser.id = :userId AND m.status = 'PENDING'")
    List<Long> findPendingInitiatedUserIds(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN m.initiatorUser.id = :userId THEN m.targetUser.id ELSE m.initiatorUser.id END " +
            "FROM Match m " +
            "WHERE (m.initiatorUser.id = :userId OR m.targetUser.id = :userId) AND m.status = 'ACCEPTED'")
    List<Long> findAcceptedUserIds(@Param("userId") Long userId);

    @Query("SELECT m FROM Match m " +
            "WHERE (m.initiatorUser = :user OR m.targetUser = :user) " +
            "AND (:status IS NULL OR m.status = :status) " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to) " +
            "ORDER BY m.createdAt DESC")
    Page<Match> findUserMatchHistory(@Param("user") User user,
                                     @Param("status") Match.MatchStatus status,
                                     @Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to,
                                     Pageable pageable);

    @Query("SELECT COUNT(m) FROM Match m " +
            "WHERE m.initiatorUser = :user AND m.status = 'PENDING' " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to)")
    Long countPendingSentMatches(@Param("user") User user,
                                 @Param("from") LocalDateTime from,
                                 @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(m) FROM Match m " +
            "WHERE m.targetUser = :user AND m.status = 'PENDING' " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to)")
    Long countPendingReceivedMatches(@Param("user") User user,
                                     @Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(m) FROM Match m " +
            "WHERE ((m.initiatorUser = :user OR m.targetUser = :user) AND m.status = 'ACCEPTED') " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to)")
    Long countAcceptedMatches(@Param("user") User user,
                              @Param("from") LocalDateTime from,
                              @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(m) FROM Match m " +
            "WHERE (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to)")
    Long countMatches(@Param("from") LocalDateTime from,
                      @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(m) FROM Match m " +
            "WHERE m.status = :status " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to)")
    Long countMatchesByStatus(@Param("status") Match.MatchStatus status,
                              @Param("from") LocalDateTime from,
                              @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(m) FROM Match m " +
            "WHERE m.initiatorUser = :user " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to)")
    Long countSentMatches(@Param("user") User user,
                          @Param("from") LocalDateTime from,
                          @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(m) FROM Match m " +
            "WHERE m.targetUser = :user " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to)")
    Long countReceivedMatches(@Param("user") User user,
                              @Param("from") LocalDateTime from,
                              @Param("to") LocalDateTime to);

    @Query("SELECT m FROM Match m " +
            "WHERE (:status IS NULL OR m.status = :status) " +
            "AND (:initiatorId IS NULL OR m.initiatorUser.id = :initiatorId) " +
            "AND (:targetId IS NULL OR m.targetUser.id = :targetId) " +
            "AND (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to) " +
            "ORDER BY m.createdAt DESC")
    Page<Match> findMatchesForAdmin(@Param("status") Match.MatchStatus status,
                                    @Param("initiatorId") Long initiatorId,
                                    @Param("targetId") Long targetId,
                                    @Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to,
                                    Pageable pageable);

    @Query("SELECT m.initiatorUser.id AS userId, COUNT(m) AS totalMatches, " +
            "SUM(CASE WHEN m.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS acceptedMatches " +
            "FROM Match m " +
            "WHERE (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to) " +
            "GROUP BY m.initiatorUser.id " +
            "ORDER BY totalMatches DESC")
    List<Object[]> findTopInitiators(@Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to,
                                     Pageable pageable);

    @Query("SELECT m.targetUser.id AS userId, COUNT(m) AS totalMatches, " +
            "SUM(CASE WHEN m.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS acceptedMatches " +
            "FROM Match m " +
            "WHERE (:from IS NULL OR m.createdAt >= :from) " +
            "AND (:to IS NULL OR m.createdAt <= :to) " +
            "GROUP BY m.targetUser.id " +
            "ORDER BY totalMatches DESC")
    List<Object[]> findTopReceivers(@Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to,
                                    Pageable pageable);
}
