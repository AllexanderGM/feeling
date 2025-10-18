package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class UserAccountStatusMapperImpl implements UserAccountStatusMapper {

    @Override
    public UserAccountStatusDTO toAccountStatus(User user) {
        if ( user == null ) {
            return null;
        }

        Boolean accountDeactivated = null;
        LocalDateTime deactivationDate = null;
        String deactivationReason = null;

        accountDeactivated = user.isAccountDeactivated();
        deactivationDate = user.getDeactivationDate();
        deactivationReason = user.getDeactivationReason();

        UserAccountStatusDTO userAccountStatusDTO = new UserAccountStatusDTO( accountDeactivated, deactivationDate, deactivationReason );

        return userAccountStatusDTO;
    }
}
