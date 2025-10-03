package com.feeling.domain.dto.views;

/**
 * Clases de vistas JSON para controlar qué campos se serializan
 * Phase 2.3: JsonViews Implementation
 */
public class UserViews {

    /**
     * Vista pública - Para usuarios no autenticados o perfiles públicos
     * Solo campos básicos y seguros
     */
    public static class Public {}

    /**
     * Vista estándar - Para usuarios autenticados viendo otros perfiles
     * Incluye información de perfil completa pero sin datos sensibles
     */
    public static class Standard {}

    /**
     * Vista interna - Para el propio usuario viendo su perfil
     * Incluye todos los datos incluyendo configuraciones privadas
     */
    public static class Internal {}

    /**
     * Vista de administrador - Para operaciones de administración
     * Incluye todos los campos incluyendo IDs y datos de gestión
     */
    public static class Admin {}

    /**
     * Vista de sugerencias - Para matching y sugerencias
     * Perfil optimizado sin datos sensibles como teléfono
     */
    public static class Suggestions {}

    /**
     * Vista de matching - Para usuarios que han hecho match
     * Incluye información de contacto
     */
    public static class Matched {}

    /**
     * Vista básica - Solo información esencial para listas
     * Nombre, imagen, información básica
     */
    public static class Basic {}

    /**
     * Vista de métricas - Para dashboards y estadísticas
     * Solo datos numéricos y métricas
     */
    public static class Metrics {}
}