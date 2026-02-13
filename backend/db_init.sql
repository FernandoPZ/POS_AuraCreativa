\restrict Yy6dbFY9iY6Gxe0TPe02KxotOiy58wKCYRyorvgQGqAeEfim5gcQGZfkgVz6zvO

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER SCHEMA public OWNER TO postgres;

COMMENT ON SCHEMA public IS '';

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public."Articulos" (
    "IdArticulo" integer CONSTRAINT "Articulos_IdArticulo_not_null1" NOT NULL,
    "CodArticulo" character varying(50) CONSTRAINT "Articulos_CodArticulo_not_null1" NOT NULL,
    "NomArticulo" character varying(150) CONSTRAINT "Articulos_NomArticulo_not_null1" NOT NULL,
    "DetallesTecnicos" text,
    "Categoria" character varying(50) DEFAULT 'GENERAL'::character varying,
    "PrecioVenta" numeric(10,2) DEFAULT 0 CONSTRAINT "Articulos_PrecioVenta_not_null1" NOT NULL,
    "CostoPromedio" numeric(10,2) DEFAULT 0,
    "NombreUnidad" character varying(20) DEFAULT 'Pza'::character varying,
    "StockActual" integer DEFAULT 0,
    "Talla" character varying(10),
    "Color" character varying(30),
    "IdProveedor" integer,
    "IdCfgStock" integer,
    "FechaCreacion" timestamp without time zone DEFAULT now(),
    "FechaModificacion" timestamp without time zone,
    "IdUsuarioCreacion" integer,
    "Activo" boolean DEFAULT true,
    "Imagen" character varying(255)
);

ALTER TABLE public."Articulos" OWNER TO postgres;

CREATE SEQUENCE public."Articulos_IdArticulo_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Articulos_IdArticulo_seq1" OWNER TO postgres;

ALTER SEQUENCE public."Articulos_IdArticulo_seq1" OWNED BY public."Articulos"."IdArticulo";

CREATE TABLE public."CfgStock" (
    "IdCfgStock" integer NOT NULL,
    "CantidadMaxima" integer NOT NULL,
    "CantidadMinima" integer NOT NULL,
    "FechaAlta" timestamp without time zone DEFAULT now(),
    "Activo" boolean DEFAULT true
);

ALTER TABLE public."CfgStock" OWNER TO postgres;

CREATE SEQUENCE public."CfgStock_IdCfgStock_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."CfgStock_IdCfgStock_seq" OWNER TO postgres;

ALTER SEQUENCE public."CfgStock_IdCfgStock_seq" OWNED BY public."CfgStock"."IdCfgStock";

CREATE TABLE public."Combos" (
    "IdCombo" integer NOT NULL,
    "Nombre" character varying(100) NOT NULL,
    "Codigo" character varying(50),
    "Precio" numeric(10,2) NOT NULL,
    "Imagen" text,
    "FechaCreacion" timestamp without time zone DEFAULT now(),
    "IdUsuarioCreacion" integer,
    "Activo" boolean DEFAULT true
);

ALTER TABLE public."Combos" OWNER TO postgres;

CREATE SEQUENCE public."Combos_IdCombo_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Combos_IdCombo_seq" OWNER TO postgres;

ALTER SEQUENCE public."Combos_IdCombo_seq" OWNED BY public."Combos"."IdCombo";

CREATE TABLE public."Configuracion" (
    "IdConfig" integer NOT NULL,
    "NombreTienda" text DEFAULT 'Mi Tienda'::text,
    "Direccion" text,
    "Telefono" text,
    "MensajeTicket" text DEFAULT '¡Gracias por su compra!'::text,
    "RedSocial" text,
    "LogoUrl" text
);

ALTER TABLE public."Configuracion" OWNER TO postgres;

CREATE SEQUENCE public."Configuracion_IdConfig_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Configuracion_IdConfig_seq" OWNER TO postgres;

ALTER SEQUENCE public."Configuracion_IdConfig_seq" OWNED BY public."Configuracion"."IdConfig";

