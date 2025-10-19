package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-19T14:43:05-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
@Component
public class IUserMetricsMapperImpl implements IUserMetricsMapper {

    @Override
    public UserPerformanceMetricsDTO toMetrics(User user) {
        if ( user == null ) {
            return null;
        }

        Long profileViews = null;
        Long likesReceived = null;
        Long matchesCount = null;
        Double popularityScore = null;

        profileViews = user.getProfileViews();
        likesReceived = user.getLikesReceived();
        matchesCount = user.getMatchesCount();
        popularityScore = user.getPopularityScore();

        Double profileCompleteness = user.getProfileCompletenessPercentage();

        UserPerformanceMetricsDTO userPerformanceMetricsDTO = new UserPerformanceMetricsDTO( profileViews, likesReceived, matchesCount, popularityScore, profileCompleteness );

        return userPerformanceMetricsDTO;
    }
}
