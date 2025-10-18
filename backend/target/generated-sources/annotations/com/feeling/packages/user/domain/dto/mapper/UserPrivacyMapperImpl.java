package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.preferences.UserPrivacyDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class UserPrivacyMapperImpl implements UserPrivacyMapper {

    @Override
    public UserPrivacyDTO toPrivacy(User user) {
        if ( user == null ) {
            return null;
        }

        Boolean publicAccount = null;
        Boolean searchVisibility = null;
        Boolean locationPublic = null;
        Boolean showAge = null;
        Boolean showLocation = null;
        Boolean showPhone = null;
        Boolean showMeInSearch = null;

        publicAccount = user.isPublicAccount();
        searchVisibility = user.isSearchVisibility();
        locationPublic = user.isLocationPublic();
        showAge = user.isShowAge();
        showLocation = user.isShowLocation();
        showPhone = user.isShowPhone();
        showMeInSearch = user.isShowMeInSearch();

        UserPrivacyDTO userPrivacyDTO = new UserPrivacyDTO( publicAccount, searchVisibility, locationPublic, showAge, showLocation, showPhone, showMeInSearch );

        return userPrivacyDTO;
    }
}
