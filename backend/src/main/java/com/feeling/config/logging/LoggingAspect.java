package com.feeling.config.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Aspecto para logging automático de métodos críticos
 * Captura automáticamente performance y errores en servicios y controladores
 */
@Aspect
@Component
public class LoggingAspect {

    private static final StructuredLoggerFactory.StructuredLogger logger = 
            StructuredLoggerFactory.create(LoggingAspect.class);

    /**
     * Intercepta métodos de controladores para logging automático
     */
    @Around("execution(* com.feeling.packages.*.application.controllers..*.*(..))")
    public Object logControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "CONTROLLER");
    }

    /**
     * Intercepta métodos de servicios para logging automático
     */
    @Around("execution(* com.feeling.packages.*.domain.services..*.*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "SERVICE");
    }

    /**
     * Intercepta métodos de autenticación para logging especial
     */
    @Around("execution(* com.feeling.packages.auth.domain.services..*.*(..))")
    public Object logAuthMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "AUTHENTICATION");
    }

    /**
     * Método genérico para logging de ejecución de métodos
     * Solo loggea operaciones lentas (>100ms) o con errores para reducir ruido
     */
    private Object logMethodExecution(ProceedingJoinPoint joinPoint, String category) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String fullMethodName = className + "." + methodName;

        long startMillis = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();

            // Calcular duración
            long duration = System.currentTimeMillis() - startMillis;

            // Solo loggear operaciones lentas (>100ms)
            if (duration > 100) {
                Map<String, Object> context = new HashMap<>();
                context.put("method", fullMethodName);
                context.put("category", category);
                context.put("duration", duration + "ms");
                context.put("status", "OK");

                if (duration > 1000) {
                    logger.warn("Slow operation detected", context);
                } else {
                    logger.info("Operation completed", context);
                }
            }

            return result;

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startMillis;

            Map<String, Object> errorContext = new HashMap<>();
            errorContext.put("method", fullMethodName);
            errorContext.put("category", category);
            errorContext.put("duration", duration + "ms");
            errorContext.put("error", e.getClass().getSimpleName());
            errorContext.put("message", e.getMessage());

            // Siempre loggear errores
            logger.error("Method execution failed", errorContext, e);

            throw e;
        }
    }

    /**
     * Intercepta métodos específicos de seguridad para logging especial
     */
    @Around("execution(* com.feeling.config.JwtAuthFilter.*(..)) || " +
            "execution(* com.feeling.packages.auth.domain.services.security.*.*(..)) || " +
            "execution(* com.feeling.packages.*.infrastructure.validators.*.*(..)) ||" +
            "execution(* com.feeling.packages.auth.domain.services.*.*(..)) && " +
            "args(*, String, ..) && args(password, ..)")
    public Object logSecurityMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        
        Map<String, Object> context = new HashMap<>();
        context.put("class", className);
        context.put("method", methodName);
        context.put("category", "SECURITY");
        context.put("sensitiveOperation", true);
        
        long startMillis = System.currentTimeMillis();
        
        try {
            logger.debug("Security operation started", context);
            
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - startMillis;
            context.put("duration", duration);
            context.put("status", "SUCCESS");
            
            logger.info("Security operation completed", context);
            
            return result;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startMillis;
            context.put("duration", duration);
            context.put("status", "FAILED");
            context.put("exceptionType", e.getClass().getSimpleName());
            
            // Log de seguridad con nivel alto de importancia
            logger.logSecurityEvent(
                "Security operation failed", 
                className + "." + methodName,
                "Exception: " + e.getClass().getSimpleName() + " - " + e.getMessage()
            );
            
            logger.error("Security method execution failed", context, e);
            
            throw e;
        }
    }
}