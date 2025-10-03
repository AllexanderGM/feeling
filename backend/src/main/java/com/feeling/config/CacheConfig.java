package com.feeling.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de caché para respuestas de usuario
 * Phase 4.3: Caching Strategy - API Modernization
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Cache manager usando memoria local (para desarrollo/pruebas)
     * En producción se recomiendan Redis o Hazelcast
     */
    @Bean
    public CacheManager cacheManager() {
        // Inicializar con nombres de caché predefinidos
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
                "userProfiles",          // Perfiles de usuario con diferentes niveles
                "userSuggestions",       // Sugerencias de usuarios
                "userCompatibility",     // Cálculos de compatibilidad
                "userMetrics"           // Métricas de usuario
        );

        // Permitir creación dinámica de cachés adicionales
        cacheManager.setAllowNullValues(false);

        return cacheManager;
    }

    /**
     * Configuración de TTL para diferentes tipos de datos
     * Esta configuración es básica - en producción usar Redis con TTL específicos
     */
    public static class CacheTTL {
        public static final int USER_PROFILE_TTL_MINUTES = 15;      // Perfiles de usuario
        public static final int USER_SUGGESTIONS_TTL_MINUTES = 60;  // Sugerencias
        public static final int USER_COMPATIBILITY_TTL_HOURS = 24;  // Compatibilidad
        public static final int USER_METRICS_TTL_MINUTES = 30;      // Métricas
    }

    /**
     * Generador de claves de cache consistente
     */
    public static class CacheKeyGenerator {

        public static String userProfileKey(String email, String includeLevel) {
            return String.format("user_profile_%s_%s", email, includeLevel);
        }

        public static String userSuggestionsKey(String email, String includeLevel, int page, int size) {
            return String.format("user_suggestions_%s_%s_%d_%d", email, includeLevel, page, size);
        }

        public static String userCompatibilityKey(String email1, String email2) {
            // Ordenar emails para evitar duplicados por orden diferente
            String first = email1.compareTo(email2) < 0 ? email1 : email2;
            String second = email1.compareTo(email2) < 0 ? email2 : email1;
            return String.format("user_compatibility_%s_%s", first, second);
        }

        public static String userMetricsKey(String email) {
            return String.format("user_metrics_%s", email);
        }

        /**
         * Genera patrón para eviction masiva por usuario
         */
        public static String userEvictionPattern(String email) {
            return String.format("*_%s_*", email);
        }
    }
}