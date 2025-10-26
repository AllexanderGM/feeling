package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.mapper.IUserAuthMapper;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper that builds {@link UserResponseDTO} views from {@link User} entities.
 * <p>
 * Each mapping represents one of the response levels consumed by the API layer.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    uses = {
        IUserStatusMapper.class,
        IUserPrivacyMapper.class,
        IUserNotificationMapper.class,
        IUserMatchesMapper.class,
        IUserMetricsMapper.class,
        IUserAuthMapper.class,
        IUserDataMapper.class
    }
)
public interface IUserResponseMapper {

    @Mapping(target = "status", source = "user", qualifiedByName = "publicStatus")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "privacy", ignore = true)
    @Mapping(target = "metrics", ignore = true)
    @Mapping(target = "matches", ignore = true)
    @Mapping(target = "auth", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    UserResponseDTO toPublicResponse(User user);

    @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "privacy", ignore = true)
    @Mapping(target = "metrics", source = "user")
    @Mapping(target = "matches", ignore = true)
    @Mapping(target = "auth", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    UserResponseDTO toStandardResponse(User user);

    @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "privacy", source = "user")
    @Mapping(target = "metrics", source = "user")
    @Mapping(target = "matches", ignore = true)
    @Mapping(target = "auth", ignore = true)
    @Mapping(target = "notifications", source = "user")
    UserResponseDTO toExtendedResponse(User user);

    @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "privacy", source = "user")
    @Mapping(target = "metrics", source = "user")
    @Mapping(target = "matches", source = "user")
    @Mapping(target = "auth", source = "user")
    @Mapping(target = "notifications", source = "user")
    UserResponseDTO toFullResponse(User user);

    @Mapping(target = "status", source = "user", qualifiedByName = "publicStatus")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "privacy", ignore = true)
    @Mapping(target = "metrics", ignore = true)
    @Mapping(target = "matches", ignore = true)
    @Mapping(target = "auth", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    UserResponseDTO toSuggestionResponse(User user);
}
