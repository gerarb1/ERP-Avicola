-- Upgrade from MVP schema. Apply once, after backup, in a transaction.
-- Historical census and water stay NULL: never invent measurements.
BEGIN;
CREATE TABLE "credenciales" (
	"usuario_id" uuid PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"salt" text NOT NULL
);

CREATE TABLE "insumos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(150) NOT NULL,
	"tipo" varchar(30) NOT NULL,
	"unidad" varchar(20) NOT NULL,
	"stock" numeric(12, 3) DEFAULT '0' NOT NULL,
	"kg_bolsa" numeric(8, 3) DEFAULT '44' NOT NULL,
	CONSTRAINT "insumos_nombre_unique" UNIQUE("nombre")
);

CREATE TABLE "intentos_login" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"intentos" integer DEFAULT 0 NOT NULL,
	"desde" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lecturas_notificaciones" (
	"clave" varchar(200) PRIMARY KEY NOT NULL,
	"usuario_id" uuid NOT NULL,
	"leida_en" timestamp DEFAULT now()
);

CREATE TABLE "movimientos_insumos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insumo_id" uuid NOT NULL,
	"lote_id" uuid,
	"fecha" date NOT NULL,
	"tipo" varchar(15) NOT NULL,
	"cantidad" numeric(12, 3) NOT NULL,
	"costo_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"motivo" text NOT NULL,
	"vencimiento" date,
	"registrado_por" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "sesiones" (
	"hash" varchar(64) PRIMARY KEY NOT NULL,
	"usuario_id" uuid NOT NULL,
	"vence" timestamp with time zone NOT NULL
);

CREATE TABLE "sucesos_galpon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lote_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"tipo" varchar(30) NOT NULL,
	"descripcion" text NOT NULL,
	"producto" varchar(150),
	"dosis" varchar(100),
	"proxima_fecha" date,
	"registrado_por" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "produccion_diaria" ADD COLUMN "aves_vivas" integer;

ALTER TABLE "produccion_diaria" ADD COLUMN "huevos_rotos" integer DEFAULT 0 NOT NULL;

ALTER TABLE "produccion_diaria" ADD COLUMN "agua_l" numeric(10, 2);

ALTER TABLE "produccion_diaria" ADD COLUMN "tipo_alimento" varchar(100);

ALTER TABLE "produccion_diaria" ADD COLUMN "observaciones" text;

ALTER TABLE "notas_remision" ADD COLUMN "destino" varchar(250);

ALTER TABLE "credenciales" ADD CONSTRAINT "credenciales_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "lecturas_notificaciones" ADD CONSTRAINT "lecturas_notificaciones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "movimientos_insumos" ADD CONSTRAINT "movimientos_insumos_insumo_id_insumos_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."insumos"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "movimientos_insumos" ADD CONSTRAINT "movimientos_insumos_lote_id_lotes_aves_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lotes_aves"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "movimientos_insumos" ADD CONSTRAINT "movimientos_insumos_registrado_por_usuarios_id_fk" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sucesos_galpon" ADD CONSTRAINT "sucesos_galpon_lote_id_lotes_aves_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lotes_aves"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sucesos_galpon" ADD CONSTRAINT "sucesos_galpon_registrado_por_usuarios_id_fk" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
COMMIT;
