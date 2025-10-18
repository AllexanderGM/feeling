package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class UserStatusMapperImpl implements UserStatusMapper {

    @Override
    public UserStatusDTO toStatus(User user) {
        if ( user == null ) {
            return null;
        }

        String approvalStatus = null;
        String role = null;
        Boolean verified = null;
        Boolean profileComplete = null;
        LocalDateTime lastActive = null;
        Boolean approved = null;
        Integer availableAttempts = null;
        LocalDateTime createdAt = null;
        Boolean accountDeactivated = null;
        LocalDateTime deactivationDate = null;
        String deactivationReason = null;

        if ( user.getUserApprovalStatus() != null ) {
            approvalStatus = user.getUserApprovalStatus().name();
        }
        UserRoleList userRoleList = userUserRoleUserRoleList( user );
        if ( userRoleList != null ) {
            role = userRoleList.name();
        }
        verified = user.isVerified();
        profileComplete = user.getProfileComplete();
        lastActive = user.getLastActive();
        approved = user.isApproved();
        availableAttempts = user.getAvailableAttempts();
        createdAt = user.getCreatedAt();
        accountDeactivated = user.isAccountDeactivated();
        deactivationDate = user.getDeactivationDate();
        deactivationReason = user.getDeactivationReason();

        Boolean dismissed = Boolean.FALSE;
        Boolean favorite = Boolean.FALSE;
        Boolean hasAcceptedMatch = Boolean.FALSE;
        Boolean hasPendingMatch = Boolean.FALSE;

        UserStatusDTO userStatusDTO = new UserStatusDTO( verified, profileComplete, lastActive, approved, approvalStatus, role, availableAttempts, createdAt, accountDeactivated, deactivationDate, deactivationReason, dismissed, favorite, hasAcceptedMatch, hasPendingMatch );

        return userStatusDTO;
    }

    @Override
    public UserStatusDTO toPublicStatus(User user) {
        if ( user == null ) {
            return null;
        }

        String approvalStatus = null;
        String role = null;
        Boolean verified = null;
        Boolean profileComplete = null;
        LocalDateTime lastActive = null;
        Boolean approved = null;
        LocalDateTime createdAt = null;
        Boolean accountDeactivated = null;
        LocalDateTime deactivationDate = null;
        String deactivationReason = null;

        if ( user.getUserApprovalStatus() != null ) {
            approvalStatus = user.getUserApprovalStatus().name();
        }
        UserRoleList userRoleList = userUserRoleUserRoleList( user );
        if ( userRoleList != null ) {
            role = userRoleList.name();
        }
        verified = user.isVerified();
        profileComplete = user.getProfileComplete();
        lastActive = user.getLastActive();
        approved = user.isApproved();
        createdAt = user.getCreatedAt();
        accountDeactivated = user.isAccountDeactivated();
        deactivationDate = user.getDeactivationDate();
        deactivationReason = user.getDeactivationReason();

        Integer availableAttempts = null;
        Boolean dismissed = Boolean.FALSE;
        Boolean favorite = Boolean.FALSE;
        Boolean hasAcceptedMatch = Boolean.FALSE;
        Boolean hasPendingMatch = Boolean.FALSE;

        UserStatusDTO userStatusDTO = new UserStatusDTO( verified, profileComplete, lastActive, approved, approvalStatus, role, availableAttempts, createdAt, accountDeactivated, deactivationDate, deactivationReason, dismissed, favorite, hasAcceptedMatch, hasPendingMatch );

        return userStatusDTO;
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
