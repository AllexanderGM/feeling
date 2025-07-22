package com.feeling.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final ConcurrentHashMap<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> apiBuckets = new ConcurrentHashMap<>();

    // Rate limits para autenticación: 5 intentos por minuto por IP
    private final Bandwidth authBandwidth = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
    
    // Rate limits para API general: 100 requests por minuto por IP
    private final Bandwidth apiBandwidth = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));

    /**
     * Verifica si una IP puede realizar una acción de autenticación
     * @param ip Dirección IP del cliente
     * @return true si puede proceder, false si ha excedido el límite
     */
    public boolean allowAuthAction(String ip) {
        return getAuthBucket(ip).tryConsume(1);
    }

    /**
     * Verifica si una IP puede realizar una petición general a la API
     * @param ip Dirección IP del cliente
     * @return true si puede proceder, false si ha excedido el límite
     */
    public boolean allowApiAction(String ip) {
        return getApiBucket(ip).tryConsume(1);
    }

    /**
     * Obtiene el número de tokens disponibles para autenticación
     * @param ip Dirección IP del cliente
     * @return Número de intentos restantes
     */
    public long getAuthTokensRemaining(String ip) {
        return getAuthBucket(ip).getAvailableTokens();
    }

    /**
     * Obtiene el número de tokens disponibles para API general
     * @param ip Dirección IP del cliente
     * @return Número de requests restantes
     */
    public long getApiTokensRemaining(String ip) {
        return getApiBucket(ip).getAvailableTokens();
    }

    /**
     * Limpia buckets antiguos para evitar memory leaks
     * Ejecutado cada hora
     */
    @Scheduled(fixedRate = 3600000) // 1 hora
    public void cleanupOldBuckets() {
        // Limpiar buckets que no se han usado recientemente
        authBuckets.entrySet().removeIf(entry -> 
            entry.getValue().getAvailableTokens() == authBandwidth.getCapacity());
        
        apiBuckets.entrySet().removeIf(entry -> 
            entry.getValue().getAvailableTokens() == apiBandwidth.getCapacity());
    }

    private Bucket getAuthBucket(String ip) {
        return authBuckets.computeIfAbsent(ip, this::createAuthBucket);
    }

    private Bucket getApiBucket(String ip) {
        return apiBuckets.computeIfAbsent(ip, this::createApiBucket);
    }

    private Bucket createAuthBucket(String ip) {
        return Bucket.builder()
                .addLimit(authBandwidth)
                .build();
    }

    private Bucket createApiBucket(String ip) {
        return Bucket.builder()
                .addLimit(apiBandwidth)
                .build();
    }
}