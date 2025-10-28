package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.match.domain.services.MatchPlanService;
import com.feeling.packages.match.infrastructure.repositories.IMatchRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserFavoriteRepository;
import com.feeling.packages.user.domain.dto.user.UserMatchesDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Decorator for {@link IUserMatchesMapper} that enriches the match statistics with
 * dynamic counts obtained from match and favorite repositories.
 */
@Component
public abstract class UserMatchesMapperDecorator implements IUserMatchesMapper {

    @Autowired
    private IMatchRepository matchRepository;

    @Autowired
    private IUserFavoriteRepository favoriteRepository;

    @Autowired
    private MatchPlanService matchPlanService;

    @Override
    public UserMatchesDTO toMatches(User user) {
        if (user == null) {
            return null;
        }

        int totalRemaining = matchPlanService.getTotalRemainingAttempts(user);
        int reservedAttempts = matchPlanService.getTotalReservedAttempts(user);
        int availableAttempts = Math.max(totalRemaining - reservedAttempts, 0);

        long pendingSent = safeLong(matchRepository.countPendingSentMatches(user));
        long pendingReceived = safeLong(matchRepository.countPendingReceivedMatches(user));
        long accepted = safeLong(matchRepository.countAcceptedMatches(user));
        long favorites = safeLong(favoriteRepository.countUserFavorites(user));

        long receivedTotal = safeLong(matchRepository.countReceivedMatches(user, null, null));
        long sentTotal = safeLong(matchRepository.countSentMatches(user, null, null));

        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        long todayAccepted = safeLong(matchRepository.countAcceptedMatches(user, startOfDay, endOfDay));
        int todayMatches = safeLongToInt(todayAccepted);

        return new UserMatchesDTO(
            availableAttempts,
            reservedAttempts,
            totalRemaining,
            todayMatches,
            sentTotal,
            receivedTotal,
            pendingSent,
            pendingReceived,
            accepted,
            favorites
        );
    }

    private long safeLong(Long value) {
        return value != null ? value : 0L;
    }

    private int safeLongToInt(long value) {
        if (value > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }
        if (value < Integer.MIN_VALUE) {
            return Integer.MIN_VALUE;
        }
        return (int) value;
    }
}
