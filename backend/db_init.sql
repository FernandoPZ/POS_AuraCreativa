--
-- PostgreSQL database dump
--

\restrict J5lxg1DHKLlPbgt6aMEssVp0dJzdqiInIs8CEZ5gtzytodT06m7Zd8pD39rxVGW

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-09-29 20:30:51

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16650)
-- Name: Articulos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Articulos" (
    "IdArticulo" integer NOT NULL,
    "CodArticulo" character varying(50) NOT NULL,
    "NomArticulo" character varying(150) NOT NULL,
    "StockActual" integer DEFAULT 0,
    "IdProveedor" integer,
    "IdCfgStock" integer NOT NULL,
    "BajaLogica" boolean DEFAULT true,
    "FechaAlta" timestamp without time zone DEFAULT now(),
    "FechaUltMod" timestamp without time zone DEFAULT now(),
    "ClaUserMod" integer,
    "NombrePcMod" character varying(100)
);


ALTER TABLE public."Articulos" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16649)
-- Name: Articulos_IdArticulo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Articulos_IdArticulo_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Articulos_IdArticulo_seq" OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 225
-- Name: Articulos_IdArticulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Articulos_IdArticulo_seq" OWNED BY public."Articulos"."IdArticulo";


--
-- TOC entry 220 (class 1259 OID 16606)
-- Name: CfgStock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CfgStock" (
    "IdCfgStock" integer NOT NULL,
    "CantidadMaxima" integer NOT NULL,
    "CantidadMinima" integer NOT NULL,
    "BajaLogica" boolean DEFAULT true,
    "FechaAlta" timestamp without time zone DEFAULT now(),
    "FechaUltMod" timestamp without time zone DEFAULT now(),
    "ClaUserMod" integer,
    "NombrePcMod" character varying(100)
);


ALTER TABLE public."CfgStock" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16605)
-- Name: CfgStock_IdCfgStock_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CfgStock_IdCfgStock_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CfgStock_IdCfgStock_seq" OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 219
-- Name: CfgStock_IdCfgStock_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CfgStock_IdCfgStock_seq" OWNED BY public."CfgStock"."IdCfgStock";


--
-- TOC entry 228 (class 1259 OID 16682)
-- Name: Entradas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Entradas" (
    "IdEntrada" integer NOT NULL,
    "IdArticulo" integer NOT NULL,
    "Cantidad" integer NOT NULL,
    "Comentarios" text,
    "FechaMovimiento" timestamp without time zone DEFAULT now(),
    "BajaLogica" boolean DEFAULT true,
    "FechaUltMod" timestamp without time zone DEFAULT now(),
    "ClaUserMod" integer,
    "NombrePcMod" character varying(100)
);


ALTER TABLE public."Entradas" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16681)
-- Name: Entradas_IdEntrada_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Entradas_IdEntrada_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Entradas_IdEntrada_seq" OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 227
-- Name: Entradas_IdEntrada_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Entradas_IdEntrada_seq" OWNED BY public."Entradas"."IdEntrada";


--
-- TOC entry 224 (class 1259 OID 16637)
-- Name: Proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Proveedores" (
    "IdProveedor" integer NOT NULL,
    "NomProveedor" character varying(100) NOT NULL,
    "RFC" character varying(20),
    "BajaLogica" boolean DEFAULT true,
    "FechaUltMod" timestamp without time zone DEFAULT now(),
    "ClaUserMod" integer,
    "NombrePcMod" character varying(100)
);


ALTER TABLE public."Proveedores" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16636)
-- Name: Proveedores_IdProveedor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Proveedores_IdProveedor_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Proveedores_IdProveedor_seq" OWNER TO postgres;

--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 223
-- Name: Proveedores_IdProveedor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Proveedores_IdProveedor_seq" OWNED BY public."Proveedores"."IdProveedor";


--
-- TOC entry 230 (class 1259 OID 16707)
-- Name: Salidas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Salidas" (
    "IdSalida" integer NOT NULL,
    "IdArticulo" integer NOT NULL,
    "Cantidad" integer NOT NULL,
    "Comentarios" text,
    "FechaMovimiento" timestamp without time zone DEFAULT now(),
    "BajaLogica" boolean DEFAULT true,
    "FechaUltMod" timestamp without time zone DEFAULT now(),
    "ClaUserMod" integer,
    "NombrePcMod" character varying(100)
);


ALTER TABLE public."Salidas" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16706)
-- Name: Salidas_IdSalida_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Salidas_IdSalida_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Salidas_IdSalida_seq" OWNER TO postgres;

--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 229
-- Name: Salidas_IdSalida_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Salidas_IdSalida_seq" OWNED BY public."Salidas"."IdSalida";


