package com.feeling.infrastructure.logging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Factory para crear loggers estructurados con formato JSON
 * Proporciona una API consistente para logging con contexto adicional
 */
@Component
public class StructuredLoggerFactory {

    private static final ObjectMapper objectMapper = createObjectMapper();
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private static ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    /**
     * Crea un logger estructurado para una clase específica
     */
    public static StructuredLogger create(Class<?> clazz) {
        Logger logger = LoggerFactory.getLogger(clazz);
        return new StructuredLogger(logger);
    }

    /**
     * Crea un logger estructurado con un nombre específico
     */
    public static StructuredLogger create(String name) {
        Logger logger = LoggerFactory.getLogger(name);
        return new StructuredLogger(logger);
    }

    /**
     * Logger estructurado que formatea mensajes como JSON
     */
    public static class StructuredLogger {
        private final Logger logger;

        private StructuredLogger(Logger logger) {
            this.logger = logger;
        }

        // ============================
        // MÉTODOS DE LOGGING BÁSICOS
        // ============================

        public void info(String message) {
            log(LogLevel.INFO, message, null, null);
        }

        public void info(String message, Map<String, Object> context) {
            log(LogLevel.INFO, message, context, null);
        }

        public void warn(String message) {
            log(LogLevel.WARN, message, null, null);
        }

        public void warn(String message, Map<String, Object> context) {
            log(LogLevel.WARN, message, context, null);
        }

        public void error(String message) {
            log(LogLevel.ERROR, message, null, null);
        }

        public void error(String message, Throwable throwable) {
            log(LogLevel.ERROR, message, null, throwable);
        }

        public void error(String message, Map<String, Object> context) {
            log(LogLevel.ERROR, message, context, null);
        }

        public void error(String message, Map<String, Object> context, Throwable throwable) {
            log(LogLevel.ERROR, message, context, throwable);
        }

        public void debug(String message) {
            log(LogLevel.DEBUG, message, null, null);
        }

        public void debug(String message, Map<String, Object> context) {
            log(LogLevel.DEBUG, message, context, null);
        }

        // ============================
        // MÉTODOS ESPECÍFICOS PARA FEELING
        // ============================

        /**
         * Log para operaciones de autenticación
         */
        public void logAuth(String action, String userEmail, String result) {
            Map<String, Object> context = Map.of(
                "action", action,
                "userEmail", maskEmail(userEmail),
                "result", result,
                "category", "AUTHENTICATION"
            );
            info("Authentication operation", context);
        }

        /**
         * Log para operaciones de usuario
         */
        public void logUserOperation(String operation, String userEmail, Map<String, Object> details) {
            Map<String, Object> context = new HashMap<>();
            context.put("operation", operation);
            context.put("userEmail", maskEmail(userEmail));
            context.put("category", "USER_OPERATION");
            if (details != null) {
                context.putAll(details);
            }
            info("User operation", context);
        }

        /**
         * Log para matching y sugerencias
         */
        public void logMatching(String userEmail, String action, int resultCount, Map<String, Object> filters) {
            Map<String, Object> context = new HashMap<>();
            context.put("userEmail", maskEmail(userEmail));
            context.put("action", action);
            context.put("resultCount", resultCount);
            context.put("category", "MATCHING");
            if (filters != null) {
                context.put("filters", filters);
            }
            info("Matching operation", context);
        }

        /**
         * Log para operaciones de tours/booking
         */
        public void logBooking(String userEmail, String action, Long tourId, Map<String, Object> details) {
            Map<String, Object> context = new HashMap<>();
            context.put("userEmail", maskEmail(userEmail));
            context.put("action", action);
            context.put("tourId", tourId);
            context.put("category", "BOOKING");
            if (details != null) {
                context.putAll(details);
            }
            info("Booking operation", context);
        }

        /**
         * Log para errores de seguridad
         */
        public void logSecurityEvent(String event, String source, String details) {
            Map<String, Object> context = Map.of(
                "event", event,
                "source", source,
                "details", details,
                "category", "SECURITY",
                "severity", "HIGH"
            );
            warn("Security event detected", context);
        }

        /**
         * Log para métricas de performance
         */
        public void logPerformance(String operation, long durationMs, Map<String, Object> metrics) {
            Map<String, Object> context = new HashMap<>();
            context.put("operation", operation);
            context.put("durationMs", durationMs);
            context.put("category", "PERFORMANCE");
            if (metrics != null) {
                context.putAll(metrics);
            }
            
            if (durationMs > 5000) { // Más de 5 segundos es preocupante
                warn("Slow operation detected", context);
            } else {
                debug("Performance metric", context);
            }
        }

        // ============================
        // MÉTODO PRIVADO DE LOGGING
        // ============================

        private void log(LogLevel level, String message, Map<String, Object> context, Throwable throwable) {
            // Crear mensaje legible para terminal
            String readableMessage = formatReadableMessage(level, message, context, throwable);
            
            switch (level) {
                case DEBUG -> logger.debug(readableMessage);
                case INFO -> logger.info(readableMessage);
                case WARN -> logger.warn(readableMessage);
                case ERROR -> {
                    if (throwable != null) {
                        logger.error(readableMessage, throwable);
                    } else {
                        logger.error(readableMessage);
                    }
                }
            }
        }

