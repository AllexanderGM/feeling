package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserDataDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-19T14:43:05-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
@Component
public class IUserDataMapperImpl implements IUserDataMapper {

    @Override
    public UserDataDTO toUserDataDTO(User user) {
        if ( user == null ) {
            return null;
        }

        String categoryInterest = null;
        String gender = null;
        String maritalStatus = null;
        String eyeColor = null;
        String hairColor = null;
        String bodyType = null;
        String education = null;
        String church = null;
        String religion = null;
        String sexualRole = null;
        String relationshipType = null;
        Long id = null;
        String name = null;
        String lastName = null;
        String email = null;
        LocalDate dateOfBirth = null;
        Integer age = null;
        String profession = null;
        String document = null;
        String phone = null;
        String phoneCode = null;
        String country = null;
        String city = null;
        String department = null;
        String locality = null;
        String description = null;
        List<String> images = null;
        String mainImage = null;
        Integer agePreferenceMin = null;
        Integer agePreferenceMax = null;
        Integer locationPreferenceRadius = null;
        Integer height = null;
        String spiritualMoments = null;
        String spiritualPractices = null;

        categoryInterest = mapCategoryInterestToString( user.getCategoryInterest() );
        gender = mapAttributeToName( user.getGender() );
        maritalStatus = mapAttributeToName( user.getMaritalStatus() );
        eyeColor = mapAttributeToName( user.getEyeColor() );
        hairColor = mapAttributeToName( user.getHairColor() );
        bodyType = mapAttributeToName( user.getBodyType() );
        education = mapAttributeToName( user.getEducation() );
        church = mapAttributeToName( user.getChurch() );
        religion = mapAttributeToName( user.getReligion() );
        sexualRole = mapAttributeToName( user.getSexualRole() );
        relationshipType = mapAttributeToName( user.getRelationshipType() );
        id = user.getId();
        name = user.getName();
        lastName = user.getLastName();
        email = user.getEmail();
        dateOfBirth = user.getDateOfBirth();
        age = user.getAge();
        profession = user.getProfession();
        document = user.getDocument();
        phone = user.getPhone();
        phoneCode = user.getPhoneCode();
        country = user.getCountry();
        city = user.getCity();
        department = user.getDepartment();
        locality = user.getLocality();
        description = user.getDescription();
        List<String> list = user.getImages();
        if ( list != null ) {
            images = new ArrayList<String>( list );
        }
        mainImage = user.getMainImage();
        agePreferenceMin = user.getAgePreferenceMin();
        agePreferenceMax = user.getAgePreferenceMax();
        locationPreferenceRadius = user.getLocationPreferenceRadius();
        height = user.getHeight();
        spiritualMoments = user.getSpiritualMoments();
        spiritualPractices = user.getSpiritualPractices();

        List<String> tags = user.getTagNames();

        UserDataDTO userDataDTO = new UserDataDTO( id, name, lastName, email, dateOfBirth, age, profession, document, phone, phoneCode, country, city, department, locality, description, images, mainImage, categoryInterest, gender, tags, agePreferenceMin, agePreferenceMax, locationPreferenceRadius, maritalStatus, height, eyeColor, hairColor, bodyType, education, church, religion, spiritualMoments, spiritualPractices, sexualRole, relationshipType );

        return userDataDTO;
    }
}
