package com.feeling.domain.dto.user;

import com.feeling.packages.auth.domain.dto.UserProfileDataDTO;
import com.feeling.packages.auth.domain.dto.UserStatusDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import com.feeling.packages.user.infrastructure.entities.UserRoleList;
import com.feeling.packages.user.domain.enums.ApprovalStatus;
import com.feeling.packages.user.domain.dto.UserDTOMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @deprecated This test uses deprecated mapper methods. Use UserResponseFactory instead
 */
@Deprecated(since = "1.8", forRemoval = true)
public class UserDTOMapperTest {

    private User testUser;

    @BeforeEach
    void setUp() {
        UserRole userRole = new UserRole();
        userRole.setUserRoleList(UserRoleList.CLIENT);

        testUser = User.builder()
                .id(1L)
                .name("Test")
                .lastName("User")
                .email("test@example.com")
                .verified(true)
                .profileComplete(false)
                .approvalStatus(ApprovalStatus.PENDING)
                .userRole(userRole)
                .availableAttempts(0)
                .createdAt(LocalDateTime.now())
                .lastActive(LocalDateTime.now())
                .build();
    }

    @Test
    void testToUserStatusDTO() {
        UserStatusDTO statusDTO = UserDTOMapper.toUserStatusDTO(testUser);

        assertNotNull(statusDTO);
        assertEquals(testUser.isVerified(), statusDTO.verified());
        assertEquals(testUser.getProfileComplete(), statusDTO.profileComplete());
        assertEquals(testUser.isApproved(), statusDTO.approved());
        assertEquals(testUser.getApprovalStatus().name(), statusDTO.approvalStatus());
        assertEquals("CLIENT", statusDTO.role());
        assertEquals(testUser.getAvailableAttempts(), statusDTO.availableAttempts());
        assertEquals(testUser.getCreatedAt(), statusDTO.createdAt());
        assertEquals(testUser.getLastActive(), statusDTO.lastActive());
    }

    @Test
    void testToUserProfileDataDTO() {
        UserProfileDataDTO profileDTO = UserDTOMapper.toUserProfileDataDTO(testUser);

        assertNotNull(profileDTO);
        assertEquals(testUser.getName(), profileDTO.name());
        assertEquals(testUser.getLastName(), profileDTO.lastName());
        assertEquals(testUser.getEmail(), profileDTO.email());
        assertEquals(testUser.getDateOfBirth(), profileDTO.dateOfBirth());
        assertEquals(testUser.getAge(), profileDTO.age());
        assertEquals(testUser.getDocument(), profileDTO.document());
        assertEquals(testUser.getPhone(), profileDTO.phone());
        assertEquals(testUser.getCity(), profileDTO.city());
        assertEquals(testUser.getDepartment(), profileDTO.department());
        assertEquals(testUser.getCountry(), profileDTO.country());
        assertEquals(testUser.getDescription(), profileDTO.description());
        assertEquals(testUser.getImages(), profileDTO.images());
        assertEquals(testUser.getMainImage(), profileDTO.mainImage());
        assertEquals(testUser.getTagNames(), profileDTO.tags());
    }

    @Test
    void testToUserStandardResponseDTO() {
        com.feeling.packages.user.domain.dto.UserResponseDTO standardDTO = UserDTOMapper.toUserStandardResponseDTO(testUser);

        assertNotNull(standardDTO);
        assertNotNull(standardDTO.status());
        assertNotNull(standardDTO.profile());

        // Verificar que mantiene la estructura esperada
        assertEquals(testUser.isVerified(), standardDTO.status().verified());
        assertEquals(testUser.getName(), standardDTO.profile().name());
        assertEquals(testUser.getLastName(), standardDTO.profile().lastName());
        assertEquals(testUser.getEmail(), standardDTO.profile().email());
    }

    @Test
    void testToUserPublicResponseDTO() {
        com.feeling.packages.user.domain.dto.UserResponseDTO publicDTO = UserDTOMapper.toUserPublicResponseDTO(testUser);

        assertNotNull(publicDTO);
        assertNotNull(publicDTO.status());
        assertNotNull(publicDTO.profile());

        // Verificar que solo incluye datos públicos en status
        assertEquals(testUser.isVerified(), publicDTO.status().verified());
        assertEquals(testUser.getProfileComplete(), publicDTO.status().profileComplete());
        assertEquals(testUser.isApproved(), publicDTO.status().approved());
        assertEquals(testUser.getApprovalStatus().name(), publicDTO.status().approvalStatus());

        // Verificar perfil completo
        assertEquals(testUser.getName(), publicDTO.profile().name());
        assertEquals(testUser.getEmail(), publicDTO.profile().email());
    }

    @Test
    void testToUserExtendedResponseDTO() {
        com.feeling.packages.user.domain.dto.UserResponseDTO extendedDTO = UserDTOMapper.toUserExtendedResponseDTO(testUser);

        assertNotNull(extendedDTO);
        assertNotNull(extendedDTO.status());
        assertNotNull(extendedDTO.profile());
        assertNotNull(extendedDTO.privacy());
        assertNotNull(extendedDTO.notifications());
        assertNotNull(extendedDTO.metrics());
        assertNotNull(extendedDTO.auth());
        // Note: account is null in extended response, only populated in admin operations

        // Verificar que las secciones esperadas están presentes
        assertEquals(testUser.isVerified(), extendedDTO.status().verified());
        assertEquals(testUser.getName(), extendedDTO.profile().name());
        assertEquals(testUser.isPublicAccount(), extendedDTO.privacy().publicAccount());
        assertEquals(testUser.isNotificationsEmailEnabled(), extendedDTO.notifications().notificationsEmailEnabled());
        assertEquals(testUser.getProfileViews(), extendedDTO.metrics().profileViews());
    }
}