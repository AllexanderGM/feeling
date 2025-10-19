package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserStatusDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for projecting {@link User} status information.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface IUserStatusMapper {

    @Named("fullStatus")
    @Mapping(target = "approvalStatus", source = "userApprovalStatus")
    @Mapping(target = "role", source = "userRole.userRoleList")
    @Mapping(target = "dismissed", expression = "java(Boolean.FALSE)")
    @Mapping(target = "favorite", expression = "java(Boolean.FALSE)")
    @Mapping(target = "hasAcceptedMatch", expression = "java(Boolean.FALSE)")
    @Mapping(target = "hasPendingMatch", expression = "java(Boolean.FALSE)")
    UserStatusDTO toStatus(User user);

    @Named("publicStatus")
    @Mapping(target = "approvalStatus", source = "userApprovalStatus")
    @Mapping(target = "role", source = "userRole.userRoleList")
    @Mapping(target = "availableAttempts", expression = "java(null)")
    @Mapping(target = "dismissed", expression = "java(Boolean.FALSE)")
    @Mapping(target = "favorite", expression = "java(Boolean.FALSE)")
    @Mapping(target = "hasAcceptedMatch", expression = "java(Boolean.FALSE)")
    @Mapping(target = "hasPendingMatch", expression = "java(Boolean.FALSE)")
    UserStatusDTO toPublicStatus(User user);
}
