package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for per-user performance metrics.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface IUserMetricsMapper {

    @Mapping(target = "profileCompleteness", expression = "java(user.getProfileCompletenessPercentage())")
    UserPerformanceMetricsDTO toMetrics(User user);
}
