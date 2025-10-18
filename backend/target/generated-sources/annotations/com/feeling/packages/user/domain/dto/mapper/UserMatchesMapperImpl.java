package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.core.UserMatchesDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class UserMatchesMapperImpl implements UserMatchesMapper {

    @Override
    public UserMatchesDTO toMatches(User user) {
        if ( user == null ) {
            return null;
        }

        Integer availableAttempts = null;

        availableAttempts = user.getAvailableAttempts();

        Integer todayMatches = 0;
        Integer totalMatches = user.getMatchesCount() != null ? user.getMatchesCount().intValue() : 0;
        Integer maxDailyAttempts = 10;
        Long pendingSent = 0L;
        Long pendingReceived = 0L;
        Long accepted = 0L;
        Long favorites = 0L;

        UserMatchesDTO userMatchesDTO = new UserMatchesDTO( availableAttempts, todayMatches, totalMatches, maxDailyAttempts, pendingSent, pendingReceived, accepted, favorites );

        return userMatchesDTO;
    }
}
