package com.feeling.packages.auth.domain.dto.views;

/**
 * Vistas JSON específicos del dominio de autenticación.
 *
 * <p>Separadas por contexto para evitar acoplamientos con otros bounded contexts.
 */
public final class AuthViews {

    private AuthViews() {
        // Utility class
    }

    /**
     * Vistas enfocadas en la sesión de usuario (login, refresh, sesión activa).
     */
    public static final class Session {
        private Session() {
        }

        public static class Basic {
        }

        public static class Extended extends Basic {
        }

        public static class Full extends Extended {
        }
    }

    /**
     * Vistas relacionadas con verificación de email, disponibilidad y estados.
     */
    public static final class Verification {
        private Verification() {
        }

        public static class Basic {
        }

        public static class Extended extends Basic {
        }
    }

    /**
     * Vistas para las operaciones de gestión de contraseñas.
     */
    public static final class Password {
        private Password() {
        }

        public static class Basic {
        }
    }
}
