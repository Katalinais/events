# Event Management

Plataforma de gestión de eventos que permite explorar eventos, comprar boletas y administrar contenido. Incluye roles de usuario y administrador, autenticación JWT, compra de boletas con generación de PDF/QR y reportes de ventas.


## Stack

- **Backend:** NestJS, Prisma, PostgreSQL, JWT (Passport), bcryptjs, PDFKit, QRCode
- **Frontend:** Next.js 16, React 19, Tailwind CSS, TanStack Query, Radix UI

## Estructura del proyecto

```
events/
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline de CI (build + test)
├── backend/
│   ├── prisma/             # Schema, migraciones y seed
│   └── src/
│       ├── auth/
│       ├── categories/
│       ├── events/
│       ├── shared/
│       ├── ticket-categories/
│       ├── tickets/
│       ├── users/
│       └── test/           # Tests unitarios
├── frontend/
│   ├── app/
│   ├── features/
│   └── shared/
└── README.md
```

## Requisitos

- Node.js 22+
- PostgreSQL
- pnpm

## Configuración

### 1. Backend

Crea el archivo de variables de entorno:

```bash
cd backend
```

`.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/eventosdb"
JWT_SECRET="tu-clave-secreta-jwt"
```

Variables opcionales para el seed del administrador:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
```

Instalar, migrar y arrancar:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma migrate deploy
pnpm prisma:seed        # crea el usuario administrador
pnpm start:dev
```

La API queda en `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
pnpm install
pnpm dev
```

La app se abre en `http://localhost:3001`.

## Funcionalidades

### Público (sin sesión)

- Explorar eventos con filtro por categoría y búsqueda.
- Ver próximos eventos y los más vendidos.
- Ver eventos pasados.
- Para comprar boletas o marcar favoritos se solicita iniciar sesión.

### Usuarios registrados

- Login con **usuario** y contraseña.
- Registro: nombre, apellido (opcional), correo (opcional), usuario y contraseña.
- **Compra de boletas:** selección de tipo y cantidad, flujo de pago simulado, generación de QR y descarga de PDF.
- Marcar eventos como favoritos.
- Vista **Mis favoritos** en `/user`.

### Administradores

- Panel en `/admin` con pestañas de Gestión y Reportes.
- **Gestión de eventos:** CRUD completo con subida de imagen y configuración de entradas por tipo (categoría, cantidad, precio).
- **Gestión de categorías de eventos y de boletas:** CRUD con validaciones.
- **Reportes:**
  - Usuarios registrados en la plataforma.
  - Interesados por evento.
  - Ventas por evento (desglose por categoría de boleta).
  - Ingresos totales.

## CI — GitHub Actions

El pipeline se ejecuta en cada push y pull request a `main`.

```
push / pull_request → main
        │
   ┌────┴────┐
   ▼         ▼
backend-   frontend-
build      build
   │         │
   ▼         ▼
backend-   frontend-
test       test
(Jest)    (tsc --noEmit)
```

Los secrets necesarios en GitHub → Settings → Secrets:

| Secret | Descripción |
|--------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Clave para firmar tokens JWT |
| `NEXT_PUBLIC_API_URL` | URL del backend para el build de Next.js |

## Tests

**Correr tests (backend):**

```bash
cd backend
pnpm test
```

**Modo watch:**

```bash
pnpm test:watch
```

**Con cobertura:**

```bash
pnpm test:cov
open coverage/lcov-report/index.html
```

**Type check (frontend):**

```bash
cd frontend
pnpm test
```

## API principal

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Login |
| POST | `/auth/register` | — | Registro |
| GET | `/events` | — | Lista de eventos activos |
| GET | `/events/upcoming` | — | Próximos eventos |
| GET | `/events/top-selling` | — | Eventos más vendidos |
| GET | `/events/past` | — | Eventos pasados |
| GET | `/events/favorites` | JWT | Favoritos del usuario |
| POST | `/events/:id/interested` | JWT | Marcar interés |
| DELETE | `/events/:id/interested` | JWT | Quitar interés |
| GET | `/events/:id/ticket-entries` | — | Entradas disponibles del evento |
| GET | `/events/sales-summary` | JWT admin | Resumen de ventas por evento |
| GET | `/events/:id/sales-report` | JWT admin | Desglose de ventas del evento |
| GET | `/categories` | — | Lista de categorías |
| GET | `/ticket-categories` | — | Lista de tipos de boleta |
| POST | `/tickets` | JWT | Comprar boletas |
| GET | `/tickets/my` | JWT | Mis compras |
| GET | `/tickets/:id/pdf` | JWT | Descargar PDF de boletas |
| GET | `/users` | JWT admin | Lista de usuarios |

## Scripts útiles

**Backend**

| Comando | Descripción |
|---------|-------------|
| `pnpm start:dev` | Desarrollo con hot reload |
| `pnpm build` | Compilar a producción |
| `pnpm test` | Ejecutar tests unitarios |
| `pnpm test:watch` | Tests en modo watch |
| `pnpm test:cov` | Tests con reporte de cobertura |
| `pnpm prisma:generate` | Generar cliente Prisma |
| `pnpm prisma:migrate` | Crear/aplicar migraciones (dev) |
| `pnpm prisma:seed` | Crear usuario administrador |
| `pnpm prisma:studio` | Abrir Prisma Studio |

**Frontend**

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm test` | Type check (tsc --noEmit) |

## Licencia

Hecho Por Julian Camilo Ceron Patiño Y Laura Katalina Torres Fonseca