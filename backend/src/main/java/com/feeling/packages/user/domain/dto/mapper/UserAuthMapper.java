package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for authentication provider metadata.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserAuthMapper {

    AuthProviderInfoDTO toAuthProviderInfo(User user);
}