CREATE TABLE public."DetalleCombos" (
    "IdDetalleCombo" integer NOT NULL,
    "IdCombo" integer,
    "IdArticulo" integer,
    "Cantidad" integer DEFAULT 1 NOT NULL
);

ALTER TABLE public."DetalleCombos" OWNER TO postgres;

CREATE SEQUENCE public."DetalleCombos_IdDetalleCombo_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."DetalleCombos_IdDetalleCombo_seq" OWNER TO postgres;

ALTER SEQUENCE public."DetalleCombos_IdDetalleCombo_seq" OWNED BY public."DetalleCombos"."IdDetalleCombo";

CREATE TABLE public."DetalleEntradas" (
    "IdDetalleEntrada" integer NOT NULL,
    "IdEntrada" integer,
    "IdArticulo" integer,
    "Cantidad" integer NOT NULL,
    "CostoUnitario" numeric(10,2) NOT NULL,
    "Subtotal" numeric(10,2) NOT NULL
);

ALTER TABLE public."DetalleEntradas" OWNER TO postgres;

CREATE SEQUENCE public."DetalleEntradas_IdDetalleEntrada_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."DetalleEntradas_IdDetalleEntrada_seq" OWNER TO postgres;

ALTER SEQUENCE public."DetalleEntradas_IdDetalleEntrada_seq" OWNED BY public."DetalleEntradas"."IdDetalleEntrada";

CREATE TABLE public."DetalleVentas" (
    "IdDetalle" integer NOT NULL,
    "IdVenta" integer,
    "IdArticulo" integer,
    "IdCombo" integer,
    "Cantidad" integer NOT NULL,
    "PrecioUnitario" numeric(10,2) NOT NULL,
    "Subtotal" numeric(10,2) NOT NULL
);

ALTER TABLE public."DetalleVentas" OWNER TO postgres;

CREATE SEQUENCE public."DetalleVentas_IdDetalle_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."DetalleVentas_IdDetalle_seq" OWNER TO postgres;

ALTER SEQUENCE public."DetalleVentas_IdDetalle_seq" OWNED BY public."DetalleVentas"."IdDetalle";

CREATE TABLE public."Entradas" (
    "IdEntrada" integer NOT NULL,
    "IdProveedor" integer,
    "Fecha" timestamp without time zone DEFAULT now(),
    "Total" numeric(10,2) NOT NULL,
    "Comentarios" text,
    "IdUsuarioCreacion" integer
);

ALTER TABLE public."Entradas" OWNER TO postgres;

CREATE SEQUENCE public."Entradas_IdEntrada_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Entradas_IdEntrada_seq" OWNER TO postgres;

ALTER SEQUENCE public."Entradas_IdEntrada_seq" OWNED BY public."Entradas"."IdEntrada";

CREATE TABLE public."Proveedores" (
    "IdProveedor" integer CONSTRAINT "Proveedores_IdProveedor_not_null1" NOT NULL,
    "NomProveedor" character varying(100) CONSTRAINT "Proveedores_NomProveedor_not_null1" NOT NULL,
    "RFC" character varying(20),
    "Direccion" text,
    "Telefono" character varying(50),
    "Email" character varying(100),
    "NombreContacto" character varying(100),
    "FechaCreacion" timestamp without time zone DEFAULT now(),
    "FechaModificacion" timestamp without time zone,
    "IdUsuarioCreacion" integer,
    "Activo" boolean DEFAULT true
);

ALTER TABLE public."Proveedores" OWNER TO postgres;

CREATE SEQUENCE public."Proveedores_IdProveedor_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Proveedores_IdProveedor_seq1" OWNER TO postgres;

ALTER SEQUENCE public."Proveedores_IdProveedor_seq1" OWNED BY public."Proveedores"."IdProveedor";

CREATE TABLE public."PuntosEntrega" (
    "IdPunto" integer NOT NULL,
    "NombrePunto" text NOT NULL,
    "LinkGoogleMaps" text NOT NULL,
    "Activo" boolean DEFAULT true
);

