package com.feeling.config;

import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.repositories.user.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

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
    private final IUserCategoryInterestRepository categoryInterestRepository;

    @Value("${spring.security.user.name}")
    private String adminEmail;

    @Value("${spring.security.user.password}")
    private String adminPassword;

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

        // ESSENCE
        createCategoryIfNotExists(
                UserCategoryInterestList.ESSENCE,
                "Essence",
                "Conexiones auténticas para relaciones heterosexuales",
                "✨",
                "Essence es el espacio ideal para personas que buscan relaciones heterosexuales auténticas y significativas. Aquí puedes conectar con personas que comparten tus intereses y valores para formar vínculos duraderos.",
                "Personas heterosexuales que buscan relaciones auténticas, desde citas casuales hasta relaciones de largo plazo.",
                List.of(
                        "Conexiones basadas en compatibilidad real",
                        "Algoritmos diseñados para relaciones heterosexuales",
                        "Comunidad enfocada en relaciones serias",
                        "Herramientas para conocer gustos e intereses"
                ),
                1
        );

        // ROUSE
        createCategoryIfNotExists(
                UserCategoryInterestList.ROUSE,
                "Rouse",
                "Espacio inclusivo para la comunidad LGBTI+",
                "🏳️‍🌈",
                "Rouse es un espacio seguro e inclusivo diseñado especialmente para la comunidad LGBTI+. Aquí puedes ser auténtico/a y conectar con personas que entienden y celebran tu identidad.",
                "Miembros de la comunidad LGBTI+ que buscan conexiones auténticas en un ambiente seguro y comprensivo.",
                List.of(
                        "Ambiente 100% inclusivo y respetuoso",
                        "Opciones de identidad de género y orientación flexibles",
                        "Comunidad diversa y acogedora",
                        "Herramientas de seguridad y privacidad reforzadas"
                ),
                2
        );

        // SPIRIT
        createCategoryIfNotExists(
                UserCategoryInterestList.SPIRIT,
                "Spirit",
                "Comunidad cristiana con valores compartidos",
                "✝️",
                "Spirit es una comunidad para personas cristianas que desean conectar con otros que comparten su fe y valores. Un espacio donde la espiritualidad es parte fundamental de las relaciones.",
                "Personas cristianas que buscan relaciones donde la fe y los valores espirituales sean prioritarios.",
                List.of(
                        "Comunidad centrada en valores cristianos",
                        "Conexiones basadas en fe compartida",
                        "Ambiente respetuoso y familiar",
                        "Enfoque en relaciones con propósito y valores"
                ),
                3
        );

        logger.info("Inicialización de categorías de interés completada.");
    }

    private void createCategoryIfNotExists(
            UserCategoryInterestList categoryEnum,
            String name,
            String description,
            String icon,
            String fullDescription,
            String targetAudience,
            List<String> features,
            int displayOrder) {

        // CORREGIDO: Usar el método correcto
        Optional<UserCategoryInterest> existing = userCategoryInterestRepository.findByCategoryInterestEnum(categoryEnum);

        if (existing.isEmpty()) {
            UserCategoryInterest category = UserCategoryInterest.builder()
                    .categoryInterestEnum(categoryEnum)
                    .name(name)
                    .description(description)
                    .icon(icon)
                    .fullDescription(fullDescription)
                    .targetAudience(targetAudience)
                    .features(features)
                    .isActive(true)
                    .displayOrder(displayOrder)
                    .build();

            userCategoryInterestRepository.save(category);
            logger.info("Categoría de interés creada: {}", name);
        } else {
            logger.info("Categoría de interés ya existe: {}", name);
        }
    }

    // ==============================
    // ATRIBUTOS DE USUARIO
    // ==============================
    private void initializeUserAttributes() {
        logger.info("Inicializando atributos de usuario...");

        // Género
        createAttributesIfNotExists("GENDER", Arrays.asList(
                new AttributeData("MALE", "Masculino", "Identidad de género masculina", "man", 1),
                new AttributeData("FEMALE", "Femenino", "Identidad de género femenina", "woman", 2),
                new AttributeData("NON_BINARY", "No binario", "Identidad de género no binaria", "transgender", 3),
                new AttributeData("OTHER", "Otro", "Otra identidad de género", "diversity_3", 4),
                new AttributeData("PREFER_NOT_TO_SAY", "Prefiero no decir", "Prefiere no especificar", "visibility_off", 5)
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
                new AttributeData("BROWN", "Marrones", "Ojos de color marrón", "#D2691E", 1),
                new AttributeData("BLUE", "Azules", "Ojos de color azul", "#1E90FF", 2),
                new AttributeData("GREEN", "Verdes", "Ojos de color verde", "#32CD32", 3),
                new AttributeData("HAZEL", "Avellana", "Ojos de color avellana", "#DAA520", 4),
                new AttributeData("GRAY", "Grises", "Ojos de color gris", "#6495ED", 5),
                new AttributeData("BLACK", "Negros", "Ojos de color negro", "#2F2F2F", 6),
                new AttributeData("AMBER", "Ámbar", "Ojos de color ámbar", "#FFBF00", 7)
        ));

        // Color de cabello
        createAttributesIfNotExists("HAIR_COLOR", Arrays.asList(
                new AttributeData("BLACK", "Negro", "Cabello negro", "#1C1C1C", 1),
                new AttributeData("DARK_BROWN", "Castaño Oscuro", "Cabello castaño oscuro", "#654321", 2),
                new AttributeData("BROWN", "Castaño", "Cabello castaño", "#8B4513", 3),
                new AttributeData("LIGHT_BROWN", "Castaño Claro", "Cabello castaño claro", "#CD853F", 4),
                new AttributeData("DARK_BLONDE", "Rubio Oscuro", "Cabello rubio oscuro", "#B8860B", 5),
                new AttributeData("BLONDE", "Rubio", "Cabello rubio", "#FFD700", 6),
                new AttributeData("LIGHT_BLONDE", "Rubio Claro", "Cabello rubio claro", "#F0E68C", 7),
                new AttributeData("STRAWBERRY_BLONDE", "Rubio Fresa", "Cabello rubio fresa", "#FF7F50", 8),
                new AttributeData("RED", "Pelirrojo", "Cabello pelirrojo", "#FF4500", 9),
                new AttributeData("AUBURN", "Cobrizo", "Cabello cobrizo", "#A52A2A", 10),
                new AttributeData("GRAY", "Canoso", "Cabello canoso", "#C0C0C0", 11),
                new AttributeData("WHITE", "Blanco", "Cabello blanco", "#F8F8FF", 12),
                new AttributeData("OTHER", "Otro", "Otro color de cabello", "palette", 13)
        ));

        // Tipo de cuerpo
        createAttributesIfNotExists("BODY_TYPE", Arrays.asList(
                new AttributeData("SLIM", "Delgado/a", "Constitución delgada", "straighten", 1),
                new AttributeData("ATHLETIC", "Atlético/a", "Constitución atlética", "fitness_center", 2),
                new AttributeData("AVERAGE", "Promedio", "Constitución promedio", "person", 3),
                new AttributeData("CURVY", "Con curvas", "Constitución con curvas", "waving_hand", 4),
                new AttributeData("PLUS_SIZE", "Talla grande", "Constitución de talla grande", "sentiment_satisfied", 5),
                new AttributeData("PREFER_NOT_TO_SAY", "Prefiero no decir", "Prefiere no especificar", "visibility_off", 6)
        ));

        // Nivel educativo
        createAttributesIfNotExists("EDUCATION_LEVEL", Arrays.asList(
                new AttributeData("PRIMARY", "Primaria", "Educación primaria completa", 1),
                new AttributeData("SECONDARY", "Secundaria", "Educación secundaria completa", 2),
                new AttributeData("HIGH_SCHOOL", "Bachillerato", "Educación de bachillerato completa", 3),
                new AttributeData("TECHNICIAN", "Técnico o Tecnólogo", "Educación técnica o tecnóloga", 4),
                new AttributeData("VOCATIONAL", "Profesional", "Título profesional o Licenciatura", 5),
                new AttributeData("MASTER", "Maestría", "Título universitario de maestría", 6),
                new AttributeData("DOCTORATE", "Doctorado", "Título universitario de doctorado", 7),
                new AttributeData("OTHER", "Otro nivel educativo", "Otro nivel educativo no especificado", 8)
        ));

        // Religión
        createAttributesIfNotExists("RELIGION", Arrays.asList(
                new AttributeData("CHRISTIAN", "Cristiano/a", "Religión cristiana", "church", 1),
                new AttributeData("CATHOLIC", "Católico/a", "Religión católica", "church", 2),
                new AttributeData("PROTESTANT", "Protestante", "Religión protestante", "menu_book", 3),
                new AttributeData("EVANGELICAL", "Evangélico/a", "Religión evangélica", "campaign", 4),
                new AttributeData("PENTECOSTAL", "Pentecostal", "Religión pentecostal", "whatshot", 5),
                new AttributeData("ORTHODOX", "Ortodoxo/a", "Religión ortodoxa", "account_balance", 6),
                new AttributeData("JEWISH", "Judío/a", "Religión judía", "brightness_empty", 7),
                new AttributeData("MUSLIM", "Musulmán/a", "Religión musulmana", "mosque", 8),
                new AttributeData("BUDDHIST", "Budista", "Religión budista", "self_improvement", 9),
                new AttributeData("HINDU", "Hindú", "Religión hindú", "spa", 10),
                new AttributeData("SPIRITUAL", "Espiritual", "Persona espiritual sin religión específica", "auto_awesome", 11),
                new AttributeData("AGNOSTIC", "Agnóstico/a", "Persona agnóstica", "help", 12),
                new AttributeData("ATHEIST", "Ateo/a", "Persona atea", "block", 13),
                new AttributeData("OTHER", "Otra", "Otra religión", "public", 14),
                new AttributeData("PREFER_NOT_TO_SAY", "Prefiero no decir", "Prefiere no especificar", "visibility_off", 15)
        ));

        // Roles sexuales (específico para ROUSE)
        createAttributesIfNotExists("SEXUAL_ROLE", Arrays.asList(
                new AttributeData("TOP", "Activo", "Rol sexual activo", "keyboard_arrow_up", 1),
                new AttributeData("BOTTOM", "Pasivo", "Rol sexual pasivo", "keyboard_arrow_down", 2),
                new AttributeData("VERSATILE", "Versátil", "Rol sexual versátil", "swap_vert", 3),
                new AttributeData("SIDE", "Side", "Prefiere actividades sin penetración", "swap_horiz", 4)
        ));

        // Tipos de relación (específico para ROUSE)
        createAttributesIfNotExists("RELATIONSHIP_TYPE", Arrays.asList(
                new AttributeData("MONOGAMOUS", "Monógamo", "Relación monógama", "favorite", 1),
                new AttributeData("OPEN", "Abierta", "Relación abierta", "link", 2),
                new AttributeData("POLYAMOROUS", "Poliamorosa", "Relación poliamorosa", "group", 3),
                new AttributeData("CASUAL", "Casual", "Relación casual", "sentiment_satisfied", 4),
                new AttributeData("FRIENDS_WITH_BENEFITS", "Amigos con beneficios", "Amigos con beneficios", "handshake", 5),
                new AttributeData("EXPLORING", "Explorando", "Explorando opciones", "search", 6)
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
                        .detail(data.detail)
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

        // Verificar si ya existen tags para evitar duplicados
        if (userTagRepository.count() > 0) {
            logger.info("Los tags comunes ya están inicializados");
            return;
        }

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
            try {
                if (userTagRepository.findByNameIgnoreCase(tagName).isEmpty()) {
                    UserTag tag = UserTag.builder()
                            .name(tagName.toLowerCase())
                            .createdBy(systemEmail)
                            .createdAt(LocalDateTime.now())
                            .usageCount(0L)
                            .lastUsed(LocalDateTime.now())
                            .build();

                    userTagRepository.save(tag);
                    logger.debug("Tag común creado: {}", tagName);
                }
            } catch (Exception e) {
                logger.error("Error al crear tag '{}': {}", tagName, e.getMessage());
                // Continuar con el siguiente tag en lugar de fallar completamente
            }
        });

        logger.info("Inicialización de tags comunes completada");
    }

    // ==============================
    // USUARIO ADMINISTRADOR
    // ==============================
    private void createAdminUser() {
        logger.info("Verificando usuario administrador...");

        if (userRepository.findByEmail(this.adminEmail).isEmpty()) {
            UserRole adminRole = userRoleRepository.findByUserRoleList(UserRoleList.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));

            User admin = User.builder()
                    .name("Administrador")
                    .lastname("Feeling")
                    .email(this.adminEmail)
                    .password(passwordEncoder.encode(this.adminPassword))
                    .userRole(adminRole)
                    .verified(true)
                    .profileComplete(true)
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .allowNotifications(true)
                    .showMeInSearch(false)
                    .availableAttempts(999)
                    .build();

            userRepository.save(admin);
            logger.info("Usuario administrador creado: {}", this.adminEmail);
        }
    }

    // ==============================
    // CLASE AUXILIAR PARA DATOS DE ATRIBUTOS
    // ==============================
    private static class AttributeData {
        public final String code;
        public final String name;
        public final String description;
        public final String detail;
        public final Integer displayOrder;

        // Constructor con detail explícito
        public AttributeData(String code, String name, String description, String detail, Integer displayOrder) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.detail = detail;
            this.displayOrder = displayOrder;
        }

        // Constructor que mantiene compatibilidad (detail = null)
        public AttributeData(String code, String name, String description, Integer displayOrder) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.detail = null;
            this.displayOrder = displayOrder;
        }
    }
}