--
-- TOC entry 222 (class 1259 OID 16619)
-- Name: Usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Usuario" (
    "IdUsuario" integer NOT NULL,
    "Nombre" character varying(100) NOT NULL,
    "Email" character varying(100) NOT NULL,
    "PasswordHash" character varying(255) NOT NULL,
    "Rol" character varying(50) DEFAULT 'USER'::character varying,
    "BajaLogica" boolean DEFAULT true,
    "FechaUltMod" timestamp without time zone DEFAULT now(),
    "ClaUserMod" integer,
    "NombrePcMod" character varying(100)
);


ALTER TABLE public."Usuario" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16618)
-- Name: Usuario_IdUsuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Usuario_IdUsuario_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Usuario_IdUsuario_seq" OWNER TO postgres;

--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 221
-- Name: Usuario_IdUsuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Usuario_IdUsuario_seq" OWNED BY public."Usuario"."IdUsuario";


--
-- TOC entry 4892 (class 2604 OID 16653)
-- Name: Articulos IdArticulo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Articulos" ALTER COLUMN "IdArticulo" SET DEFAULT nextval('public."Articulos_IdArticulo_seq"'::regclass);


--
-- TOC entry 4881 (class 2604 OID 16609)
-- Name: CfgStock IdCfgStock; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CfgStock" ALTER COLUMN "IdCfgStock" SET DEFAULT nextval('public."CfgStock_IdCfgStock_seq"'::regclass);


--
-- TOC entry 4897 (class 2604 OID 16685)
-- Name: Entradas IdEntrada; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Entradas" ALTER COLUMN "IdEntrada" SET DEFAULT nextval('public."Entradas_IdEntrada_seq"'::regclass);


--
-- TOC entry 4889 (class 2604 OID 16640)
-- Name: Proveedores IdProveedor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Proveedores" ALTER COLUMN "IdProveedor" SET DEFAULT nextval('public."Proveedores_IdProveedor_seq"'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16710)
-- Name: Salidas IdSalida; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Salidas" ALTER COLUMN "IdSalida" SET DEFAULT nextval('public."Salidas_IdSalida_seq"'::regclass);


--
-- TOC entry 4885 (class 2604 OID 16622)
-- Name: Usuario IdUsuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario" ALTER COLUMN "IdUsuario" SET DEFAULT nextval('public."Usuario_IdUsuario_seq"'::regclass);


--
-- TOC entry 5084 (class 0 OID 16650)
-- Dependencies: 226
-- Data for Name: Articulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Articulos" ("IdArticulo", "CodArticulo", "NomArticulo", "StockActual", "IdProveedor", "IdCfgStock", "BajaLogica", "FechaAlta", "FechaUltMod", "ClaUserMod", "NombrePcMod") FROM stdin;
2	CLV-001	Clavos 1/4	0	1	2	f	2025-09-29 18:05:27.347125	2025-09-29 18:07:34.355174	3	WEB_APP
4	LP-004	Lampara	10	1	4	t	2025-09-29 19:12:56.341398	2025-09-29 19:13:12.580392	3	WEB_APP_MOV
1	LAP-X200	Laptop X200 - Modelo 2024	15	1	1	t	2025-09-29 16:04:04.780346	2025-09-29 19:13:27.559935	3	WEB_APP_MOV
5	LOP-009	Loseta modelo cajeta	11	1	5	t	2025-09-29 19:33:29.662465	2025-09-29 19:54:57.589164	3	WEB_APP_MOV
6	NUEVO-008	Nuevo articulo	11	2	6	t	2025-09-29 19:54:40.162427	2025-09-29 19:55:26.045424	3	WEB_APP_MOV
3	TBL-0004	Tabla roca	5	1	3	f	2025-09-29 18:24:23.702177	2025-09-29 20:01:01.801483	3	WEB_APP
\.


--
-- TOC entry 5078 (class 0 OID 16606)
-- Dependencies: 220
-- Data for Name: CfgStock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CfgStock" ("IdCfgStock", "CantidadMaxima", "CantidadMinima", "BajaLogica", "FechaAlta", "FechaUltMod", "ClaUserMod", "NombrePcMod") FROM stdin;
1	150	5	t	2025-09-29 16:04:04.780346	2025-09-29 16:06:42.860121	3	WEB_APP
2	150	10	t	2025-09-29 18:05:27.347125	2025-09-29 18:07:28.695	3	WEB_APP
3	200	10	t	2025-09-29 18:24:23.702177	2025-09-29 18:24:23.702177	3	WEB_APP
4	100	5	t	2025-09-29 19:12:56.341398	2025-09-29 19:12:56.341398	3	WEB_APP
5	300	10	t	2025-09-29 19:33:29.662465	2025-09-29 19:33:29.662465	3	WEB_APP
6	300	10	t	2025-09-29 19:54:40.162427	2025-09-29 19:54:40.162427	3	WEB_APP
\.