ALTER TABLE public."PuntosEntrega" OWNER TO postgres;

CREATE SEQUENCE public."PuntosEntrega_IdPunto_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."PuntosEntrega_IdPunto_seq" OWNER TO postgres;

ALTER SEQUENCE public."PuntosEntrega_IdPunto_seq" OWNED BY public."PuntosEntrega"."IdPunto";

CREATE TABLE public."Salidas" (
    "IdSalida" integer NOT NULL,
    "IdArticulo" integer NOT NULL,
    "Cantidad" integer NOT NULL,
    "Comentarios" text,
    "FechaMovimiento" timestamp without time zone DEFAULT now(),
    "Activo" boolean DEFAULT true
);

ALTER TABLE public."Salidas" OWNER TO postgres;

CREATE SEQUENCE public."Salidas_IdSalida_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Salidas_IdSalida_seq" OWNER TO postgres;

ALTER SEQUENCE public."Salidas_IdSalida_seq" OWNED BY public."Salidas"."IdSalida";

CREATE TABLE public."Usuario" (
    "IdUsuario" integer NOT NULL,
    "Nombre" character varying(100) NOT NULL,
    "Email" character varying(100) NOT NULL,
    "PasswordHash" character varying(255) NOT NULL,
    "Rol" character varying(50) DEFAULT 'User'::character varying,
    "FechaCreacion" timestamp without time zone DEFAULT now(),
    "FechaModificacion" timestamp without time zone,
    "Activo" boolean DEFAULT true
);

ALTER TABLE public."Usuario" OWNER TO postgres;

CREATE SEQUENCE public."Usuario_IdUsuario_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Usuario_IdUsuario_seq" OWNER TO postgres;

ALTER SEQUENCE public."Usuario_IdUsuario_seq" OWNED BY public."Usuario"."IdUsuario";

CREATE TABLE public."Ventas" (
    "IdVenta" integer NOT NULL,
    "Fecha" timestamp without time zone DEFAULT now(),
    "Total" numeric(10,2) NOT NULL,
    "Estado" character varying(20) DEFAULT 'COMPLETADA'::character varying,
    "ClienteNombre" text,
    "IdUsuario" integer,
    "IdPuntoEntrega" integer
);

ALTER TABLE public."Ventas" OWNER TO postgres;

CREATE SEQUENCE public."Ventas_IdVenta_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Ventas_IdVenta_seq" OWNER TO postgres;

ALTER SEQUENCE public."Ventas_IdVenta_seq" OWNED BY public."Ventas"."IdVenta";

CREATE TABLE public.bitacora_actividades (
    id integer NOT NULL,
    usuario_id integer,
    accion character varying(255) NOT NULL,
    detalles text,
    fecha timestamp without time zone DEFAULT now()
);

ALTER TABLE public.bitacora_actividades OWNER TO postgres;

CREATE SEQUENCE public.bitacora_actividades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.bitacora_actividades_id_seq OWNER TO postgres;

ALTER SEQUENCE public.bitacora_actividades_id_seq OWNED BY public.bitacora_actividades.id;

ALTER TABLE ONLY public."Articulos" ALTER COLUMN "IdArticulo" SET DEFAULT nextval('public."Articulos_IdArticulo_seq1"'::regclass);

ALTER TABLE ONLY public."CfgStock" ALTER COLUMN "IdCfgStock" SET DEFAULT nextval('public."CfgStock_IdCfgStock_seq"'::regclass);

ALTER TABLE ONLY public."Combos" ALTER COLUMN "IdCombo" SET DEFAULT nextval('public."Combos_IdCombo_seq"'::regclass);

ALTER TABLE ONLY public."Configuracion" ALTER COLUMN "IdConfig" SET DEFAULT nextval('public."Configuracion_IdConfig_seq"'::regclass);

ALTER TABLE ONLY public."DetalleCombos" ALTER COLUMN "IdDetalleCombo" SET DEFAULT nextval('public."DetalleCombos_IdDetalleCombo_seq"'::regclass);

