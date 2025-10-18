package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.response.UserEssentialDTO;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class UserEssentialMapperImpl implements UserEssentialMapper {

    @Override
    public UserEssentialDTO toEssential(User user) {
        if ( user == null ) {
            return null;
        }

        String role = null;
        String approvalStatus = null;
        String categoryInterest = null;
        Long id = null;
        String name = null;
        String lastName = null;
        String email = null;
        Boolean approved = null;
        Boolean profileComplete = null;

        UserRoleList userRoleList = userUserRoleUserRoleList( user );
        if ( userRoleList != null ) {
            role = userRoleList.name();
        }
        if ( user.getUserApprovalStatus() != null ) {
            approvalStatus = user.getUserApprovalStatus().name();
        }
        categoryInterest = mapCategoryInterestToString( user.getCategoryInterest() );
        id = user.getId();
        name = user.getName();
        lastName = user.getLastName();
        email = user.getEmail();
        approved = user.isApproved();
        profileComplete = user.getProfileComplete();

        UserEssentialDTO userEssentialDTO = new UserEssentialDTO( id, name, lastName, email, role, approved, approvalStatus, categoryInterest, profileComplete );

        return userEssentialDTO;
    }

    private UserRoleList userUserRoleUserRoleList(User user) {
        if ( user == null ) {
            return null;
        }
        UserRole userRole = user.getUserRole();
        if ( userRole == null ) {
            return null;
        }
        UserRoleList userRoleList = userRole.getUserRoleList();
        if ( userRoleList == null ) {
            return null;
        }
        return userRoleList;
    }
}
