package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserDataDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserAttribute;
import com.feeling.packages.user.infrastructure.entities.UserCategoryInterest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper that converts {@link User} entities into {@link UserDataDTO} records.
 * Centralises attribute-to-string conversions and null handling without manual constructors.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface IUserDataMapper {

    @Mapping(target = "categoryInterest", source = "categoryInterest", qualifiedByName = "categoryInterestToString")
    @Mapping(target = "gender", source = "gender", qualifiedByName = "attributeToName")
    @Mapping(target = "tags", expression = "java(user.getTagNames())")
    @Mapping(target = "maritalStatus", source = "maritalStatus", qualifiedByName = "attributeToName")
    @Mapping(target = "eyeColor", source = "eyeColor", qualifiedByName = "attributeToName")
    @Mapping(target = "hairColor", source = "hairColor", qualifiedByName = "attributeToName")
    @Mapping(target = "bodyType", source = "bodyType", qualifiedByName = "attributeToName")
    @Mapping(target = "education", source = "education", qualifiedByName = "attributeToName")
    @Mapping(target = "church", source = "church", qualifiedByName = "attributeToName")
    @Mapping(target = "religion", source = "religion", qualifiedByName = "attributeToName")
    @Mapping(target = "sexualRole", source = "sexualRole", qualifiedByName = "attributeToName")
    @Mapping(target = "relationshipType", source = "relationshipType", qualifiedByName = "attributeToName")
    UserDataDTO toUserDataDTO(User user);

    @Named("attributeToName")
    default String mapAttributeToName(UserAttribute attribute) {
        return attribute != null ? attribute.getName() : null;
    }

    @Named("categoryInterestToString")
    default String mapCategoryInterestToString(UserCategoryInterest categoryInterest) {
        return categoryInterest != null && categoryInterest.getCategoryInterestEnum() != null
            ? categoryInterest.getCategoryInterestEnum().name()
            : null;
    }
}
