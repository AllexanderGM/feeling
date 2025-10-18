package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.user.infrastructure.entities.User;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class UserAuthMapperImpl implements UserAuthMapper {

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
