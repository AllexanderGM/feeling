-- Añadir columnas faltantes para OAuth sync tracking
-- Solo añadir si no existen (verificar antes de ejecutar)

-- Columna para ID externo del proveedor OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) NULL;

-- Columna para URL del avatar del proveedor externo
ALTER TABLE users ADD COLUMN IF NOT EXISTS external_avatar_url TEXT NULL;

-- Columna para fecha de última sincronización
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_external_sync TIMESTAMP NULL;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN users.external_id IS 'ID único del usuario en el proveedor externo (Google ID, Facebook ID, etc.)';
COMMENT ON COLUMN users.external_avatar_url IS 'URL del avatar proporcionado por el proveedor externo';
COMMENT ON COLUMN users.last_external_sync IS 'Fecha de la última sincronización con el proveedor externo OAuth';