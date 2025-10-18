package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.response.UserEssentialDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserCategoryInterest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for the essential user response projection.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserEssentialMapper {

    @Mapping(target = "role", source = "userRole.userRoleList")
    @Mapping(target = "approvalStatus", source = "userApprovalStatus")
    @Mapping(target = "categoryInterest", source = "categoryInterest", qualifiedByName = "categoryInterestToString")
    UserEssentialDTO toEssential(User user);

    @Named("categoryInterestToString")
    default String mapCategoryInterestToString(UserCategoryInterest categoryInterest) {
        return categoryInterest != null && categoryInterest.getCategoryInterestEnum() != null
            ? categoryInterest.getCategoryInterestEnum().name()
            : null;
    }
}
