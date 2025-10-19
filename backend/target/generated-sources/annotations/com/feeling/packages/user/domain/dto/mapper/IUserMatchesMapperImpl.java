package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserMatchesDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-19T14:43:05-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
@Component
public class IUserMatchesMapperImpl implements IUserMatchesMapper {

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
