package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserPrivacyDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for the privacy settings projection.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface IUserPrivacyMapper {

    @Mapping(target = "publicAccount", source = "publicAccount")
    @Mapping(target = "searchVisibility", source = "searchVisibility")
    @Mapping(target = "locationPublic", source = "locationPublic")
    @Mapping(target = "showAge", source = "showAge")
    @Mapping(target = "showLocation", source = "showLocation")
    @Mapping(target = "showPhone", source = "showPhone")
    @Mapping(target = "showMeInSearch", source = "showMeInSearch")
    UserPrivacyDTO toPrivacy(User user);
}
