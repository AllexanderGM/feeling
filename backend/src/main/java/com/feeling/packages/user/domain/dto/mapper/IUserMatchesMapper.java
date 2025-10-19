package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserMatchesDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for match-related counters.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface IUserMatchesMapper {

    @Mapping(target = "availableAttempts", source = "availableAttempts")
    @Mapping(target = "todayMatches", expression = "java(0)")
    @Mapping(target = "totalMatches", expression = "java(user.getMatchesCount() != null ? user.getMatchesCount().intValue() : 0)")
    @Mapping(target = "maxDailyAttempts", expression = "java(10)")
    @Mapping(target = "pendingSent", expression = "java(0L)")
    @Mapping(target = "pendingReceived", expression = "java(0L)")
    @Mapping(target = "accepted", expression = "java(0L)")
    @Mapping(target = "favorites", expression = "java(0L)")
    UserMatchesDTO toMatches(User user);
}
