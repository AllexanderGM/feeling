package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.auth.AuthProviderInfoDTO;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.user.infrastructure.entities.User;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-19T14:43:05-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
@Component
public class IUserAuthMapperImpl implements IUserAuthMapper {

    @Override
    public AuthProviderInfoDTO toAuthProviderInfo(User user) {
        if ( user == null ) {
            return null;
        }

        AuthProvider userAuthProvider = null;
        String externalId = null;
        String externalAvatarUrl = null;
        LocalDateTime lastExternalSync = null;

        userAuthProvider = user.getUserAuthProvider();
        externalId = user.getExternalId();
        externalAvatarUrl = user.getExternalAvatarUrl();
        lastExternalSync = user.getLastExternalSync();

        AuthProviderInfoDTO authProviderInfoDTO = new AuthProviderInfoDTO( userAuthProvider, externalId, externalAvatarUrl, lastExternalSync );

        return authProviderInfoDTO;
    }
}
