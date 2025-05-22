package com.feeling.config;

import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.repositories.user.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final IUserRoleRepository userRoleRepository;
    private final IUserRepository userRepository;
    private final IUserAttributeRepository userAttributeRepository;
    private final IUserCategoryInterestRepository userCategoryInterestRepository;
    private final IUserTagRepository userTagRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Inicializando datos básicos de Feeling...");

        initializeUserRoles();
        initializeCategoryInterests();
        initializeUserAttributes();
        initializeCommonTags();
        createAdminUser();

        logger.info("Inicialización de datos completada exitosamente");
    }

    // ==============================
    // ROLES DE USUARIO
    // ==============================
    private void initializeUserRoles() {
        logger.info("Inicializando roles de usuario...");

        Arrays.stream(UserRoleList.values()).forEach(role -> {
            if (userRoleRepository.findByUserRoleList(role).isEmpty()) {
                UserRole userRole = new UserRole(role);
                userRoleRepository.save(userRole);
                logger.info("Rol creado: {}", role.name());
            }
        });
    }

    // ==============================
    // CATEGORÍAS DE INTERÉS
    // ==============================
    private void initializeCategoryInterests() {
        logger.info("Inicializando categorías de interés...");

        Arrays.stream(UserCategoryInterestList.values()).forEach(category -> {
            if (userCategoryInterestRepository.findByCategoryInterest(category).isEmpty()) {
                UserCategoryInterest categoryInterest = new UserCategoryInterest(category);
                userCategoryInterestRepository.save(categoryInterest);
                logger.info("Categoría de interés creada: {}", category.name());
            }
        });
    }

    // ==============================
    // ATRIBUTOS DE USUARIO
    // ==============================
    private void initializeUserAttributes() {
        logger.info("Inicializando atributos de usuario...");

        // Género
        createAttributesIfNotExists("GENDER", Arrays.asList(
                new AttributeData("MALE", "Masculino", "Identidad de género masculina", 1),
                new AttributeData("FEMALE", "Femenino", "Identidad de género femenina", 2),
                new AttributeData("NON_BINARY", "No binario", "Identidad de género no binaria", 3),
                new AttributeData("OTHER", "Otro", "Otra identidad de género", 4),
                new AttributeData("PREFER_NOT_TO_SAY", "Prefiero no decir", "Prefiere no especificar", 5)
        ));

        // Estado civil
        createAttributesIfNotExists("MARITAL_STATUS", Arrays.asList(
                new AttributeData("SINGLE", "Soltero/a", "Estado civil soltero", 1),
                new AttributeData("MARRIED", "Casado/a", "Estado civil casado", 2),
                new AttributeData("DIVORCED", "Divorciado/a", "Estado civil divorciado", 3),
                new AttributeData("WIDOWED", "Viudo/a", "Estado civil viudo", 4),
                new AttributeData("SEPARATED", "Separado/a", "Estado civil separado", 5),
                new AttributeData("IN_RELATIONSHIP", "En una relación", "En una relación", 6)
        ));

        // Color de ojos
        createAttributesIfNotExists("EYE_COLOR", Arrays.asList(
                new AttributeData("BROWN", "Marrones", "Ojos de color marrón", 1),
                new AttributeData("BLUE", "Azules", "Ojos de color azul", 2),
                new AttributeData("GREEN", "Verdes", "Ojos de color verde", 3),
                new AttributeData("HAZEL", "Avellana", "Ojos de color avellana", 4),
                new AttributeData("GRAY", "Grises", "Ojos de color gris", 5),
                new AttributeData("BLACK", "Negros", "Ojos de color negro", 6)
        ));

        // Color de cabello
        createAttributesIfNotExists("HAIR_COLOR", Arrays.asList(
                new AttributeData("BLACK", "Negro", "Cabello negro", 1),
                new AttributeData("BROWN", "Castaño", "Cabello castaño", 2),
                new AttributeData("BLONDE", "Rubio", "Cabello rubio", 3),
                new AttributeData("RED", "Pelirrojo", "Cabello pelirrojo", 4),
                new AttributeData("GRAY", "Canoso", "Cabello canoso", 5),
                new AttributeData("WHITE", "Blanco", "Cabello blanco", 6),
                new AttributeData("OTHER", "Otro", "Otro color de cabello", 7)
        ));

        // Tipo de cuerpo
        createAttributesIfNotExists("BODY_TYPE", Arrays.asList(
                new AttributeData("SLIM", "Delgado/a", "Constitución delgada", 1),
                new AttributeData("ATHLETIC", "Atlético/a", "Constitución atlética", 2),
                new AttributeData("AVERAGE", "Promedio", "Constitución promedio", 3),
                new AttributeData("CURVY", "Con curvas", "Constitución con curvas", 4),
                new AttributeData("PLUS_SIZE", "Talla grande", "Constitución de talla grande", 5)
        ));

        // Religión
        createAttributesIfNotExists("RELIGION", Arrays.asList(
                new AttributeData("CHRISTIAN", "Cristiano/a", "Religión cristiana", 1),
                new AttributeData("CATHOLIC", "Católico/a", "Religión católica", 2),
                new AttributeData("PROTESTANT", "Protestante", "Religión protestante", 3),
                new AttributeData("EVANGELICAL", "Evangélico/a", "Religión evangélica", 4),
                new AttributeData("PENTECOSTAL", "Pentecostal", "Religión pentecostal", 5),
                new AttributeData("ORTHODOX", "Ortodoxo/a", "Religión ortodoxa", 6),
                new AttributeData("JEWISH", "Judío/a", "Religión judía", 7),
                new AttributeData("MUSLIM", "Musulmán/a", "Religión musulmana", 8),
                new AttributeData("BUDDHIST", "Budista", "Religión budista", 9),
                new AttributeData("HINDU", "Hindú", "Religión hindú", 10),
                new AttributeData("SPIRITUAL", "Espiritual", "Persona espiritual sin religión específica", 11),
                new AttributeData("AGNOSTIC", "Agnóstico/a", "Persona agnóstica", 12),
                new AttributeData("ATHEIST", "Ateo/a", "Persona atea", 13),
                new AttributeData("OTHER", "Otra", "Otra religión", 14),
                new AttributeData("PREFER_NOT_TO_SAY", "Prefiero no decir", "Prefiere no especificar", 15)
        ));

        // Roles sexuales (específico para ROUSE)
        createAttributesIfNotExists("SEXUAL_ROLE", Arrays.asList(
                new AttributeData("TOP", "Activo", "Rol sexual activo", 1),
                new AttributeData("BOTTOM", "Pasivo", "Rol sexual pasivo", 2),
                new AttributeData("VERSATILE", "Versátil", "Rol sexual versátil", 3),
                new AttributeData("SIDE", "Side", "Prefiere actividades sin penetración", 4)
        ));

        // Tipos de relación (específico para ROUSE)
        createAttributesIfNotExists("RELATIONSHIP_TYPE", Arrays.asList(
                new AttributeData("MONOGAMOUS", "Monógamo", "Relación monógama", 1),
                new AttributeData("OPEN", "Abierta", "Relación abierta", 2),
                new AttributeData("POLYAMOROUS", "Poliamorosa", "Relación poliamorosa", 3),
                new AttributeData("CASUAL", "Casual", "Relación casual", 4),
                new AttributeData("FRIENDS_WITH_BENEFITS", "Amigos con beneficios", "Amigos con beneficios", 5),
                new AttributeData("EXPLORING", "Explorando", "Explorando opciones", 6)
        ));
    }

    private void createAttributesIfNotExists(String attributeType, List<AttributeData> attributesData) {
        attributesData.forEach(data -> {
            // Verificar si ya existe
            boolean exists = userAttributeRepository.findByCodeAndAttributeType(data.code, attributeType).isPresent();

            if (!exists) {
                UserAttribute attribute = UserAttribute.builder()
                        .code(data.code)
                        .name(data.name)
                        .attributeType(attributeType)
                        .description(data.description)
                        .displayOrder(data.displayOrder)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                userAttributeRepository.save(attribute);
                logger.debug("Atributo creado: {} - {}", attributeType, data.name);
            }
        });
    }

    // ==============================
    // TAGS COMUNES
    // ==============================
    private void initializeCommonTags() {
        logger.info("Inicializando tags comunes...");

        String systemEmail = "system@feeling.com";
        List<String> commonTags = Arrays.asList(
                // Intereses generales
                "música", "deportes", "viajes", "cocina", "lectura", "cine", "arte", "fotografía",
                "baile", "yoga", "fitness", "naturaleza", "playa", "montaña", "aventura",

                // Estilo de vida
                "fiestero", "casero", "social", "introvertido", "extrovertido", "aventurero",
                "tranquilo", "activo", "romántico", "divertido", "serio", "espontáneo",

                // Hobbies específicos
                "gaming", "netflix", "series", "anime", "manga", "comics", "videojuegos",
                "streaming", "podcast", "música en vivo", "conciertos", "festivales",

                // Comida y bebida
                "café", "vino", "cerveza", "vegetariano", "vegano", "foodie", "repostería",
                "parrilla", "comida italiana", "comida asiática", "comida mexicana",

                // Actividades
                "senderismo", "ciclismo", "running", "natación", "surf", "escalada",
                "esquí", "patinaje", "tenis", "fútbol", "básquet", "voleibol",

                // Intereses intelectuales
                "libros", "filosofía", "historia", "ciencia", "tecnología", "programación",
                "idiomas", "escritura", "poesía", "teatro", "literatura",

                // Espirituales/Religiosos (para SPIRIT)
                "oración", "biblia", "iglesia", "adoración", "servicio", "misiones",
                "grupos pequeños", "retiros", "conferencias", "música cristiana"
        );

        commonTags.forEach(tagName -> {
            if (userTagRepository.findByNameIgnoreCase(tagName).isEmpty()) {
                UserTag tag = UserTag.builder()
                        .name(tagName.toLowerCase())
                        .createdBy(systemEmail)
                        .createdAt(LocalDateTime.now())
                        .usageCount(0L)
                        .build();

                userTagRepository.save(tag);
                logger.debug("Tag común creado: {}", tagName);
            }
        });
    }

    // ==============================
    // USUARIO ADMINISTRADOR
    // ==============================
    private void createAdminUser() {
        logger.info("Verificando usuario administrador...");

        String adminEmail = "admin@feeling.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            UserRole adminRole = userRoleRepository.findByUserRoleList(UserRoleList.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));

            User admin = User.builder()
                    .name("Administrador")
                    .lastname("Feeling")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("AdminFeeling2025!"))
                    .userRole(adminRole)
                    .verified(true)
                    .profileComplete(true)
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .allowNotifications(true)
                    .showMeInSearch(false) // El admin no aparece en búsquedas
                    .availableAttempts(999)
                    .build();

            userRepository.save(admin);
            logger.info("Usuario administrador creado: {}", adminEmail);
        }
    }

    // ==============================
    // CLASE AUXILIAR PARA DATOS DE ATRIBUTOS
    // ==============================
    private static class AttributeData {
        public final String code;
        public final String name;
        public final String description;
        public final Integer displayOrder;

        public AttributeData(String code, String name, String description, Integer displayOrder) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.displayOrder = displayOrder;
        }
    }
}