ALTER TABLE ONLY public."DetalleEntradas" ALTER COLUMN "IdDetalleEntrada" SET DEFAULT nextval('public."DetalleEntradas_IdDetalleEntrada_seq"'::regclass);

ALTER TABLE ONLY public."DetalleVentas" ALTER COLUMN "IdDetalle" SET DEFAULT nextval('public."DetalleVentas_IdDetalle_seq"'::regclass);

ALTER TABLE ONLY public."Entradas" ALTER COLUMN "IdEntrada" SET DEFAULT nextval('public."Entradas_IdEntrada_seq"'::regclass);

ALTER TABLE ONLY public."Proveedores" ALTER COLUMN "IdProveedor" SET DEFAULT nextval('public."Proveedores_IdProveedor_seq1"'::regclass);

ALTER TABLE ONLY public."PuntosEntrega" ALTER COLUMN "IdPunto" SET DEFAULT nextval('public."PuntosEntrega_IdPunto_seq"'::regclass);

ALTER TABLE ONLY public."Salidas" ALTER COLUMN "IdSalida" SET DEFAULT nextval('public."Salidas_IdSalida_seq"'::regclass);

ALTER TABLE ONLY public."Usuario" ALTER COLUMN "IdUsuario" SET DEFAULT nextval('public."Usuario_IdUsuario_seq"'::regclass);

ALTER TABLE ONLY public."Ventas" ALTER COLUMN "IdVenta" SET DEFAULT nextval('public."Ventas_IdVenta_seq"'::regclass);

ALTER TABLE ONLY public.bitacora_actividades ALTER COLUMN id SET DEFAULT nextval('public.bitacora_actividades_id_seq'::regclass);

COPY public."Configuracion" ("IdConfig", "NombreTienda", "Direccion", "Telefono", "MensajeTicket", "RedSocial", "LogoUrl") FROM stdin;
1	Aura Creativa	Hidalgo	7714306643	¡Gracias por su compra!	@aura.subliminados	logo01.png
\.

COPY public."Usuario" ("IdUsuario", "Nombre", "Email", "PasswordHash", "Rol", "FechaCreacion", "FechaModificacion", "Activo") FROM stdin;
1	Admin	admin@auracreativa.com	$2b$10$P8gkV1f30e4x2yLaj9iSd.N2bhUDvS6NAWMpIxtgkhRtSeXRNrL2K	ADMIN	2026-01-12 11:44:39.470051	2026-01-13 13:24:50.122723	t
2	Patricia Pérez	PatyLu@auracreativa.com	$2b$10$BgQ.JiCUNrsVhYPdRU0GpepewEFbDNfclc2GL.QMFKmKVyBBFdqYu	ADMIN	2026-01-13 13:42:50.894699	\N	t
\.

SELECT pg_catalog.setval('public."Configuracion_IdConfig_seq"', 1, true);

SELECT pg_catalog.setval('public."Usuario_IdUsuario_seq"', 2, true);


ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_CodArticulo_key1" UNIQUE ("CodArticulo");

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_pkey1" PRIMARY KEY ("IdArticulo");

ALTER TABLE ONLY public."CfgStock"
    ADD CONSTRAINT "CfgStock_pkey" PRIMARY KEY ("IdCfgStock");

ALTER TABLE ONLY public."Combos"
    ADD CONSTRAINT "Combos_pkey" PRIMARY KEY ("IdCombo");

ALTER TABLE ONLY public."Configuracion"
    ADD CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("IdConfig");

ALTER TABLE ONLY public."DetalleCombos"
    ADD CONSTRAINT "DetalleCombos_pkey" PRIMARY KEY ("IdDetalleCombo");

ALTER TABLE ONLY public."DetalleEntradas"
    ADD CONSTRAINT "DetalleEntradas_pkey" PRIMARY KEY ("IdDetalleEntrada");