        /**
         * Formatea mensaje legible para terminal
         */
        private String formatReadableMessage(LogLevel level, String message, Map<String, Object> context, Throwable throwable) {
            StringBuilder sb = new StringBuilder();
            
            // Mensaje principal con emoji según nivel
            String emoji = switch(level) {
                case DEBUG -> "🔍";
                case INFO -> "ℹ️";
                case WARN -> "⚠️";
                case ERROR -> "❌";
            };
            
            sb.append(emoji).append(" ").append(message);
            
            // Agregar contexto importante de forma legible
            if (context != null) {
                // Contexto HTTP
                if (context.containsKey("category")) {
                    String category = (String) context.get("category");
                    if ("HTTP_REQUEST".equals(category)) {
                        formatHttpContext(sb, context);
                    } else if ("CONTROLLER".equals(category) || "SERVICE".equals(category) || "AUTHENTICATION".equals(category)) {
                        formatMethodContext(sb, context);
                    } else if ("PERFORMANCE".equals(category)) {
                        formatPerformanceContext(sb, context);
                    } else if ("SECURITY".equals(category)) {
                        formatSecurityContext(sb, context);
                    } else {
                        formatGenericContext(sb, context);
                    }
                }
            }
            
            return sb.toString();
        }
        
        private void formatHttpContext(StringBuilder sb, Map<String, Object> context) {
            String method = (String) context.get("method");
            String uri = (String) context.get("uri");
            String phase = (String) context.get("phase");
            Object status = context.get("status");
            Object duration = context.get("duration");
            
            if ("START".equals(phase)) {
                sb.append(" 🌐 ").append(method).append(" ").append(uri);
            } else if ("END".equals(phase)) {
                sb.append(" ✅ ").append(method).append(" ").append(uri);
                if (status != null) {
                    sb.append(" [").append(status).append("]");
                }
                if (duration != null) {
                    sb.append(" (").append(duration).append("ms)");
                }
            }
        }
        
        private void formatMethodContext(StringBuilder sb, Map<String, Object> context) {
            String className = (String) context.get("class");
            String methodName = (String) context.get("method");
            String category = (String) context.get("category");
            Object duration = context.get("duration");
            
            String icon = switch(category) {
                case "CONTROLLER" -> "🎯";
                case "SERVICE" -> "⚙️";
                case "AUTHENTICATION" -> "🔐";
                default -> "📋";
            };
            
            sb.append(" ").append(icon).append(" ").append(className).append(".").append(methodName).append("()");
            
            if (duration != null) {
                sb.append(" (").append(duration).append("ms)");
            }
        }
        
        private void formatPerformanceContext(StringBuilder sb, Map<String, Object> context) {
            String operation = (String) context.get("operation");
            Object duration = context.get("durationMs");
            
            sb.append(" ⏱️ ").append(operation);
            if (duration != null) {
                sb.append(" took ").append(duration).append("ms");
            }
        }
        
        private void formatSecurityContext(StringBuilder sb, Map<String, Object> context) {
            String event = (String) context.get("event");
            String source = (String) context.get("source");
            
            sb.append(" 🛡️ ").append(event);
            if (source != null) {
                sb.append(" from ").append(source);
            }
        }
        
        private void formatGenericContext(StringBuilder sb, Map<String, Object> context) {
            // Para otros contextos, mostrar solo los campos más importantes
            if (context.containsKey("userEmail")) {
                sb.append(" 👤 ").append(context.get("userEmail"));
            }
            if (context.containsKey("operation")) {
                sb.append(" 🔧 ").append(context.get("operation"));
            }
        }

        // ============================
        // UTILIDADES PRIVADAS
        // ============================

        /**
         * Enmascara el email para proteger información personal
         */
        private String maskEmail(String email) {
            if (email == null || email.isEmpty()) {
                return "unknown";
            }
            
            int atIndex = email.indexOf('@');
            if (atIndex <= 0) {
                return "invalid-email";
            }
            
            String prefix = email.substring(0, atIndex);
            String domain = email.substring(atIndex);
            
            if (prefix.length() <= 2) {
                return "*".repeat(prefix.length()) + domain;
            } else {
                return prefix.charAt(0) + "*".repeat(prefix.length() - 2) + prefix.charAt(prefix.length() - 1) + domain;
            }
        }

        /**
         * Convierte stack trace a string
         */
        private String getStackTraceAsString(Throwable throwable) {
            if (throwable == null) return null;
            
            StringBuilder sb = new StringBuilder();
            sb.append(throwable.toString()).append("\n");
            
            for (StackTraceElement element : throwable.getStackTrace()) {
                sb.append("\tat ").append(element.toString()).append("\n");
            }
            
            if (throwable.getCause() != null) {
                sb.append("Caused by: ").append(getStackTraceAsString(throwable.getCause()));
            }
            
            return sb.toString();
        }
    }

    // ============================
    // ENUMS Y CLASES DE APOYO
    // ============================

    private enum LogLevel {
        DEBUG, INFO, WARN, ERROR
    }
}