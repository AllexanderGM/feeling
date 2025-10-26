package com.feeling.config.core;

import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.event.infrastructure.entities.EventCategory;
import com.feeling.packages.event.infrastructure.entities.EventStatus;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.match.infrastructure.entities.MatchPlan;
import com.feeling.packages.match.infrastructure.repositories.IMatchPlanRepository;
import com.feeling.packages.user.domain.enums.UserApprovalStatus;
import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.domain.enums.UserTagApprovalStatus;
import com.feeling.packages.user.domain.services.UserAttributeService;
import com.feeling.packages.user.infrastructure.entities.*;
import com.feeling.packages.user.infrastructure.repositories.IUserCategoryInterestRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserRoleRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserTagRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final IUserRoleRepository userRoleRepository;
    private final IUserRepository userRepository;
    private final IUserCategoryInterestRepository userCategoryInterestRepository;
    private final IUserTagRepository userTagRepository;
    private final IMatchPlanRepository matchPlanRepository;
    private final IEventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAttributeService userAttributeService;

    // Usar variables de entorno para el administrador del sistema
    @Value("${admin.username}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Inicializando datos básicos de Feeling...");

        initializeUserRoles();
        initializeCategoryInterests();
        initializeUserAttributes();
        initializeCommonTags();
        initializeMatchPlans();
        createAdminUser();
        createTestUsers();
        initializeTestEvents();

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
                .isActive(true)
                .displayOrder(displayOrder)
                .build();

            // Guardar sin features primero para evitar lazy loading issues
            UserCategoryInterest savedCategory = userCategoryInterestRepository.save(category);

            // Establecer features después del save si es necesario
            if (features != null && !features.isEmpty()) {
                savedCategory.setFeatures(new ArrayList<>(features));
                userCategoryInterestRepository.save(savedCategory);
            }

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

        // Iglesias de Bogotá (específico para SPIRIT)
        createAttributesIfNotExists("CHURCH", Arrays.asList(
            // Iglesias Católicas Principales de Bogotá
            new AttributeData("CATEDRAL_PRIMADA", "Catedral Primada de Bogotá", "Catedral Primada - Centro de Bogotá", "church", 1),
            new AttributeData("BASILICA_GUADALUPE", "Basílica de Nuestra Señora de Guadalupe", "Basílica en el Cerro de Guadalupe", "church", 2),
            new AttributeData("IGLESIA_SAN_FRANCISCO", "Iglesia de San Francisco", "Iglesia colonial en La Candelaria", "church", 3),
            new AttributeData("IGLESIA_VERACRUZ", "Iglesia de la Veracruz", "Iglesia histórica del centro", "church", 4),
            new AttributeData("IGLESIA_SAGRADO_CORAZON", "Iglesia del Sagrado Corazón", "Iglesia del Sagrado Corazón - Chapinero", "church", 5),
            new AttributeData("PARROQUIA_SAN_PATRICIO", "Parroquia San Patricio", "Zona Rosa - Chapinero", "church", 6),
            new AttributeData("IGLESIA_LOURDES", "Iglesia de Lourdes", "Chapinero Alto", "church", 7),

            // Iglesias Evangélicas Reconocidas
            new AttributeData("CASA_SOBRE_LA_ROCA", "Casa Sobre la Roca", "Iglesia Casa Sobre la Roca", "home", 8),
            new AttributeData("CENTRO_MUNDIAL_AVIVAMIENTO", "Centro Mundial de Avivamiento", "CMA - Bogotá", "public", 9),
            new AttributeData("MISION_CARISMATICA", "Misión Carismática Internacional", "MCI - Bogotá", "rocket_launch", 10),
            new AttributeData("IGLESIA_MANANTIAL", "Iglesia Manantial", "Iglesia Manantial Bogotá", "water_drop", 11),
            new AttributeData("CENTRO_CRISTIANO_CASA_DE_DIOS", "Centro Cristiano Casa de Dios", "Casa de Dios Bogotá", "home_work", 12),
            new AttributeData("IGLESIA_VISION_DE_FUTURO", "Iglesia Visión de Futuro", "Visión de Futuro Bogotá", "visibility", 13),
            new AttributeData("COMUNIDAD_VIDA_NUEVA", "Comunidad Vida Nueva", "Iglesia Vida Nueva", "refresh", 14),

            // Iglesias Pentecostales
            new AttributeData("IGLESIA_PENTECOSTAL_UNIDA", "Iglesia Pentecostal Unida", "IPU Bogotá", "whatshot", 15),
            new AttributeData("ASAMBLEAS_DE_DIOS", "Asambleas de Dios", "Asambleas de Dios Bogotá", "groups", 16),
            new AttributeData("IGLESIA_CUADRANGULAR", "Iglesia del Evangelio Cuadrangular", "IEC Bogotá", "crop_square", 17),

            // Iglesias Presbiterianas y Reformadas
            new AttributeData("IGLESIA_PRESBITERIANA_BOGOTA", "Iglesia Presbiteriana de Bogotá", "Iglesia Presbiteriana", "gavel", 18),
            new AttributeData("IGLESIA_REFORMADA", "Iglesia Reformada", "Tradición Reformada Bogotá", "menu_book", 19),

            // Iglesias Bautistas
            new AttributeData("IGLESIA_BAUTISTA_CENTRAL", "Iglesia Bautista Central", "Iglesia Bautista del Centro", "waves", 20),
            new AttributeData("CONVENCION_BAUTISTA", "Convención Bautista", "Iglesias Bautistas de Colombia", "waves", 21),

            // Iglesias Adventistas
            new AttributeData("IGLESIA_ADVENTISTA_CENTRAL", "Iglesia Adventista Central", "Adventista del Séptimo Día - Central", "schedule", 22),
            new AttributeData("IGLESIA_ADVENTISTA_NORTE", "Iglesia Adventista Norte", "Adventista zona norte de Bogotá", "schedule", 23),

            // Iglesias Metodistas y Episcopales
            new AttributeData("IGLESIA_METODISTA_BOGOTA", "Iglesia Metodista de Bogotá", "Iglesia Metodista", "favorite", 24),
            new AttributeData("IGLESIA_EPISCOPAL", "Iglesia Episcopal", "Iglesia Episcopal Anglicana", "account_balance", 25),

            // Otras Denominaciones
            new AttributeData("TESTIGOS_JEHOVA", "Testigos de Jehová", "Salón del Reino - Bogotá", "book", 26),
            new AttributeData("IGLESIA_SUD", "Iglesia de Jesucristo SUD", "Santos de los Últimos Días", "temple_hindu", 27),
            new AttributeData("IGLESIA_CRISTIANA_INTEGRAL", "Iglesia Cristiana Integral", "ICI Bogotá", "integration_instructions", 28),

            // Opciones adicionales
            new AttributeData("OTRA_IGLESIA_BOGOTA", "Otra Iglesia de Bogotá", "Iglesia no listada específica de Bogotá", "church", 29),
            new AttributeData("AGREGAR_NUEVA", "Agregar Nueva Iglesia", "Permite agregar una nueva iglesia", "add_circle", 30)
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
            boolean exists = userAttributeService.findByCodeAndAttributeType(data.code, attributeType).isPresent();

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

                userAttributeService.save(attribute);
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
                        .createdBy(adminEmail)
                        .createdAt(LocalDateTime.now())
                        .usageCount(0L)
                        .lastUsed(LocalDateTime.now())
                        .approvalStatus(UserTagApprovalStatus.APPROVED) // Tags comunes del sistema pre-aprobados
                        .approvedBy(adminEmail)
                        .approvedAt(LocalDateTime.now())
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
    // PLANES DE MATCH
    // ==============================
    private void initializeMatchPlans() {
        logger.info("Inicializando planes de match...");

        if (matchPlanRepository.count() > 0) {
            logger.info("Los planes de match ya están inicializados");
            return;
        }

        // Plan básico - 1 intento
        MatchPlan basicPlan = new MatchPlan(
            "Plan Básico",
            "Perfecto para probar el servicio. 1 intento de match para conectar con alguien especial.",
            1,
            new BigDecimal("2.99"),
            1
        );

        // Plan estándar - 5 intentos
        MatchPlan standardPlan = new MatchPlan(
            "Plan Estándar",
            "El más popular. 5 intentos de match para aumentar tus posibilidades de encontrar conexiones auténticas.",
            5,
            new BigDecimal("9.99"),
            2
        );

        // Plan premium - 10 intentos
        MatchPlan premiumPlan = new MatchPlan(
            "Plan Premium",
            "La mejor opción para usuarios activos. 10 intentos de match para maximizar tus oportunidades de conexión.",
            10,
            new BigDecimal("16.99"),
            3
        );

        matchPlanRepository.save(basicPlan);
        matchPlanRepository.save(standardPlan);
        matchPlanRepository.save(premiumPlan);

        logger.info("Planes de match creados: Plan Básico (1 intento - $2.99), Plan Estándar (5 intentos - $9.99), Plan Premium (10 intentos - $16.99)");
    }

    // ==============================
    // USUARIO ADMINISTRADOR
    // ==============================
    private void createAdminUser() {
        logger.info("Verificando usuario administrador...");

        String normalizedAdminEmail = this.adminEmail.toLowerCase().trim();

        // Verificar si existe usuario con email sin normalizar y eliminarlo
        Optional<User> oldUser = userRepository.findByEmail(this.adminEmail);
        if (oldUser.isPresent() && !this.adminEmail.equals(normalizedAdminEmail)) {
            logger.info("Eliminando usuario admin con email no normalizado: {}", this.adminEmail);
            userRepository.delete(oldUser.get());
        }

        if (userRepository.isEmailAvailable(normalizedAdminEmail)) {
            UserRole adminRole = userRoleRepository.findByUserRoleList(UserRoleList.ADMIN)
                .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));

            // Obtener atributos necesarios para completar el perfil
            UserAttribute defaultGender = userAttributeService.findByCodeAndAttributeType("MALE", "GENDER")
                .orElse(null);
            UserAttribute defaultReligion = userAttributeService.findByCodeAndAttributeType("CATHOLIC", "RELIGION")
                .orElse(null);
            UserCategoryInterest defaultCategory = userCategoryInterestRepository
                .findByCategoryInterestEnum(UserCategoryInterestList.ESSENCE)
                .orElse(null);

            User admin = User.builder()
                .name("Administrador")
                .lastName("Feeling")
                .email(normalizedAdminEmail)
                .password(passwordEncoder.encode(this.adminPassword))
                .userRole(adminRole)
                .verified(true)
                .userApprovalStatus(UserApprovalStatus.APPROVED)
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .allowNotifications(true)
                .showMeInSearch(false)
                .availableAttempts(999)
                // Configuración de notificaciones por defecto
                .notificationsEmailEnabled(true)
                .notificationsPhoneEnabled(false)
                .notificationsMatchesEnabled(true)
                .notificationsEventsEnabled(true)
                .notificationsLoginEnabled(true)
                .notificationsPaymentsEnabled(true)
                // CAMPOS REQUERIDOS PARA COMPLETAR EL PERFIL
                .document("0000000000")
                .phone("3000000000")
                .phoneCode("+57")
                .country("Colombia")
                .city("Bogotá")
                .description("Administrador del sistema Feeling")
                .height(175)
                .gender(defaultGender)
                .categoryInterest(defaultCategory)
                .religion(defaultReligion)
                // Preferencias por defecto
                .agePreferenceMin(18)
                .agePreferenceMax(80)
                .locationPreferenceRadius(100)
                // Métricas iniciales
                .profileViews(0L)
                .likesReceived(0L)
                .matchesCount(0L)
                .popularityScore(0.0)
                // Configuración de privacidad por defecto
                .publicAccount(true)
                .searchVisibility(true)
                .locationPublic(true)
                .showAge(true)
                .showLocation(true)
                .showPhone(false)
                // Estado de cuenta por defecto
                .accountDeactivated(false)
                // Usuario protegido contra eliminación
                .protectedUser(true)
                // Imágenes de perfil para completitud
                .images(List.of("/user.png"))
                .build();

            User savedAdmin = userRepository.save(admin);

            // Crear y asignar tags básicos para el administrador
            createAndAssignAdminTags(savedAdmin, normalizedAdminEmail);
            userRepository.save(savedAdmin);

            logger.info("Usuario administrador creado con perfil completo: {}", normalizedAdminEmail);
        } else {
            // Si el administrador ya existe, verificar si necesita actualización de campos
            Optional<User> optionalAdmin = userRepository.findByEmail(normalizedAdminEmail);
            if (optionalAdmin.isEmpty()) {
                logger.warn("No se pudo encontrar el usuario administrador con email: {}", normalizedAdminEmail);
                return;
            }

            User existingAdmin = optionalAdmin.get();
            boolean needsUpdate = false;

            // Verificar y actualizar campos faltantes
            if (existingAdmin.getDocument() == null) {
                existingAdmin.setDocument("0000000000");
                needsUpdate = true;
            }
            if (existingAdmin.getPhone() == null) {
                existingAdmin.setPhone("3000000000");
                needsUpdate = true;
            }
            if (existingAdmin.getPhoneCode() == null) {
                existingAdmin.setPhoneCode("+57");
                needsUpdate = true;
            }
            if (existingAdmin.getCountry() == null) {
                existingAdmin.setCountry("Colombia");
                needsUpdate = true;
            }
            if (existingAdmin.getCity() == null) {
                existingAdmin.setCity("Bogotá");
                needsUpdate = true;
            }
            if (existingAdmin.getDescription() == null) {
                existingAdmin.setDescription("Administrador del sistema Feeling");
                needsUpdate = true;
            }
            if (existingAdmin.getHeight() == null) {
                existingAdmin.setHeight(175);
                needsUpdate = true;
            }
            // Set default image if not already present (safe lazy loading check)
            try {
                if (existingAdmin.getImages() == null || existingAdmin.getImages().isEmpty()) {
                    existingAdmin.setImages(List.of("https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Admin"));
                    needsUpdate = true;
                }
            } catch (org.hibernate.LazyInitializationException e) {
                // Si no se puede cargar la colección, asumimos que está vacía y agregamos imagen
                existingAdmin.setImages(List.of("https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Admin"));
                needsUpdate = true;
            }
            if (existingAdmin.getGender() == null) {
                UserAttribute defaultGender = userAttributeService.findByCodeAndAttributeType("MALE", "GENDER").orElse(null);
                if (defaultGender != null) {
                    existingAdmin.setGender(defaultGender);
                    needsUpdate = true;
                }
            }
            if (existingAdmin.getCategoryInterest() == null) {
                UserCategoryInterest defaultCategory = userCategoryInterestRepository
                    .findByCategoryInterestEnum(UserCategoryInterestList.ESSENCE).orElse(null);
                if (defaultCategory != null) {
                    existingAdmin.setCategoryInterest(defaultCategory);
                    needsUpdate = true;
                }
            }
            if (existingAdmin.getReligion() == null) {
                UserAttribute defaultReligion = userAttributeService.findByCodeAndAttributeType("CATHOLIC", "RELIGION").orElse(null);
                if (defaultReligion != null) {
                    existingAdmin.setReligion(defaultReligion);
                    needsUpdate = true;
                }
            }
            if (existingAdmin.getAgePreferenceMin() == null) {
                existingAdmin.setAgePreferenceMin(18);
                needsUpdate = true;
            }
            if (existingAdmin.getAgePreferenceMax() == null) {
                existingAdmin.setAgePreferenceMax(80);
                needsUpdate = true;
            }
            if (existingAdmin.getLocationPreferenceRadius() == null) {
                existingAdmin.setLocationPreferenceRadius(100);
                needsUpdate = true;
            }
            // Ensure admin is always approved
            if (!existingAdmin.isApproved()) {
                existingAdmin.approve();
                needsUpdate = true;
            }
            // Ensure admin is always protected
            if (!existingAdmin.isProtectedUser()) {
                existingAdmin.setProtectedUser(true);
                needsUpdate = true;
            }

            // Verificar y asignar tags si no los tiene (safe lazy loading check)
            try {
                if (existingAdmin.getTags() == null || existingAdmin.getTags().isEmpty()) {
                    createAndAssignAdminTags(existingAdmin, normalizedAdminEmail);
                    needsUpdate = true;
                }
            } catch (org.hibernate.LazyInitializationException e) {
                // Si no se puede cargar la colección, asumimos que está vacía y agregamos tags
                createAndAssignAdminTags(existingAdmin, normalizedAdminEmail);
                needsUpdate = true;
            }

            if (needsUpdate) {
                userRepository.save(existingAdmin);
                logger.info("Usuario administrador actualizado con campos faltantes: {}", this.adminEmail);
            }
        }
    }

    // ==============================
    // MÉTODOS AUXILIARES
    // ==============================

    /**
     * Crea y asigna tags de administrador al usuario
     */
    private void createAndAssignAdminTags(User admin, String normalizedAdminEmail) {
        try {
            // Crear o obtener el tag "administrador"
            UserTag adminTag = userTagRepository.findByNameIgnoreCase("administrador")
                .orElse(null);
            if (adminTag == null) {
                adminTag = UserTag.builder()
                    .name("administrador")
                    .createdBy(normalizedAdminEmail)
                    .createdAt(LocalDateTime.now())
                    .usageCount(1L)
                    .lastUsed(LocalDateTime.now())
                    .approvalStatus(UserTagApprovalStatus.APPROVED) // Tags del sistema pre-aprobados
                    .approvedBy(normalizedAdminEmail)
                    .approvedAt(LocalDateTime.now())
                    .build();
                adminTag = userTagRepository.save(adminTag);
            }

            // Crear o obtener el tag "sistema"
            UserTag systemTag = userTagRepository.findByNameIgnoreCase("sistema")
                .orElse(null);
            if (systemTag == null) {
                systemTag = UserTag.builder()
                    .name("sistema")
                    .createdBy(normalizedAdminEmail)
                    .createdAt(LocalDateTime.now())
                    .usageCount(1L)
                    .lastUsed(LocalDateTime.now())
                    .approvalStatus(UserTagApprovalStatus.APPROVED) // Tags del sistema pre-aprobados
                    .approvedBy(normalizedAdminEmail)
                    .approvedAt(LocalDateTime.now())
                    .build();
                systemTag = userTagRepository.save(systemTag);
            }

            admin.setTags(List.of(adminTag, systemTag));
            logger.info("Tags básicos del administrador creados/verificados y asignados");
        } catch (Exception e) {
            logger.warn("No se pudieron asignar tags al administrador: {}", e.getMessage());
        }
    }

    // ==============================
    // CLASE AUXILIAR PARA DATOS DE ATRIBUTOS
    // ==============================
    private record AttributeData(String code, String name, String description, String detail, Integer displayOrder) {
        // Constructor con detail explícito

        // Constructor que mantiene compatibilidad (detail = null)
        public AttributeData(String code, String name, String description, Integer displayOrder) {
            this(code, name, description, null, displayOrder);
        }
    }

    // ==============================
    // USUARIOS DE PRUEBA
    // ==============================
    private void createTestUsers() {
        logger.info("Creando usuarios de prueba para todas las categorías...");

        // Verificar si ya existen usuarios de prueba específicos para evitar duplicados
        long testUsersCount = userRepository.countByEmailContaining("@test-feeling.com");
        if (testUsersCount > 0) {
            logger.info("Ya existen {} usuarios de prueba, saltando creación", testUsersCount);
            return;
        }

        try {
            // Obtener datos necesarios
            UserRole clientRole = userRoleRepository.findByUserRoleList(UserRoleList.CLIENT)
                .orElseThrow(() -> new RuntimeException("Rol CLIENT no encontrado"));

            List<UserCategoryInterest> categories = userCategoryInterestRepository.findAll();
            List<UserAttribute> genders = userAttributeService.findByAttributeTypeAndActiveTrue("GENDER");
            List<UserAttribute> eyeColors = userAttributeService.findByAttributeTypeAndActiveTrue("EYE_COLOR");
            List<UserAttribute> hairColors = userAttributeService.findByAttributeTypeAndActiveTrue("HAIR_COLOR");
            List<UserAttribute> bodyTypes = userAttributeService.findByAttributeTypeAndActiveTrue("BODY_TYPE");
            List<UserAttribute> maritalStatuses = userAttributeService.findByAttributeTypeAndActiveTrue("MARITAL_STATUS");
            List<UserAttribute> educationLevels = userAttributeService.findByAttributeTypeAndActiveTrue("EDUCATION_LEVEL");

            Random random = new Random();
            int usuariosCreados = 0;

            // 1. USUARIOS ACTIVOS (50 usuarios): verified=true, userApprovalStatus=APPROVED, profileComplete=true, accountDeactivated=false
            logger.info("Creando usuarios activos...");
            for (int i = 0; i < 50; i++) {
                User user = createSpecificUser(random, clientRole, categories, genders, eyeColors, hairColors, bodyTypes,
                    maritalStatuses, educationLevels, "ACTIVE", i);
                if (userRepository.isEmailAvailable(user.getEmail())) {
                    userRepository.save(user);
                    usuariosCreados++;
                    logger.debug("Usuario ACTIVO creado: {}", user.getEmail());
                }
            }

            // 2. USUARIOS PENDIENTES DE APROBACIÓN (12 usuarios): verified=true, profileComplete=true, userApprovalStatus=PENDING, accountDeactivated=false
            logger.info("Creando usuarios pendientes de aprobación...");
            for (int i = 0; i < 12; i++) {
                User user = createSpecificUser(random, clientRole, categories, genders, eyeColors, hairColors, bodyTypes,
                    maritalStatuses, educationLevels, "PENDING_APPROVAL", i);
                if (userRepository.isEmailAvailable(user.getEmail())) {
                    userRepository.save(user);
                    usuariosCreados++;
                    logger.debug("Usuario PENDIENTE DE APROBACIÓN creado: {}", user.getEmail());
                }
            }

            // 3. USUARIOS CON PERFILES INCOMPLETOS (8 usuarios): verified=true, profileComplete=false, userApprovalStatus=PENDING, accountDeactivated=false
            logger.info("Creando usuarios con perfiles incompletos...");
            for (int i = 0; i < 8; i++) {
                User user = createSpecificUser(random, clientRole, categories, genders, eyeColors, hairColors, bodyTypes,
                    maritalStatuses, educationLevels, "INCOMPLETE_PROFILE", i);
                if (userRepository.isEmailAvailable(user.getEmail())) {
                    userRepository.save(user);
                    usuariosCreados++;
                    logger.debug("Usuario PERFIL INCOMPLETO creado: {}", user.getEmail());
                }
            }

            // 4. USUARIOS CON EMAIL NO VERIFICADO (5 usuarios): verified=false, accountDeactivated=false
            logger.info("Creando usuarios con email no verificado...");
            for (int i = 0; i < 5; i++) {
                User user = createSpecificUser(random, clientRole, categories, genders, eyeColors, hairColors, bodyTypes,
                    maritalStatuses, educationLevels, "UNVERIFIED", i);
                if (userRepository.isEmailAvailable(user.getEmail())) {
                    userRepository.save(user);
                    usuariosCreados++;
                    logger.debug("Usuario EMAIL NO VERIFICADO creado: {}", user.getEmail());
                }
            }

            // 5. USUARIOS RECHAZADOS (8 usuarios): verified=true, userApprovalStatus=REJECTED, accountDeactivated=false, perfil completo
            logger.info("Creando usuarios rechazados...");
            for (int i = 0; i < 8; i++) {
                User user = createSpecificUser(random, clientRole, categories, genders, eyeColors, hairColors, bodyTypes,
                    maritalStatuses, educationLevels, "REJECTED", i);
                if (userRepository.isEmailAvailable(user.getEmail())) {
                    userRepository.save(user);
                    usuariosCreados++;
                    logger.debug("Usuario RECHAZADO creado: {}", user.getEmail());
                }
            }

            // 6. USUARIOS DESACTIVADOS (7 usuarios): accountDeactivated=true, perfil completo
            logger.info("Creando usuarios desactivados...");
            for (int i = 0; i < 7; i++) {
                User user = createSpecificUser(random, clientRole, categories, genders, eyeColors, hairColors, bodyTypes,
                    maritalStatuses, educationLevels, "DEACTIVATED", i);
                if (userRepository.isEmailAvailable(user.getEmail())) {
                    userRepository.save(user);
                    usuariosCreados++;
                    logger.debug("Usuario DESACTIVADO creado: {}", user.getEmail());
                }
            }

            logger.info("Se crearon {} usuarios de prueba distribuidos en las 6 categorías", usuariosCreados);
            logger.info("RESUMEN: {} activos, {} pendientes, {} incompletos, {} no verificados, {} rechazados, {} desactivados",
                50, 12, 8, 5, 8, 7);
            logger.info("NOTA: La mayoría de usuarios tienen perfiles COMPLETOS para facilitar las pruebas de matching");

        } catch (Exception e) {
            logger.error("Error en creación de usuarios de prueba: {}", e.getMessage());
        }
    }

    private User createSpecificUser(Random random, UserRole clientRole,
                                    List<UserCategoryInterest> categories,
                                    List<UserAttribute> genders,
                                    List<UserAttribute> eyeColors,
                                    List<UserAttribute> hairColors,
                                    List<UserAttribute> bodyTypes,
                                    List<UserAttribute> maritalStatuses,
                                    List<UserAttribute> educationLevels,
                                    String categoria, int indice) {

        // Datos para generar usuarios falsos - AMPLIADOS
        String[] nombresMasculinos = {
            "Alejandro", "Carlos", "Diego", "Eduardo", "Fernando", "Gabriel", "Hugo", "Iván",
            "Javier", "Kevin", "Luis", "Miguel", "Nicolás", "Oscar", "Pablo", "Rafael",
            "Santiago", "Tomás", "Víctor", "William", "Andrés", "Daniel", "Sergio", "Ricardo",
            "Mateo", "Lucas", "Sebastián", "Martín", "Benjamín", "Samuel", "David", "Leonardo",
            "Emiliano", "Maximiliano", "Joaquín", "Manuel", "Felipe", "Rodrigo", "Jorge", "Mario",
            "Alberto", "Roberto", "Francisco", "Ignacio", "Cristian", "Camilo", "Mauricio", "Esteban"
        };

        String[] nombresFemeninos = {
            "Alejandra", "Beatriz", "Carmen", "Diana", "Elena", "Fernanda", "Gabriela", "Helena",
            "Isabel", "Julia", "Karen", "Laura", "María", "Natalia", "Olivia", "Patricia",
            "Rosa", "Sofia", "Teresa", "Valentina", "Andrea", "Carolina", "Daniela", "Marcela",
            "Emma", "Mia", "Isabella", "Camila", "Martina", "Victoria", "Lucía", "Mariana",
            "Catalina", "Paula", "Ana", "Juliana", "Sara", "Valeria", "Melissa", "Paola",
            "Tatiana", "Viviana", "Ángela", "Lorena", "Mónica", "Claudia", "Sandra", "Adriana"
        };

        String[] apellidos = {
            "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez",
            "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz",
            "Álvarez", "Romero", "Alonso", "Gutiérrez", "Navarro", "Torres", "Domínguez", "Vázquez",
            "Ramírez", "Castro", "Ortiz", "Rubio", "Molina", "Delgado", "Morales", "Suárez",
            "Blanco", "Vargas", "Medina", "Reyes", "Cruz", "Ramos", "Herrera", "Flores",
            "Aguilar", "Mendoza", "Silva", "Rivera", "Cortés", "León", "Peña", "Rojas"
        };

        // 75% de usuarios en Bogotá para maximizar matches en desarrollo
        String[][] ciudadesCol = {
            {"Colombia", "Bogotá", "Cundinamarca"},    // 75% de usuarios en Bogotá
            {"Colombia", "Bogotá", "Cundinamarca"},    // para tener muchos matches
            {"Colombia", "Bogotá", "Cundinamarca"},    // y facilitar las pruebas
            {"Colombia", "Bogotá", "Cundinamarca"},    // de matching
            {"Colombia", "Bogotá", "Cundinamarca"},    //
            {"Colombia", "Bogotá", "Cundinamarca"},    //
            {"Colombia", "Medellín", "Antioquia"},      // 12.5% Medellín
            {"Colombia", "Cali", "Valle del Cauca"}     // 12.5% Cali
        };

        // Descripciones específicas por categoría
        String[] descripcionesEssence = {
            "Me encanta viajar y conocer nuevas culturas. Busco personas auténticas para compartir aventuras.",
            "Apasionado por la música y el arte. Me gusta conversar sobre la vida y crear memorias juntos.",
            "Amo la naturaleza y los deportes al aire libre. Siempre dispuesto a nuevas experiencias con alguien especial.",
            "Foodie empedernido. Las mejores conversaciones se dan alrededor de una buena comida.",
            "Lector voraz y amante del cine. Busco conexiones profundas y relaciones significativas.",
            "Empresario en crecimiento. Balanceo trabajo y vida personal, buscando alguien que comparta mis valores.",
            "Artista en el alma, práctico en la vida. Me gusta crear e inspirar junto a mi pareja ideal.",
            "Deportista por pasión, optimista por naturaleza. Busco alguien que comparta mi energía positiva."
        };

        String[] descripcionesSpirit = {
            "Cristiano comprometido que busca una relación centrada en Dios. La fe es fundamental en mi vida.",
            "Amo servir a otros y busco alguien que comparta mi pasión por el Reino de Dios.",
            "Mi relación con Cristo es lo más importante. Busco una pareja que camine conmigo en la fe.",
            "Participo activamente en mi iglesia y busco una relación con propósito divino.",
            "Creo en el matrimonio como institución sagrada. Busco mi compañera/o de vida en Cristo.",
            "La oración y la Palabra son pilares en mi vida. Quiero compartir este camino espiritual.",
            "Busco una relación que honre a Dios en todo momento. Los valores cristianos me guían.",
            "Mi corazón está en las misiones y el servicio. Busco alguien con un corazón similar.",
            "La familia y la fe son mis prioridades. Busco construir un hogar cristiano sólido."
        };

        String[] descripcionesRouse = {
            "Orgullosamente parte de la comunidad LGBTI+. Busco conexiones auténticas y sin prejuicios.",
            "Creo en el amor sin etiquetas. Busco alguien que celebre la diversidad y la autenticidad.",
            "Activista por los derechos LGBTI+. Busco una pareja que comparta mi pasión por la igualdad.",
            "Mi identidad es parte de mi fortaleza. Busco alguien que me ame tal como soy.",
            "Arte, cultura y diversidad son mi pasión. Busco conexiones profundas en un ambiente inclusivo.",
            "Libre de ser yo mismo/a. Busco una relación honesta y sin máscaras.",
            "La comunidad LGBTI+ es mi familia. Busco expandir ese círculo de amor y aceptación.",
            "Creo en el poder transformador del amor auténtico. Busco mi persona especial."
        };

        String[] profesiones = {
            "Ingeniero de Software", "Médico General", "Abogado", "Arquitecto", "Diseñador Gráfico",
            "Contador Público", "Marketing Digital", "Psicólogo Clínico", "Periodista", "Chef Profesional",
            "Profesor de Universidad", "Enfermero Profesional", "Odontólogo", "Médico Veterinario", "Fisioterapeuta",
            "Administrador de Empresas", "Economista", "Ingeniero Civil", "Ingeniero Industrial", "Diseñador UX/UI",
            "Desarrollador Full Stack", "Analista de Datos", "Community Manager", "Fotógrafo Profesional", "Músico",
            "Artista Visual", "Publicista", "Gerente de Proyectos", "Consultor", "Terapeuta Ocupacional",
            "Nutricionista", "Personal Trainer", "Estilista", "Barista Profesional", "Emprendedor",
            "Influencer", "Productor Audiovisual", "Editor de Video", "Ingeniero de Sistemas", "Científico de Datos",
            "Diseñador de Moda", "Asistente Virtual", "Piloto Comercial", "Auxiliar de Vuelo", "Guía Turístico",
            "Traductor", "Intérprete", "Investigador", "Biólogo", "Químico Farmacéutico"
        };

        // Determinar género
        boolean esMasculino = random.nextBoolean();
        String nombre = esMasculino ?
            nombresMasculinos[random.nextInt(nombresMasculinos.length)] :
            nombresFemeninos[random.nextInt(nombresFemeninos.length)];

        String apellido = apellidos[random.nextInt(apellidos.length)];
        String email = generateEmail(nombre, apellido, random);

        // Ubicación aleatoria
        String[] ubicacion = ciudadesCol[random.nextInt(ciudadesCol.length)];

        // Fecha de nacimiento (18-45 años, concentrado en 18-40 para más matches)
        int edad;
        if (categoria.equals("ACTIVE")) {
            // 80% de usuarios activos entre 18-40, 20% entre 41-45
            edad = random.nextDouble() < 0.8 ?
                18 + random.nextInt(23) :  // 18-40 años
                41 + random.nextInt(5);    // 41-45 años
        } else {
            // Otros usuarios con rango normal pero limitado
            edad = 18 + random.nextInt(32); // 18-50 años
        }
        LocalDate fechaNacimiento = LocalDate.now().minusYears(edad)
            .minusDays(random.nextInt(365));

        // Generar email único basado en categoría e índice
        String emailPrefijo = generateEmail(nombre, apellido, random).split("@")[0];
        String emailFinal = emailPrefijo + "." + categoria.toLowerCase() + indice + "@test-feeling.com";

        // Configurar estados según la categoría
        boolean verified = !categoria.equals("UNVERIFIED");
        UserApprovalStatus userApprovalStatus;
        if (categoria.equals("ACTIVE")) {
            userApprovalStatus = UserApprovalStatus.APPROVED;
        } else if (categoria.equals("REJECTED")) {
            userApprovalStatus = UserApprovalStatus.REJECTED;
        } else {
            userApprovalStatus = UserApprovalStatus.PENDING;
        }
        boolean accountDeactivated = categoria.equals("DEACTIVATED");

        // Nota: profileComplete se calculará automáticamente por la entidad User
        // basándose en si los campos requeridos están presentes

        // Configurar visibilidad y privacidad según categoría
        boolean isActive = categoria.equals("ACTIVE");
        boolean publicAccountEnabled = isActive || random.nextDouble() < 0.7; // 100% activos, 70% otros
        boolean searchVisibilityEnabled = isActive || random.nextDouble() < 0.6; // 100% activos, 60% otros

        User.UserBuilder userBuilder = User.builder()
            .name(nombre)
            .lastName(apellido)
            .email(emailFinal)
            .password(passwordEncoder.encode("123456")) // Contraseña fija para testing
            .verified(verified)
            .userApprovalStatus(userApprovalStatus)
            .accountDeactivated(accountDeactivated)
            .userRole(clientRole)
            .userAuthProvider(AuthProvider.LOCAL)
            .createdAt(LocalDateTime.now().minusDays(random.nextInt(365)))
            .updatedAt(LocalDateTime.now())
            .dateOfBirth(fechaNacimiento)
            .country(ubicacion[0])
            .city(ubicacion[1])
            .department(ubicacion[2])
            // CAMPOS CRÍTICOS PARA APARECER EN SUGERENCIAS
            .showMeInSearch(isActive) // Solo usuarios activos aparecen en búsquedas
            .publicAccount(publicAccountEnabled) // 100% activos tienen cuenta pública
            .searchVisibility(searchVisibilityEnabled) // 100% activos tienen visibilidad de búsqueda
            .allowNotifications(random.nextDouble() < 0.8) // 80% notificaciones
            .showAge(random.nextDouble() < 0.85)
            .showLocation(random.nextDouble() < 0.9)
            .showPhone(random.nextDouble() < 0.3)
            .locationPublic(random.nextDouble() < 0.85) // 85% muestran ubicación pública
            .profileViews(random.nextLong(1000))
            .likesReceived(random.nextLong(100))
            .matchesCount(random.nextLong(50))
            .popularityScore(random.nextDouble() * 100);

        // Configurar campos según la categoría para lograr el estado deseado
        switch (categoria) {
            case "ACTIVE", "PENDING_APPROVAL", "REJECTED", "DEACTIVATED" ->
                // USUARIOS CON PERFIL COMPLETO: activos, pendientes, rechazados y desactivados
                configureCompleteProfile(userBuilder, random, profesiones, edad, categoria);
            case "INCOMPLETE_PROFILE" ->
                // PERFILES INCOMPLETOS: solo algunos campos básicos
                configureIncompleteProfile(userBuilder, random);
            case "UNVERIFIED" ->
                // NO VERIFICADOS: perfil mínimo pero completo para testing
                configureUnverifiedProfile(userBuilder, random, profesiones, edad);
        }

        User user = userBuilder.build();

        // Para usuarios desactivados, usar el método específico después de crear el usuario
        if (accountDeactivated) {
            user.deactivateAccount("Cuenta desactivada para testing");
            // Simular que fue desactivada hace algunos días (modificar directamente el campo)
            LocalDateTime fechaDesactivacion = LocalDateTime.now().minusDays(random.nextInt(30));
            user.setDeactivationDate(fechaDesactivacion);
            user.setUpdatedAt(fechaDesactivacion);
        }

        // Asignar descripción específica según la categoría después de crear el usuario
        if (user.getDescription() != null && "TEMPORAL_DESCRIPTION".equals(user.getDescription())
            && user.getCategoryInterest() != null) {
            String[] descripcionesSeleccionadas;
            UserCategoryInterestList categoria_interes = user.getCategoryInterest().getCategoryInterestEnum();

            if (categoria_interes == UserCategoryInterestList.SPIRIT) {
                descripcionesSeleccionadas = descripcionesSpirit;
            } else if (categoria_interes == UserCategoryInterestList.ROUSE) {
                descripcionesSeleccionadas = descripcionesRouse;
            } else { // ESSENCE
                descripcionesSeleccionadas = descripcionesEssence;
            }

            user.setDescription(descripcionesSeleccionadas[random.nextInt(descripcionesSeleccionadas.length)]);
        }

        // Asignar atributos según la categoría
        // Asignar categoría de interés para TODOS los usuarios (necesario para perfil completo)
        // Distribución estratégica: más usuarios SPIRIT activos
        if (!categories.isEmpty()) {
            UserCategoryInterest selectedCategory;

            // Distribución equilibrada de categorías para todos los usuarios
            // 33% ESSENCE, 33% ROUSE, 33% SPIRIT para maximizar matches dentro de cada categoría
            double random_category = random.nextDouble();
            if (random_category < 0.33) {
                // Buscar ESSENCE
                selectedCategory = categories.stream()
                    .filter(cat -> cat.getCategoryInterestEnum() == UserCategoryInterestList.ESSENCE)
                    .findFirst()
                    .orElse(categories.getFirst());
            } else if (random_category < 0.66) {
                // Buscar ROUSE
                selectedCategory = categories.stream()
                    .filter(cat -> cat.getCategoryInterestEnum() == UserCategoryInterestList.ROUSE)
                    .findFirst()
                    .orElse(categories.getFirst());
            } else {
                // Buscar SPIRIT
                selectedCategory = categories.stream()
                    .filter(cat -> cat.getCategoryInterestEnum() == UserCategoryInterestList.SPIRIT)
                    .findFirst()
                    .orElse(categories.getFirst());
            }

            user.setCategoryInterest(selectedCategory);
        }

        // Asignar atributos físicos básicos para TODOS los usuarios
        if (!genders.isEmpty()) {
            user.setGender(genders.get(random.nextInt(genders.size())));
        }

        // Para usuarios con perfil más completo, agregar más atributos
        if (!categoria.equals("INCOMPLETE_PROFILE")) {
            if (!eyeColors.isEmpty()) {
                user.setEyeColor(eyeColors.get(random.nextInt(eyeColors.size())));
            }
            if (!hairColors.isEmpty()) {
                user.setHairColor(hairColors.get(random.nextInt(hairColors.size())));
            }
            if (!bodyTypes.isEmpty()) {
                user.setBodyType(bodyTypes.get(random.nextInt(bodyTypes.size())));
            }
            // Agregar estado civil y educación para perfiles completos
            if (!maritalStatuses.isEmpty()) {
                user.setMaritalStatus(maritalStatuses.get(random.nextInt(maritalStatuses.size())));
            }
            if (!educationLevels.isEmpty()) {
                user.setEducation(educationLevels.get(random.nextInt(educationLevels.size())));
            }

            // Agregar atributos específicos según la categoría del usuario
            UserCategoryInterest userCategory = user.getCategoryInterest();
            if (userCategory != null) {
                if (userCategory.getCategoryInterestEnum() == UserCategoryInterestList.SPIRIT) {
                    // Asignar religión para usuarios SPIRIT
                    List<UserAttribute> religions = userAttributeService.findByAttributeTypeAndActiveTrue("RELIGION");
                    if (!religions.isEmpty()) {
                        // Favorecer religiones cristianas para SPIRIT
                        List<UserAttribute> christianReligions = religions.stream()
                            .filter(r -> r.getCode().contains("CHRISTIAN") || r.getCode().contains("CATHOLIC") ||
                                r.getCode().contains("PROTESTANT") || r.getCode().contains("EVANGELICAL") ||
                                r.getCode().contains("PENTECOSTAL"))
                            .toList();

                        if (!christianReligions.isEmpty()) {
                            user.setReligion(christianReligions.get(random.nextInt(christianReligions.size())));
                        } else {
                            user.setReligion(religions.get(random.nextInt(religions.size())));
                        }
                    }

                    // Asignar iglesia para algunos usuarios SPIRIT
                    if (random.nextDouble() < 0.7) { // 70% de usuarios SPIRIT tienen iglesia
                        List<UserAttribute> churches = userAttributeService.findByAttributeTypeAndActiveTrue("CHURCH");
                        if (!churches.isEmpty()) {
                            user.setChurch(churches.get(random.nextInt(churches.size())));
                        }
                    }

                    // Agregar momentos espirituales y prácticas espirituales para usuarios SPIRIT activos
                    if (categoria.equals("ACTIVE") && random.nextDouble() < 0.8) { // 80% de SPIRIT activos
                        String[] spiritualMoments = {
                            "Oración matutina diaria", "Lectura bíblica antes de dormir", "Adoración los domingos",
                            "Momentos de reflexión en la naturaleza", "Servicio comunitario mensual", "Retiros espirituales"
                        };
                        String[] spiritualPractices = {
                            "Oración personal", "Estudio bíblico", "Meditación cristiana", "Ayuno ocasional",
                            "Servicio a otros", "Participación en grupos pequeños", "Adoración musical"
                        };

                        user.setSpiritualMoments(spiritualMoments[random.nextInt(spiritualMoments.length)]);
                        user.setSpiritualPractices(spiritualPractices[random.nextInt(spiritualPractices.length)]);
                    }

                } else if (userCategory.getCategoryInterestEnum() == UserCategoryInterestList.ROUSE) {
                    // Asignar atributos específicos para usuarios ROUSE
                    List<UserAttribute> sexualRoles = userAttributeService.findByAttributeTypeAndActiveTrue("SEXUAL_ROLE");
                    if (!sexualRoles.isEmpty()) {
                        user.setSexualRole(sexualRoles.get(random.nextInt(sexualRoles.size())));
                    }

                    List<UserAttribute> relationshipTypes = userAttributeService.findByAttributeTypeAndActiveTrue("RELATIONSHIP_TYPE");
                    if (!relationshipTypes.isEmpty()) {
                        user.setRelationshipType(relationshipTypes.get(random.nextInt(relationshipTypes.size())));
                    }
                }
            }
        }

        // Asignar tags para TODOS los usuarios (necesario para perfil completo)
        assignRandomTags(user, random);

        // Imágenes de perfil - TODOS los usuarios necesitan al menos una imagen
        List<String> imagenes = new ArrayList<>();
        if (categoria.equals("INCOMPLETE_PROFILE")) {
            // Solo una imagen básica para perfiles incompletos
            imagenes.add("https://via.placeholder.com/400x400/CCCCCC/FFFFFF?text=INCOMPLETE");
        } else if (categoria.equals("UNVERIFIED")) {
            // Imagen por defecto para no verificados
            imagenes.add("https://via.placeholder.com/400x400/FFCCCC/FFFFFF?text=UNVERIFIED");
        } else {
            // Múltiples imágenes para otros usuarios
            int numImagenes = 1 + random.nextInt(3); // 1-3 imágenes
            for (int i = 0; i < numImagenes; i++) {
                imagenes.add("https://picsum.photos/400/600?random=" + (random.nextInt(10000) + i));
            }
        }
        user.setImages(imagenes);

        return user;
    }

    private String generateEmail(String nombre, String apellido, Random random) {
        String cleanName = nombre.toLowerCase()
            .replace("á", "a").replace("é", "e").replace("í", "i")
            .replace("ó", "o").replace("ú", "u");
        String cleanLastName = apellido.toLowerCase()
            .replace("á", "a").replace("é", "e").replace("í", "i")
            .replace("ó", "o").replace("ú", "u");

        String[] domains = {"gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "test.com"};
        String domain = domains[random.nextInt(domains.length)];

        String[] patterns = {
            cleanName + "." + cleanLastName,
            cleanName + cleanLastName,
            cleanName.charAt(0) + cleanLastName,
            cleanName + "." + cleanLastName + (random.nextInt(99) + 1),
            cleanName + (random.nextInt(999) + 10)
        };

        String pattern = patterns[random.nextInt(patterns.length)];
        return pattern + "@" + domain;
    }

    private String generatePhone(Random random) {
        String[] prefixes = {"301", "302", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323"};
        String prefix = prefixes[random.nextInt(prefixes.length)];
        StringBuilder number = new StringBuilder(prefix);

        for (int i = 0; i < 7; i++) {
            number.append(random.nextInt(10));
        }

        return number.toString();
    }

    private String generateDocument(Random random) {
        StringBuilder document = new StringBuilder();
        int length = 8 + random.nextInt(3); // 8-10 digits

        for (int i = 0; i < length; i++) {
            document.append(random.nextInt(10));
        }

        return document.toString();
    }

    /**
     * Asigna tags aleatorios a un usuario para completar su perfil
     * Ahora considera la categoría del usuario para asignar tags más relevantes
     */
    private void assignRandomTags(User user, Random random) {
        try {
            // Obtener todos los tags disponibles
            List<UserTag> availableTags = userTagRepository.findAll();
            if (!availableTags.isEmpty()) {
                List<UserTag> userTags = new ArrayList<>();
                int numTags = 3 + random.nextInt(3); // 3-5 tags por usuario

                // Definir tags específicos por categoría
                List<String> categorySpecificTags = new ArrayList<>();
                UserCategoryInterest userCategory = user.getCategoryInterest();

                if (userCategory != null) {
                    if (userCategory.getCategoryInterestEnum() == UserCategoryInterestList.SPIRIT) {
                        // Tags específicos para SPIRIT
                        categorySpecificTags.addAll(Arrays.asList(
                            "oración", "biblia", "iglesia", "adoración", "servicio", "misiones",
                            "grupos pequeños", "retiros", "conferencias", "música cristiana",
                            "familia", "valores", "fe", "esperanza", "caridad"
                        ));
                    } else if (userCategory.getCategoryInterestEnum() == UserCategoryInterestList.ROUSE) {
                        // Tags específicos para ROUSE
                        categorySpecificTags.addAll(Arrays.asList(
                            "diversidad", "inclusión", "arte", "cultura", "teatro", "drag",
                            "pride", "activismo", "comunidad", "autenticidad", "expresión"
                        ));
                    } else { // ESSENCE
                        // Tags más generales para ESSENCE
                        categorySpecificTags.addAll(Arrays.asList(
                            "romántico", "aventurero", "deportes", "viajes", "música", "cine",
                            "gastronomía", "fotografía", "naturaleza", "fitness", "lectura"
                        ));
                    }
                }

                // Primero, intentar asignar 2-3 tags específicos de la categoría
                int categoryTagsToAdd = Math.min(2 + random.nextInt(2), categorySpecificTags.size());
                Set<String> addedTagNames = new HashSet<>();

                for (int i = 0; i < categoryTagsToAdd; i++) {
                    String tagName = categorySpecificTags.get(random.nextInt(categorySpecificTags.size()));
                    if (!addedTagNames.contains(tagName)) {
                        UserTag tag = availableTags.stream()
                            .filter(t -> t.getName().equalsIgnoreCase(tagName))
                            .findFirst()
                            .orElse(null);

                        if (tag != null) {
                            userTags.add(tag);
                            addedTagNames.add(tagName);
                        }
                    }
                }

                // Luego, completar con tags aleatorios generales
                while (userTags.size() < numTags && userTags.size() < availableTags.size()) {
                    UserTag randomTag = availableTags.get(random.nextInt(availableTags.size()));
                    if (!userTags.contains(randomTag)) {
                        userTags.add(randomTag);
                    }
                }

                user.setTags(userTags);
            } else {
                // Si no hay tags disponibles, crear algunos básicos para este usuario
                String userEmail = user.getEmail();
                List<UserTag> basicTags = new ArrayList<>();

                String[] basicTagNames = {"música", "deportes", "viajes", "cocina", "lectura"};
                for (int i = 0; i < 3; i++) { // 3 tags básicos
                    String tagName = basicTagNames[random.nextInt(basicTagNames.length)];

                    UserTag tag = userTagRepository.findByNameIgnoreCase(tagName)
                        .orElseGet(() -> userTagRepository.save(UserTag.builder()
                            .name(tagName.toLowerCase())
                            .createdBy(userEmail)
                            .createdAt(LocalDateTime.now())
                            .usageCount(1L)
                            .lastUsed(LocalDateTime.now())
                            .build()));

                    if (!basicTags.contains(tag)) {
                        basicTags.add(tag);
                    }
                }

                user.setTags(basicTags);
            }
        } catch (Exception e) {
            logger.warn("No se pudieron asignar tags al usuario {}: {}", user.getEmail(), e.getMessage());
            // En caso de error, asignar lista vacía para evitar fallos
            user.setTags(new ArrayList<>());
        }
    }

    // ==============================
    // EVENTOS DE PRUEBA
    // ==============================
    private void initializeTestEvents() {
        logger.info("Inicializando eventos de prueba...");

        // Solo crear eventos si no existen muchos
        long eventCount = eventRepository.count();
        if (eventCount > 10) {
            logger.info("Ya existen {} eventos, saltando creación de eventos de prueba", eventCount);
            return;
        }

        try {
            // Obtener el usuario administrador para asignar como creador
            User adminUser = userRepository.findByEmail(this.adminEmail.toLowerCase().trim())
                .orElse(null);

            if (adminUser == null) {
                logger.warn("Usuario administrador no encontrado, no se pueden crear eventos de prueba");
                return;
            }

            // Crear eventos de prueba para cada categoría
            createTestEventsForCategory(EventCategory.CULTURAL, adminUser);
            createTestEventsForCategory(EventCategory.DEPORTIVO, adminUser);
            createTestEventsForCategory(EventCategory.MUSICAL, adminUser);
            createTestEventsForCategory(EventCategory.SOCIAL, adminUser);

            logger.info("Eventos de prueba creados exitosamente");

        } catch (Exception e) {
            logger.error("Error al crear eventos de prueba: {}", e.getMessage());
        }
    }

    private void createTestEventsForCategory(EventCategory category, User creator) {
        String categoryName = category.getDisplayName().toLowerCase();

        // Datos específicos para cada categoría
        String[][] eventsData = getEventsDataForCategory(category);

        // Estados para distribuir los eventos y hacer pruebas
        EventStatus[] statuses = {
            EventStatus.PUBLICADO,   // Primer evento activo
            EventStatus.EN_EDICION,  // Segundo evento en edición
            EventStatus.PAUSADO,     // Tercer evento pausado
            EventStatus.PUBLICADO,   // Cuarto evento activo
            EventStatus.CANCELADO    // Quinto evento cancelado
        };

        for (int i = 0; i < eventsData.length; i++) {
            String[] eventData = eventsData[i];
            try {
                // Verificar si el evento ya existe por título
                if (eventRepository.searchEvents(eventData[0]).isEmpty()) {
                    // Seleccionar estado según el índice
                    EventStatus status = statuses[i % statuses.length];
                    boolean isActive = status == EventStatus.PUBLICADO;

                    Event event = Event.builder()
                        .title(eventData[0])
                        .description(eventData[1])
                        .eventDate(LocalDateTime.now().plusDays(Integer.parseInt(eventData[2])))
                        .price(new BigDecimal(eventData[3]))
                        .maxCapacity(Integer.parseInt(eventData[4]))
                        .currentAttendees(Integer.parseInt(eventData[5]))
                        .category(category)
                        .status(status)
                        .mainImage(eventData[6])
                        .location(eventData[7])
                        .createdBy(creator)
                        .isActive(isActive)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                    eventRepository.save(event);
                    logger.debug("Evento {} creado: {} [Estado: {}]", categoryName, eventData[0], status);
                } else {
                    logger.debug("Evento {} ya existe: {}", categoryName, eventData[0]);
                }
            } catch (Exception e) {
                logger.error("Error al crear evento '{}': {}", eventData[0], e.getMessage());
            }
        }
    }

    /**
     * Configura los campos básicos comunes del perfil
     */
    private void configureBasicProfileFields(User.UserBuilder userBuilder, Random random, String[] profesiones, int edad) {
        // Preferencias de edad más amplias para más matches
        // 70% de usuarios con rango amplio (±15 años), 30% con rango normal (±10 años)
        int rangoMin = random.nextDouble() < 0.7 ? 15 : 10;
        int rangoMax = random.nextDouble() < 0.7 ? 20 : 15;

        userBuilder
            .phone(generatePhone(random))
            .phoneCode("+57")
            .document(generateDocument(random))
            .description("TEMPORAL_DESCRIPTION") // Se reemplazará después según la categoría
            .profession(profesiones[random.nextInt(profesiones.length)])
            .height(150 + random.nextInt(50)) // 150-200 cm
            .agePreferenceMin(Math.max(18, edad - rangoMin))
            .agePreferenceMax(Math.min(65, edad + rangoMax))
            .locationPreferenceRadius(random.nextInt(4) == 0 ? 100 : 50); // 50km mayoría, 100km algunos
    }

    /**
     * Configura campos de perfil completo para usuarios activos, pendientes, rechazados y desactivados
     */
    private void configureCompleteProfile(User.UserBuilder userBuilder, Random random, String[] profesiones, int edad, String categoria) {
        // Configurar campos básicos
        configureBasicProfileFields(userBuilder, random, profesiones, edad);

        // Agregar más variación en métricas sociales para usuarios activos
        userBuilder
            .profileViews(categoria.equals("ACTIVE") ? random.nextLong(50, 500) : random.nextLong(10, 100))
            .likesReceived(categoria.equals("ACTIVE") ? random.nextLong(10, 150) : random.nextLong(0, 30))
            .matchesCount(categoria.equals("ACTIVE") ? random.nextLong(5, 50) : random.nextLong(0, 10))
            .availableAttempts(categoria.equals("ACTIVE") ? random.nextInt(10, 30) : random.nextInt(0, 10));
    }

    /**
     * Configura perfil incompleto con solo campos básicos
     */
    private void configureIncompleteProfile(User.UserBuilder userBuilder, Random random) {
        userBuilder
            .phone(generatePhone(random))
            .phoneCode("+57");
        // Faltan: document, description, profession, height, preferences -> perfil incompleto
    }

    /**
     * Configura perfil no verificado pero con campos completos para testing
     */
    private void configureUnverifiedProfile(User.UserBuilder userBuilder, Random random, String[] profesiones, int edad) {
        // Usa la misma configuración base que los perfiles completos, sin métricas sociales mejoradas
        configureBasicProfileFields(userBuilder, random, profesiones, edad);
    }

    private String[][] getEventsDataForCategory(EventCategory category) {
        return switch (category) {
            case CULTURAL -> new String[][]{
                {"Exposición de Arte Contemporáneo", "Descubre las últimas tendencias del arte contemporáneo en esta increíble exposición. Artistas locales e internacionales muestran sus obras más innovadoras.", "15", "25000", "50", "12", "https://picsum.photos/600/400?random=1001", "Museo de Arte Moderno - Bogotá"},
                {"Teatro: Romeo y Julieta", "La clásica obra de Shakespeare interpretada por la compañía nacional de teatro. Una experiencia única e inolvidable.", "22", "45000", "200", "85", "https://picsum.photos/600/400?random=1002", "Teatro Colón - Centro de Bogotá"},
                {"Festival de Cine Independiente", "Tres días de proyecciones de películas independientes de todo el mundo. Incluye charlas con directores y actores.", "30", "35000", "150", "67", "https://picsum.photos/600/400?random=1003", "Cinemateca Distrital - Chapinero"},
                {"Taller de Escritura Creativa", "Aprende técnicas narrativas con escritores reconocidos y desarrolla tu voz literaria en un ambiente colaborativo.", "10", "18000", "40", "15", "https://picsum.photos/600/400?random=1004", "Casa Cultural el Porvenir - La Candelaria"},
                {"Recital de Poesía Urbana", "Poetas emergentes comparten versos que retratan la vida en la ciudad acompañados de música en vivo.", "8", "12000", "80", "42", "https://picsum.photos/600/400?random=1005", "Centro Cultural Gabriel García Márquez"}
            };
            case DEPORTIVO -> new String[][]{
                {"Torneo de Fútbol Amateur", "Participa en nuestro torneo de fútbol amateur. Equipos de toda la ciudad compiten por el primer lugar.", "18", "20000", "80", "24", "https://picsum.photos/600/400?random=2001", "Parque Simón Bolívar - Bogotá"},
                {"Maratón Ciudad 10K", "Únete a nuestra carrera de 10 kilómetros por los lugares más emblemáticos de la ciudad. Para todos los niveles.", "25", "15000", "300", "156", "https://picsum.photos/600/400?random=2002", "Carrera 7ma - Centro Histórico"},
                {"Clase de Yoga al Aire Libre", "Sesión de yoga en el parque principal de la ciudad. Perfecto para relajarse y conectar con la naturaleza.", "12", "12000", "30", "18", "https://picsum.photos/600/400?random=2003", "Parque Nacional - Bogotá"},
                {"Ruta de Ciclismo de Montaña", "Recorre senderos naturales con guías expertos y disfruta de un día lleno de adrenalina y naturaleza.", "21", "28000", "60", "27", "https://picsum.photos/600/400?random=2004", "Cerros Orientales - Bogotá"},
                {"Clínica de Natación", "Entrenamiento técnico con nadadores profesionales para mejorar tu estilo y resistencia.", "9", "22000", "25", "11", "https://picsum.photos/600/400?random=2005", "Complejo Acuático Simón Bolívar"}
            };
            case MUSICAL -> new String[][]{
                {"Concierto de Rock Nacional", "Los mejores exponentes del rock nacional se presentan en un solo escenario. Una noche épica de música.", "20", "55000", "500", "245", "https://picsum.photos/600/400?random=3001", "Movistar Arena - Bogotá"},
                {"Festival de Jazz", "Dos días de jazz con artistas nacionales e internacionales. Una experiencia única para los amantes de este género.", "35", "65000", "300", "134", "https://picsum.photos/600/400?random=3002", "Teatro Mayor Julio Mario Santo Domingo"},
                {"Concierto Sinfónico", "La orquesta sinfónica de la ciudad interpreta las mejores piezas clásicas. Una noche de elegancia y cultura.", "28", "40000", "250", "98", "https://picsum.photos/600/400?random=3003", "Auditorio León de Greiff - Universidad Nacional"},
                {"Noche de Salsa", "Orquestas en vivo, bailarines profesionales y clases introductorias para que disfrutes la mejor salsa.", "11", "32000", "350", "142", "https://picsum.photos/600/400?random=3004", "Salsa al Parque - Plaza de Bolívar"},
                {"Concierto Acústico Íntimo", "Cantautores independientes presentan composiciones propias en un formato íntimo y cercano.", "16", "28000", "120", "54", "https://picsum.photos/600/400?random=3005", "Auditorio Gaira Música Local"}
            };
            case SOCIAL -> new String[][]{
                {"Networking para Emprendedores", "Conecta con otros emprendedores y expande tu red de contactos. Incluye conferencias magistrales y espacios de networking.", "14", "30000", "100", "45", "https://picsum.photos/600/400?random=4001", "WeWork - Zona T, Bogotá"},
                {"Cena de Gala Benéfica", "Elegante cena a beneficio de organizaciones locales. Una noche de buena comida y mejores causas.", "40", "120000", "150", "67", "https://picsum.photos/600/400?random=4002", "Hotel Sofitel Victoria Regia - Bogotá"},
                {"Speed Dating Profesional", "Conoce personas afines en un ambiente profesional y relajado. Para profesionales de 25 a 45 años.", "17", "25000", "40", "23", "https://picsum.photos/600/400?random=4003", "Andrés Carne de Res - Zona Rosa"},
                {"Tarde de Voluntariado", "Únete a otras personas para apoyar proyectos comunitarios y generar impacto social positivo.", "6", "0", "80", "32", "https://picsum.photos/600/400?random=4004", "Fundación Corazón Solidario - Suba"},
                {"Brunch Creativo", "Encuentro informal para creativos que quieren compartir ideas mientras disfrutan de un brunch delicioso.", "13", "38000", "60", "28", "https://picsum.photos/600/400?random=4005", "Hilton Bogotá - Parque de la 93"}
            };
            default -> new String[0][0];
        };
    }
}