ALTER TABLE ONLY public."DetalleVentas"
    ADD CONSTRAINT "DetalleVentas_pkey" PRIMARY KEY ("IdDetalle");

ALTER TABLE ONLY public."Entradas"
    ADD CONSTRAINT "Entradas_pkey" PRIMARY KEY ("IdEntrada");

ALTER TABLE ONLY public."Proveedores"
    ADD CONSTRAINT "Proveedores_pkey1" PRIMARY KEY ("IdProveedor");

ALTER TABLE ONLY public."PuntosEntrega"
    ADD CONSTRAINT "PuntosEntrega_pkey" PRIMARY KEY ("IdPunto");

ALTER TABLE ONLY public."Salidas"
    ADD CONSTRAINT "Salidas_pkey" PRIMARY KEY ("IdSalida");

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_Email_key" UNIQUE ("Email");

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("IdUsuario");

ALTER TABLE ONLY public."Ventas"
    ADD CONSTRAINT "Ventas_pkey" PRIMARY KEY ("IdVenta");

ALTER TABLE ONLY public.bitacora_actividades
    ADD CONSTRAINT bitacora_actividades_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_IdCfgStock_fkey" FOREIGN KEY ("IdCfgStock") REFERENCES public."CfgStock"("IdCfgStock");

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_IdProveedor_fkey" FOREIGN KEY ("IdProveedor") REFERENCES public."Proveedores"("IdProveedor");

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_IdUsuarioCreacion_fkey" FOREIGN KEY ("IdUsuarioCreacion") REFERENCES public."Usuario"("IdUsuario");

ALTER TABLE ONLY public."Combos"
    ADD CONSTRAINT "Combos_IdUsuarioCreacion_fkey" FOREIGN KEY ("IdUsuarioCreacion") REFERENCES public."Usuario"("IdUsuario");

ALTER TABLE ONLY public."DetalleCombos"
    ADD CONSTRAINT "DetalleCombos_IdCombo_fkey" FOREIGN KEY ("IdCombo") REFERENCES public."Combos"("IdCombo");

ALTER TABLE ONLY public."DetalleEntradas"
    ADD CONSTRAINT "DetalleEntradas_IdEntrada_fkey" FOREIGN KEY ("IdEntrada") REFERENCES public."Entradas"("IdEntrada");

ALTER TABLE ONLY public."DetalleVentas"
    ADD CONSTRAINT "DetalleVentas_IdCombo_fkey" FOREIGN KEY ("IdCombo") REFERENCES public."Combos"("IdCombo");

ALTER TABLE ONLY public."DetalleVentas"
    ADD CONSTRAINT "DetalleVentas_IdVenta_fkey" FOREIGN KEY ("IdVenta") REFERENCES public."Ventas"("IdVenta");

ALTER TABLE ONLY public."Entradas"
    ADD CONSTRAINT "Entradas_IdProveedor_fkey" FOREIGN KEY ("IdProveedor") REFERENCES public."Proveedores"("IdProveedor");

ALTER TABLE ONLY public."Entradas"
    ADD CONSTRAINT "Entradas_IdUsuarioCreacion_fkey" FOREIGN KEY ("IdUsuarioCreacion") REFERENCES public."Usuario"("IdUsuario");

ALTER TABLE ONLY public."Ventas"
    ADD CONSTRAINT "Ventas_IdPuntoEntrega_fkey" FOREIGN KEY ("IdPuntoEntrega") REFERENCES public."PuntosEntrega"("IdPunto");

ALTER TABLE ONLY public."Ventas"
    ADD CONSTRAINT "Ventas_IdUsuario_fkey" FOREIGN KEY ("IdUsuario") REFERENCES public."Usuario"("IdUsuario");

ALTER TABLE ONLY public.bitacora_actividades
    ADD CONSTRAINT bitacora_actividades_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public."Usuario"("IdUsuario") ON DELETE SET NULL;

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;

\unrestrict Yy6dbFY9iY6Gxe0TPe02KxotOiy58wKCYRyorvgQGqAeEfim5gcQGZfkgVz6zvO