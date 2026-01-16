# Catálogo Inventario Fullstack

Este repositorio contiene una aplicación completa para la gestión de inventario, proveedores y movimientos de stock. El proyecto está dividido en dos partes:

- **Backend:** API RESTful construida con Node.js, Express y PostgreSQL.
- **Frontend:** Interfaz de usuario moderna y minimalista desarrollada con Vue 3, Vite y Bootstrap 5.

---

## Descripción General

### Backend
- **Ubicación:** `/backend`
- **Tecnologías:** Node.js, Express, PostgreSQL, Socket.IO
- **Funcionalidad:**
  - CRUD de Artículos
  - CRUD de Proveedores
  - Registro y consulta de Movimientos de inventario
  - Autenticación JWT
  - Actualización en tiempo real de stock mediante Socket.IO

### Frontend
- **Ubicación:** `/frontend`
- **Tecnologías:** Vue 3, Vite, Bootstrap 5, Pinia
- **Funcionalidad:**
  - Visualización y gestión de artículos, proveedores y movimientos
  - Registro y edición de proveedores y artículos
  - Validación de formularios y alertas
  - Navegación protegida por autenticación
  - Interfaz minimalista y responsiva

---

## Cómo levantar el proyecto

### 1. Backend

#### Requisitos
- Node.js >= 16
- PostgreSQL

#### Instalación y configuración
1. Ve al directorio del backend:
   ```sh
   cd backend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Configura la base de datos:
   - Crea una base de datos PostgreSQL.
   - Ajusta la configuración en `backend/config/db.js` con tus credenciales.
   - Ejecuta el script `backend/db_init.sql` para crear las tablas y cargar datos iniciales:
     ```sh
     psql -U tu_usuario -d tu_basededatos -f backend/db_init.sql
     ```
   - Si usas otro cliente, puedes importar el archivo SQL manualmente.
4. Inicia el servidor:
   ```sh
   node app.js
   ```
   El backend estará disponible en `http://localhost:3001`.

### 2. Frontend

#### Requisitos
- Node.js >= 16

#### Instalación y ejecución
1. Ve al directorio del frontend:
   ```sh
   cd frontend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Inicia la aplicación:
   ```sh
   npm run dev
   ```
   El frontend estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

---

## Estructura de carpetas

```
catalogo-fullstack/
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    └── src/
        ├── App.vue
        ├── main.js
        ├── style.css
        ├── assets/
        ├── components/
        ├── router/
        ├── services/
        ├── stores/
        └── views/
```

---

## Descripción de carpetas principales

### Backend
- **controllers/**: Lógica de negocio para cada entidad (artículos, proveedores, movimientos, autenticación).
- **routes/**: Definición de rutas y endpoints de la API.
- **middlewares/**: Funciones de autenticación y validación.
- **config/**: Configuración de la base de datos.
- **utils/**: Utilidades varias (por ejemplo, checker de sockets).

### Frontend
- **views/**: Vistas principales de la app (Artículos, Proveedores, Movimientos, Login).
- **components/**: Componentes reutilizables (Navbar, etc).
- **services/**: Lógica para consumir la API del backend.
- **stores/**: Estado global (Pinia, autenticación).
- **router/**: Definición de rutas y navegación.
- **assets/**: Imágenes y recursos estáticos.

---

## Notas adicionales
- El sistema requiere autenticación para acceder a las vistas principales.
- El navbar es global y permite navegar entre todas las secciones.
- El backend y frontend deben estar corriendo simultáneamente para el funcionamiento completo.
- Si tienes dudas sobre la estructura de la base de datos, revisa los controladores y modelos en el backend.

---

## Autor
Desarrollado por Patricia Pérez.
