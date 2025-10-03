-- Agregar columna location a la tabla events
ALTER TABLE events ADD COLUMN location VARCHAR(300) NOT NULL DEFAULT 'Ubicación por definir';

-- Quitar el valor por defecto después de agregar la columna
ALTER TABLE events ALTER COLUMN location DROP DEFAULT;

-- Agregar comentario a la columna
COMMENT ON COLUMN events.location IS 'Ubicación donde se realizará el evento';