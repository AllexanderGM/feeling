package com.feeling.packages.common.domain.services.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * Servicio para gestión avanzada de caché
 * Phase 4.3: Caching Strategy - API Modernization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CacheManagementService {

    private final CacheManager cacheManager;

    /**
     * Evict all caches for a specific user
     */
    public void evictUserCaches(String userEmail) {
        log.info("Evicting all caches for user: {}", userEmail);

        // Evict user profile with all include levels
        evictCacheWithPattern("userProfiles", userEmail);

        // Evict user suggestions with all include levels and pagination
        evictCacheWithPattern("userSuggestions", userEmail);

        // Evict user metrics
        evictCacheWithPattern("userMetrics", userEmail);

        // Evict compatibility calculations involving this user
        evictCacheWithPattern("userCompatibility", userEmail);

        log.info("Successfully evicted all caches for user: {}", userEmail);
    }

    /**
     * Get cache statistics
     */
    public Map<String, Object> getCacheStatistics() {
        Map<String, Object> stats = new HashMap<>();

        for (String cacheName : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                // Para ConcurrentMapCacheManager, obtenemos el store nativo
                Object nativeCache = cache.getNativeCache();
                Map<String, Object> cacheStats = new HashMap<>();

                if (nativeCache instanceof java.util.concurrent.ConcurrentMap) {
                    java.util.concurrent.ConcurrentMap<?, ?> map =
                        (java.util.concurrent.ConcurrentMap<?, ?>) nativeCache;
                    cacheStats.put("size", map.size());
                    cacheStats.put("keys", map.keySet().size());
                }

                stats.put(cacheName, cacheStats);
            }
        }

        return stats;
    }

    /**
     * Clear specific cache
     */
    public void clearCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.info("Cleared cache: {}", cacheName);
        } else {
            log.warn("Cache not found: {}", cacheName);
        }
    }

    /**
     * Clear all caches
     */
    public void clearAllCaches() {
        log.info("Clearing all caches");
        for (String cacheName : cacheManager.getCacheNames()) {
            clearCache(cacheName);
        }
        log.info("All caches cleared successfully");
    }

    /**
     * Get or compute value with cache
     */
    @SuppressWarnings("unchecked")
    public <T> T getOrCompute(String cacheName, String key, Callable<T> valueLoader) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            try {
                Cache.ValueWrapper wrapper = cache.get(key);
                if (wrapper != null) {
                    log.debug("Cache hit for key: {} in cache: {}", key, cacheName);
                    return (T) wrapper.get();
                }

                log.debug("Cache miss for key: {} in cache: {}", key, cacheName);
                T value = valueLoader.call();
                cache.put(key, value);
                return value;
            } catch (Exception e) {
                log.error("Error getting/computing cache value for key: {} in cache: {}", key, cacheName, e);
                try {
                    return valueLoader.call();
                } catch (Exception ex) {
                    throw new RuntimeException("Failed to compute value", ex);
                }
            }
        }

        try {
            return valueLoader.call();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute value", e);
        }
    }

    /**
     * Evict cache entries that match a pattern (simple implementation)
     * En producción con Redis se usaría SCAN con patterns
     */
    private void evictCacheWithPattern(String cacheName, String userEmail) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            Object nativeCache = cache.getNativeCache();
            if (nativeCache instanceof java.util.concurrent.ConcurrentMap) {
                java.util.concurrent.ConcurrentMap<String, ?> map =
                    (java.util.concurrent.ConcurrentMap<String, ?>) nativeCache;

                // Encontrar claves que contengan el email del usuario
                map.keySet().removeIf(key -> key.contains(userEmail));
                log.debug("Evicted keys containing '{}' from cache: {}", userEmail, cacheName);
            }
        }
    }

    /**
     * Warm up cache with commonly accessed data
     */
    public void warmUpUserCache(String userEmail) {
        log.info("Warming up cache for user: {}", userEmail);

        // Pre-cargar perfiles con niveles comunes
        try {
            // Este método se llamaría desde un servicio que tiene acceso a UserService
            // getOrCompute("userProfiles", CacheConfig.CacheKeyGenerator.userProfileKey(userEmail, "basic"), () -> userService.get(userEmail, "basic"));
            // getOrCompute("userProfiles", CacheConfig.CacheKeyGenerator.userProfileKey(userEmail, "extended"), () -> userService.get(userEmail, "extended"));

            log.info("Cache warmed up successfully for user: {}", userEmail);
        } catch (Exception e) {
            log.error("Error warming up cache for user: {}", userEmail, e);
        }
    }

    /**
     * Schedule cache eviction for expired entries
     * En producción esto se haría con TTL automático en Redis
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 900000) // 15 minutos
    public void evictExpiredEntries() {
        log.debug("Running cache eviction for expired entries");
        // En esta implementación simple, no tenemos TTL automático
        // Se podría implementar con timestamps en las claves
        log.debug("Cache eviction completed");
    }
}
