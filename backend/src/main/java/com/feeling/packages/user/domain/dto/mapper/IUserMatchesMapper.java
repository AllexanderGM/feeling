package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserMatchesDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for match-related counters.
 * Decorated with UserMatchesMapperDecorator to calculate statistics dynamically.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
@DecoratedWith(UserMatchesMapperDecorator.class)
public interface IUserMatchesMapper {

    @Mapping(target = "availableAttempts", expression = "java(0)")
    @Mapping(target = "reservedAttempts", expression = "java(0)")
    @Mapping(target = "totalRemainingAttempts", expression = "java(0)")
    @Mapping(target = "todayMatches", expression = "java(0)")
    @Mapping(target = "sentMatches", expression = "java(0L)")
    @Mapping(target = "receivedMatches", expression = "java(0L)")
    @Mapping(target = "pendingSent", expression = "java(0L)")
    @Mapping(target = "pendingReceived", expression = "java(0L)")
    @Mapping(target = "accepted", expression = "java(0L)")
    @Mapping(target = "favorites", expression = "java(0L)")
    UserMatchesDTO toMatches(User user);
}
