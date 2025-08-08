-- V2__update_user_approval_status.sql
-- Migración para convertir el campo boolean 'approved' a enum 'approval_status'

-- 1. Agregar la nueva columna approval_status
ALTER TABLE users ADD COLUMN approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- 2. Actualizar los datos existentes basándose en el campo approved
UPDATE users SET approval_status = 'APPROVED' WHERE approved = true;
UPDATE users SET approval_status = 'PENDING' WHERE approved = false;

-- 3. Eliminar el campo approved (opcional, se puede mantener para compatibilidad temporal)
-- ALTER TABLE users DROP COLUMN approved;

-- Nota: Si decides mantener el campo approved temporalmente para compatibilidad,
-- asegúrate de eliminar esta línea después de confirmar que todo funciona correctamente.