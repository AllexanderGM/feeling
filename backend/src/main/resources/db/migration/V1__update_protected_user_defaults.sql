-- Migración para establecer valores por defecto para el campo protected_user
-- Actualizar todos los usuarios existentes con protected_user NULL a false
UPDATE users 
SET protected_user = false 
WHERE protected_user IS NULL;

-- Establecer valor por defecto para la columna
ALTER TABLE users 
ALTER COLUMN protected_user SET DEFAULT false;