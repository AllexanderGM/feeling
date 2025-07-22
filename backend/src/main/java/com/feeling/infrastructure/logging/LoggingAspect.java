package com.feeling.infrastructure.logging;

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
    @Around("execution(* com.feeling.application.controllers..*.*(..))")
    public Object logControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "CONTROLLER");
    }

    /**
     * Intercepta métodos de servicios para logging automático
     */
    @Around("execution(* com.feeling.domain.services..*.*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "SERVICE");
    }

    /**
     * Intercepta métodos de autenticación para logging especial
     */
    @Around("execution(* com.feeling.domain.services.auth..*.*(..))")
    public Object logAuthMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "AUTHENTICATION");
    }

    /**
     * Método genérico para logging de ejecución de métodos
     */
    private Object logMethodExecution(ProceedingJoinPoint joinPoint, String category) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String fullMethodName = className + "." + methodName;
        
        LocalDateTime startTime = LocalDateTime.now();
        long startMillis = System.currentTimeMillis();
        
        Map<String, Object> context = new HashMap<>();
        context.put("class", className);
        context.put("method", methodName);
        context.put("category", category);
        context.put("startTime", startTime);
        
        // Agregar información de argumentos (sin datos sensibles)
        Object[] args = joinPoint.getArgs();
        if (args != null && args.length > 0) {
            context.put("argumentCount", args.length);
            
            // Log de tipos de argumentos (sin valores para evitar exposición de datos)
            StringBuilder argTypes = new StringBuilder();
            for (int i = 0; i < args.length; i++) {
                if (i > 0) argTypes.append(", ");
                if (args[i] != null) {
                    argTypes.append(args[i].getClass().getSimpleName());
                } else {
                    argTypes.append("null");
                }
            }
            context.put("argumentTypes", argTypes.toString());
        }

        try {
            logger.debug("Method execution started", context);
            
            Object result = joinPoint.proceed();
            
            // Calcular duración
            long duration = System.currentTimeMillis() - startMillis;
            
            Map<String, Object> successContext = new HashMap<>(context);
            successContext.put("duration", duration);
            successContext.put("status", "SUCCESS");
            
            if (result != null) {
                successContext.put("resultType", result.getClass().getSimpleName());
            }
            
            // Log específico para operaciones lentas
            logger.logPerformance(fullMethodName, duration, successContext);
            
            if (duration < 1000) {
                logger.debug("Method execution completed", successContext);
            } else {
                logger.info("Method execution completed", successContext);
            }
            
            return result;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startMillis;
            
            Map<String, Object> errorContext = new HashMap<>(context);
            errorContext.put("duration", duration);
            errorContext.put("status", "ERROR");
            errorContext.put("exceptionType", e.getClass().getSimpleName());
            
            // Log del error con contexto completo
            logger.error("Method execution failed", errorContext, e);
            
            // Re-lanzar la excepción para no interferir con el flujo normal
            throw e;
        }
    }

    /**
     * Intercepta métodos específicos de seguridad para logging especial
     */
    @Around("execution(* com.feeling.config.JwtAuthFilter.*(..)) || " +
            "execution(* com.feeling.domain.services.security.*.*(..)) || " +
            "execution(* com.feeling.infrastructure.validators.*.*(..)) ||" +
            "execution(* com.feeling.domain.services.auth.*.*(..)) && " +
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