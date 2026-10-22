-- Apply once after 001_operacion.sql. No operating data is deleted.
BEGIN;
ALTER TABLE credenciales ADD COLUMN cambiar_password boolean NOT NULL DEFAULT false;
ALTER TABLE credenciales ADD COLUMN recuperacion_hash varchar(64);
ALTER TABLE lotes_aves ADD COLUMN edad_confirmada boolean NOT NULL DEFAULT false;
ALTER TABLE lotes_aves ADD COLUMN racion_g integer;
ALTER TABLE produccion_diaria ALTER COLUMN kg_alimento DROP NOT NULL;
ALTER TABLE produccion_diaria ADD COLUMN kg_planificado numeric(10,2);
ALTER TABLE produccion_diaria ADD COLUMN agua_planificada_l numeric(10,2);
COMMIT;
