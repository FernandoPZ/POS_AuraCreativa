# POS Aura Creativa 🛒

Sistema integral de Punto de Venta (POS) y Gestión de Inventarios diseñado para negocios de personalización, insumos y retail. El proyecto permite gestionar ventas, controlar stock en tiempo real, generar tickets de venta en PDF y administrar catálogos de productos y combos.

El sistema está dividido en dos partes principales:
- **Backend:** API RESTful robusta construida con Node.js y PostgreSQL.
- **Frontend:** Interfaz de usuario reactiva y moderna desarrollada con Vue 3 y Vite.

---

## 🚀 Características Principales

### 📦 Gestión de Inventario
- CRUD completo de Artículos con soporte para **subida de imágenes**.
- Gestión de variantes (Tallas, Colores, Categorías).
- **Combos/Paquetes:** Lógica avanzada que descuenta inventario basado en recetas de insumos.
- Alertas visuales de stock bajo.

### 💰 Punto de Venta (POS)
- Interfaz de ventas optimizada con buscador y filtros visuales.
- Carrito de compras dinámico.
- Selección de **Puntos de Entrega** (con integración de links a Google Maps).
- **Tickets de Venta:** Generación automática de PDF (formato térmico 80mm) con logo, detalles y código QR de ubicación.

### 🔐 Seguridad y Administración
- Autenticación segura mediante **JWT (JSON Web Tokens)**.
- Bitácora de actividades (Logs de seguridad para auditoría).
- Gestión de Proveedores y Compras (Entradas de almacén).
- Configuración dinámica de la tienda (Logo, Redes Sociales, Mensajes de ticket).

---

## 🛠 Tecnologías Utilizadas

### Backend (`/backend`)
- **Core:** Node.js, Express.js.
- **Base de Datos:** PostgreSQL (`pg`).
- **Archivos y PDF:** Multer (imágenes), PDFKit (tickets).
- **Utilidades:** QRCode (generación de códigos), JWT, Cors, Dotenv.

### Frontend (`/frontend`)
- **Core:** Vue 3 (Composition API), Vite.
- **Estado y Rutas:** Pinia, Vue Router.
- **UI/UX:** Bootstrap 5, FontAwesome, SweetAlert2.
- **Conexión:** Axios (Implementando Patrón de Servicios).

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para levantar el proyecto desde cero.

### 1. Base de Datos (PostgreSQL)
1. Crea una base de datos llamada `pos_auracreativa` (o el nombre de tu preferencia).
2. Ejecuta el script SQL incluido en `backend/db_init.sql` para generar las tablas y relaciones.

---

### 2. Backend

1. Ve al directorio del backend:
   ```bash
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configuración de Entorno:
   Crea un archivo .env en la carpeta backend/ con las siguientes variables (ajusta tus credenciales):
   ```bash
   PORT=3001
   DB_USER=tu_usuario_postgres
   DB_HOST=localhost
   DB_NAME=pos_auracreativa
   DB_PASSWORD=tu_contraseña
   DB_PORT=5432
   JWT_SECRET=palabra_super_secreta_para_tokens
   ```

4. Inicia el servidor:
   ```bash
   node app.js
   # O si usas nodemon:
   npm run dev
   ```

---

### 3. Frontend

1. Ve al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configuración de Entorno: Crea un archivo .env en la carpeta frontend/ para definir la URL de la API:
   ```bash
   VITE_API_URL=http://20.168.11.169:3001/api
   ```

4. Inicia la aplicación:
   ```bash
   npm run dev
   ```
---
## 📂 Estructura del Proyecto
   ```Plaintext
   POS_AuraCreativa/
   ├── backend/
   │   ├── config/          # Conexión a Base de Datos
   │   ├── controllers/     # Lógica de negocio (Ventas, Artículos, Tickets...)
   │   ├── middlewares/     # Autenticación y validaciones
   │   ├── public/uploads/  # Almacenamiento de imágenes de productos
   │   ├── routes/          # Endpoints de la API
   │   ├── utils/           # Herramientas (Logger, etc.)
   │   ├── app.js           # Archivo principal
   │   └── db_init.sql      # Script inicial SQL
   └── frontend/
      ├── src/
      │   ├── assets/      # Recursos estáticos
      │   ├── components/  # Componentes reutilizables
      │   ├── router/      # Configuración de rutas
      │   ├── services/    # Lógica de conexión a API (Axios)
      │   ├── stores/      # Estado global (Pinia)
      │   └── views/       # Vistas principales (POS, Inventario, Config)
      └── index.html
   ```
---
# 📢 Bitácora de Actualizaciones (Changelog)
**[v1.0.0] - Estructura Inicial Limpia**

**Fecha:** 19/01/2026 **Autor:** Fernando Pérez S.

**Módulos Completados:**

- Login y Autenticación JWT.

- Catálogo de Artículos (con carga de Imágenes).

- Punto de Venta (POS) con carrito y cálculo de totales.

- Generación de Tickets PDF (80mm) con QR dinámico de ubicación.

- Catálogo de Puntos de Entrega.

## Autor
Fernando Pérez S.