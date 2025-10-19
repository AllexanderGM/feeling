package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.auth.AuthProviderInfoDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for authentication provider metadata.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface IUserAuthMapper {

    AuthProviderInfoDTO toAuthProviderInfo(User user);
}