--
-- TOC entry 5086 (class 0 OID 16682)
-- Dependencies: 228
-- Data for Name: Entradas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Entradas" ("IdEntrada", "IdArticulo", "Cantidad", "Comentarios", "FechaMovimiento", "BajaLogica", "FechaUltMod", "ClaUserMod", "NombrePcMod") FROM stdin;
1	1	50	Entrada inicial	2025-09-29 16:29:54.896789	t	2025-09-29 16:29:54.896789	3	WEB_APP_MOV
2	3	20	Nueva entrada de stock	2025-09-29 18:24:47.085512	t	2025-09-29 18:24:47.085512	3	WEB_APP_MOV
3	3	20	Nueva entrada de stock	2025-09-29 18:29:44.39406	t	2025-09-29 18:29:44.39406	3	WEB_APP_MOV
4	1	5	nueva entrada	2025-09-29 18:30:18.783304	t	2025-09-29 18:30:18.783304	3	WEB_APP_MOV
5	1	5	Ingreso nuevo	2025-09-29 18:34:18.621433	t	2025-09-29 18:34:18.621433	3	WEB_APP_MOV
6	1	5	Ingreso nuevo	2025-09-29 18:38:20.675809	t	2025-09-29 18:38:20.675809	3	WEB_APP_MOV
7	1	5	Ingreso nuevo	2025-09-29 18:38:21.924341	t	2025-09-29 18:38:21.924341	3	WEB_APP_MOV
8	1	20	Movimiento ENTRADA	2025-09-29 18:39:00.200957	t	2025-09-29 18:39:00.200957	3	WEB_APP_MOV
9	3	10	nueva entrada	2025-09-29 18:57:12.604297	t	2025-09-29 18:57:12.604297	3	WEB_APP_MOV
10	4	10	entrada nueva	2025-09-29 19:13:12.580392	t	2025-09-29 19:13:12.580392	3	WEB_APP_MOV
11	5	11	Nueva entrada	2025-09-29 19:54:57.589164	t	2025-09-29 19:54:57.589164	3	WEB_APP_MOV
12	6	11	Movimiento ENTRADA	2025-09-29 19:55:26.045424	t	2025-09-29 19:55:26.045424	3	WEB_APP_MOV
\.


--
-- TOC entry 5082 (class 0 OID 16637)
-- Dependencies: 224
-- Data for Name: Proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Proveedores" ("IdProveedor", "NomProveedor", "RFC", "BajaLogica", "FechaUltMod", "ClaUserMod", "NombrePcMod") FROM stdin;
1	Proveedor Genérico	GEN000101XYZ	t	2025-09-29 15:45:30.724392	0	SETUP_SCRIPT
2	Proveedor Genial	RFCINVENTADO	t	2025-09-29 19:53:56.076886	\N	\N
\.


--
-- TOC entry 5088 (class 0 OID 16707)
-- Dependencies: 230
-- Data for Name: Salidas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Salidas" ("IdSalida", "IdArticulo", "Cantidad", "Comentarios", "FechaMovimiento", "BajaLogica", "FechaUltMod", "ClaUserMod", "NombrePcMod") FROM stdin;
1	1	45	Salida a producción	2025-09-29 16:30:55.129055	t	2025-09-29 16:30:55.129055	3	WEB_APP_MOV
2	1	5	Venta	2025-09-29 18:34:01.720781	t	2025-09-29 18:34:01.720781	3	WEB_APP_MOV
3	3	40	Movimiento SALIDA	2025-09-29 18:38:36.377221	t	2025-09-29 18:38:36.377221	3	WEB_APP_MOV
4	1	20	Movimiento SALIDA	2025-09-29 18:38:53.931307	t	2025-09-29 18:38:53.931307	3	WEB_APP_MOV
5	3	5	venta	2025-09-29 19:02:02.692499	t	2025-09-29 19:02:02.692499	3	WEB_APP_MOV
6	1	5	venta	2025-09-29 19:13:27.559935	t	2025-09-29 19:13:27.559935	3	WEB_APP_MOV
\.


