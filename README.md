# ProFact - Sistema de Gestión de Inventario

Sistema web completo para la gestión de inventario de productos, facturación y administración empresarial.

## Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| React 19 | Framework UI |
| TypeScript | Tipado estático |
| Vite | Compilador |

### Backend
| Tecnología | Uso |
|------------|-----|
| Spring Boot 3.3 | API REST |
| Java 21 | Lenguaje |
| Spring Security + JWT | Autenticación |
| H2 Database | BD embebida (desarrollo) |

### Integración Externa
| Tecnología | Uso |
|------------|-----|
| Firebase Authentication | Login/Registro de usuarios |
| Cloud Firestore | Base de datos de productos, categorías y empleados |

---

## Funcionalidades

### 1. Landing Page
- Página de inicio con hero, estadísticas y características
- Secciones: Inicio, Nosotros, Planes, Capacitación
- Navbar responsive

### 2. Login / Registro
- **Firebase Auth**: Login y registro con correo y contraseña
- **Spring Boot**: Login alternativo con usuario y contraseña
- Credenciales locales: `root` / `12345`

### 3. Dashboard Principal
- Métricas en tiempo real (productos, stock, alertas)
- Últimos productos registrados
- Actividad reciente

### 4. CRUD Productos (Firestore)
- Crear, leer, actualizar y eliminar productos
- Gestión de categorías
- Control de stock con alertas
- Búsqueda de productos

### 5. CRUD Usuarios (Firestore + Firebase Auth)
- Crear usuarios con credenciales de acceso
- Roles: administrador y usuario
- Activar/desactivar usuarios

### 6. CRUD Compras (Spring Boot)
- Registro de compras con proveedor
- Detalle de productos y cantidades
- Cálculo automático de subtotal, IVA y total

### 7. CRUD Ventas (Spring Boot)
- Registro de ventas con cliente
- Generación de facturas PDF
- Historial de ventas

### 8. Reportes (Spring Boot)
- Gráficas de ventas y compras
- Productos más vendidos
- Resumen financiero

### 9. Clientes y Proveedores (Spring Boot)
- Gestión completa de clientes
- Gestión completa de proveedores

### 10. Configuración (Spring Boot)
- Parámetro global de IVA

---

## Estructura del Proyecto

```
ProyectoDI/
├── frontend/                          # React + Vite + TypeScript
│   ├── src/
│   │   ├── core/
│   │   │   ├── config/
│   │   │   │   └── firebase.config.ts       # Configuración Firebase
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx           # Autenticación (Firebase + fallback)
│   │   │   ├── services/
│   │   │   │   └── firestore.service.ts     # Servicio CRUD Firestore
│   │   │   ├── api/
│   │   │   │   └── api.ts                   # Cliente HTTP (Spring Boot)
│   │   │   ├── components/                  # Componentes reutilizables
│   │   │   ├── layouts/                     # Layouts de páginas
│   │   │   └── router/                      # Rutas
│   │   ├── modules/
│   │   │   ├── landing/                     # Páginas públicas
│   │   │   └── dashboard/                   # Páginas privadas
│   │   └── assets/
│   ├── .env                                  # Variables de entorno Firebase
│   └── package.json
│
├── backend/                           # Spring Boot + Java 21
│   ├── src/main/java/com/binasystem/profact/
│   │   ├── controller/                # Endpoints REST
│   │   ├── service/                   # Lógica de negocio
│   │   ├── entity/                    # Entidades JPA
│   │   ├── dto/                       # Data Transfer Objects
│   │   ├── repository/                # Repositorios Spring Data
│   │   ├── security/                  # JWT + Spring Security
│   │   ├── config/                    # Configuración CORS, datos
│   │   └── exception/                 # Manejo de errores
│   ├── src/main/resources/
│   │   └── application.properties     # Config Spring Boot
│   └── pom.xml                        # Dependencias Maven
│
└── README.md
```

---

## Configuración

### Requisitos previos
- Node.js 18+
- Java 21+
- Cuenta de Firebase (gratis)

### Paso 1: Configurar Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear proyecto (ej: `profact-web`)
3. Habilitar **Authentication** > **Email/Password**
4. Crear **Cloud Firestore** > **Start in test mode**
5. Ir a **Configuración del proyecto** > **Tus apps** > ícono **Web** `</>`
6. Copiar la configuración

### Paso 2: Crear archivo `.env`

En `frontend/.env`:
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Paso 3: Reglas de Firestore

En Firestore > **Reglas**, pegar:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Click **Publicar**.

### Paso 4: Instalar dependencias

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
No requiere instalación manual, Maven descarga las dependencias automáticamente.

### Paso 5: Ejecutar

Abrir **dos terminales**:

**Terminal 1 - Backend:**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
El backend corre en `http://localhost:8081`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend corre en `http://localhost:5173`

---

## Base de Datos Firebase (Firestore)

### Colección `usuarios`
```json
{
  "nombre": "string",
  "email": "string",
  "rol": "admin | user",
  "activo": true
}
```

### Colección `productos`
```json
{
  "nombre": "string",
  "descripcion": "string",
  "precio": 0.00,
  "stock": 0,
  "stockMinimo": 0,
  "categoriaId": "string",
  "categoriaNombre": "string",
  "activo": true
}
```

### Colección `categorias`
```json
{
  "nombre": "string",
  "descripcion": "string"
}
```

---

## Rutas

### Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Inicio (Landing) |
| `/nosotros` | Nosotros |
| `/planes` | Planes |
| `/capacitacion` | Capacitación |
| `/sesion` | Login / Registro |

### Privadas (requieren login)
| Ruta | Descripción | Backend |
|------|-------------|---------|
| `/dashboard` | Dashboard principal | Firestore |
| `/dashboard/inventario` | CRUD Productos | Firestore |
| `/dashboard/usuarios` | CRUD Usuarios | Firestore + Auth |
| `/dashboard/compras` | CRUD Compras | Spring Boot |
| `/dashboard/ventas` | CRUD Ventas | Spring Boot |
| `/dashboard/reportes` | Reportes y gráficas | Spring Boot |
| `/dashboard/clientes` | CRUD Clientes | Spring Boot |
| `/dashboard/proveedores` | CRUD Proveedores | Spring Boot |
| `/dashboard/configuracion` | Configuración IVA | Spring Boot |

---

## Notas

- **Landing pages** funcionan sin backend ni Firebase
- **Inventario, Usuarios** usan Firestore (no necesitan Spring Boot)
- **Compras, Ventas, Reportes, Clientes, Proveedores, Configuración** usan Spring Boot
- Si Spring Boot no está corriendo, esas páginas mostrarán error
- La base de datos H2 del backend se crea automáticamente al iniciar
