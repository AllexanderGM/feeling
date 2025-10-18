package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for account status projection.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserAccountStatusMapper {

    UserAccountStatusDTO toAccountStatus(User user);
}