--
-- TOC entry 5080 (class 0 OID 16619)
-- Dependencies: 222
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Usuario" ("IdUsuario", "Nombre", "Email", "PasswordHash", "Rol", "BajaLogica", "FechaUltMod", "ClaUserMod", "NombrePcMod") FROM stdin;
3	Admin Catalogo	admin@catalogo.com	$2b$10$R5FaFwEkIBpjXKsryfaUD.0PfNYF3Az0K/CzBWwZe7.bZr44dS17O	ADMIN	t	2025-09-29 15:49:46.683431	1	SERVIDOR_REG
\.


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 225
-- Name: Articulos_IdArticulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Articulos_IdArticulo_seq"', 6, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 219
-- Name: CfgStock_IdCfgStock_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CfgStock_IdCfgStock_seq"', 6, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 227
-- Name: Entradas_IdEntrada_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Entradas_IdEntrada_seq"', 12, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 223
-- Name: Proveedores_IdProveedor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Proveedores_IdProveedor_seq"', 2, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 229
-- Name: Salidas_IdSalida_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Salidas_IdSalida_seq"', 6, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 221
-- Name: Usuario_IdUsuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Usuario_IdUsuario_seq"', 3, true);


--
-- TOC entry 4916 (class 2606 OID 16665)
-- Name: Articulos Articulos_CodArticulo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_CodArticulo_key" UNIQUE ("CodArticulo");


--
-- TOC entry 4918 (class 2606 OID 16663)
-- Name: Articulos Articulos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_pkey" PRIMARY KEY ("IdArticulo");


--
-- TOC entry 4906 (class 2606 OID 16617)
-- Name: CfgStock CfgStock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CfgStock"
    ADD CONSTRAINT "CfgStock_pkey" PRIMARY KEY ("IdCfgStock");


--
-- TOC entry 4920 (class 2606 OID 16695)
-- Name: Entradas Entradas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Entradas"
    ADD CONSTRAINT "Entradas_pkey" PRIMARY KEY ("IdEntrada");


--
-- TOC entry 4912 (class 2606 OID 16648)
-- Name: Proveedores Proveedores_RFC_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Proveedores"
    ADD CONSTRAINT "Proveedores_RFC_key" UNIQUE ("RFC");


--
-- TOC entry 4914 (class 2606 OID 16646)
-- Name: Proveedores Proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Proveedores"
    ADD CONSTRAINT "Proveedores_pkey" PRIMARY KEY ("IdProveedor");


--
-- TOC entry 4922 (class 2606 OID 16720)
-- Name: Salidas Salidas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Salidas"
    ADD CONSTRAINT "Salidas_pkey" PRIMARY KEY ("IdSalida");


--
-- TOC entry 4908 (class 2606 OID 16635)
-- Name: Usuario Usuario_Email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_Email_key" UNIQUE ("Email");


--
-- TOC entry 4910 (class 2606 OID 16633)
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("IdUsuario");


--
-- TOC entry 4923 (class 2606 OID 16676)
-- Name: Articulos Articulos_ClaUserMod_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_ClaUserMod_fkey" FOREIGN KEY ("ClaUserMod") REFERENCES public."Usuario"("IdUsuario");


--
-- TOC entry 4924 (class 2606 OID 16671)
-- Name: Articulos Articulos_IdCfgStock_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_IdCfgStock_fkey" FOREIGN KEY ("IdCfgStock") REFERENCES public."CfgStock"("IdCfgStock");


--
-- TOC entry 4925 (class 2606 OID 16666)
-- Name: Articulos Articulos_IdProveedor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Articulos"
    ADD CONSTRAINT "Articulos_IdProveedor_fkey" FOREIGN KEY ("IdProveedor") REFERENCES public."Proveedores"("IdProveedor");


--
-- TOC entry 4926 (class 2606 OID 16701)
-- Name: Entradas Entradas_ClaUserMod_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Entradas"
    ADD CONSTRAINT "Entradas_ClaUserMod_fkey" FOREIGN KEY ("ClaUserMod") REFERENCES public."Usuario"("IdUsuario");


--
-- TOC entry 4927 (class 2606 OID 16696)
-- Name: Entradas Entradas_IdArticulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Entradas"
    ADD CONSTRAINT "Entradas_IdArticulo_fkey" FOREIGN KEY ("IdArticulo") REFERENCES public."Articulos"("IdArticulo");


--
-- TOC entry 4928 (class 2606 OID 16726)
-- Name: Salidas Salidas_ClaUserMod_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Salidas"
    ADD CONSTRAINT "Salidas_ClaUserMod_fkey" FOREIGN KEY ("ClaUserMod") REFERENCES public."Usuario"("IdUsuario");


--
-- TOC entry 4929 (class 2606 OID 16721)
-- Name: Salidas Salidas_IdArticulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Salidas"
    ADD CONSTRAINT "Salidas_IdArticulo_fkey" FOREIGN KEY ("IdArticulo") REFERENCES public."Articulos"("IdArticulo");


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO nihon_user;


-- Completed on 2025-09-29 20:30:51

--
-- PostgreSQL database dump complete
--

\unrestrict J5lxg1DHKLlPbgt6aMEssVp0dJzdqiInIs8CEZ5gtzytodT06m7Zd8pD39rxVGW

