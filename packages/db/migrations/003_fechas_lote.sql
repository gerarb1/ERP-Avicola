-- Apply once after 002. Does not guess dates for existing flocks.
BEGIN;
ALTER TABLE lotes_aves ADD COLUMN fecha_nacimiento date;
ALTER TABLE lotes_aves ADD COLUMN fecha_llegada date;
ALTER TABLE lotes_aves ADD CONSTRAINT lote_fechas_orden CHECK (
  (fecha_nacimiento IS NULL OR fecha_nacimiento <= fecha_ingreso)
  AND (fecha_llegada IS NULL OR fecha_llegada <= fecha_ingreso)
  AND (fecha_nacimiento IS NULL OR fecha_llegada IS NULL OR fecha_nacimiento <= fecha_llegada)
);
COMMIT;
