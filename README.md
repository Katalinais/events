# Event Management

Plataforma de gestión de eventos que permite explorar eventos, marcar favoritos y administrar contenido (eventos y categorías). Incluye roles de usuario y administrador, autenticación JWT y reportes de interesados.

## Stack

- **Backend:** NestJS, Prisma, PostgreSQL, JWT (Passport), bcryptjs
- **Frontend:** Next.js 16, React 19, Tailwind CSS, TanStack Query, Radix UI

## Estructura del proyecto

```
events/
├── backend/ 
│   ├── prisma/       # Schema, migraciones y seed
│   └── src/
│       ├── auth/
│       ├── events/   
│       ├── categories/
│       └── ...
├── frontend/         
│   ├── app/   
│   ├── components/
│   └── lib/ 
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL
- pnpm (recomendado) o npm

## Configuración

### 1. Backend

```bash
cd backend
cp .env.example .env   # o crea .env con las variables
```

En `.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/eventosdb"
JWT_SECRET="tu-clave-secreta-jwt"
```

Instalar dependencias y generar cliente Prisma:

```bash
pnpm install
pnpm prisma:generate
```

Aplicar migraciones:

```bash
pnpm prisma migrate deploy
```

Crear usuario administrador (seed):

```bash
pnpm prisma:seed
```

Opcional: variables para el usuario admin del seed:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
```

Iniciar el servidor:

```bash
pnpm start:dev
```

La API queda en `http://localhost:3000` (o el puerto configurado en NestJS).

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # o crea .env.local
```

En `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Ajusta la URL si el backend usa otro host/puerto.

Instalar e iniciar:

```bash
pnpm install
pnpm dev
```

La app se abre en `http://localhost:3001` (o el puerto que use Next).

## Funcionalidades

### Público (sin sesión)

- Ver listado de eventos con filtro por categoría y búsqueda.
- Ver detalles en tarjeta (nombre, descripción, fecha, precio, categoría); “Ver más” solo si el texto está truncado.
- Para marcar “Marcar como favorito” se pide iniciar sesión.

### Usuarios registrados

- Login con **usuario** y contraseña.
- Registro: nombre, apellido (opcional), correo (opcional), usuario y contraseña.
- Marcar eventos como favoritos (interés).
- Acceso a **Mis favoritos** (`/user`) con barra lateral desplegable (menú de tres líneas).
- Menú lateral: Eventos, Favoritos, Salir.

### Administradores

- Tras iniciar sesión con un usuario de tipo `ADMINISTRADOR`, se redirige al panel de administración.
- **Panel de administración** (`/admin`):
  - **Gestión:** pestañas Eventos y Categorías (CRUD). Subida de imagen para eventos.
  - **Reporte:** tabla de eventos con número de interesados y opción (ícono de ojo) para ver la lista de usuarios que marcaron interés.
- Navegación mediante menú lateral (ícono de tres líneas): Gestión, Reporte, Salir.
- Los administradores solo ven el panel de administración (no la lista pública ni favoritos en la barra).

### UI

- Navbar superior con logo y menú de tres líneas que abre un panel lateral (Sheet) con las opciones según el rol.
- Tarjetas de eventos con “Ver más” / “Ver menos” solo cuando el título o la descripción están truncados.
- Diseño responsive (móvil y escritorio).

## API principal (backend)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/events` | Lista de eventos |
| GET | `/events/upcoming` | Próximos eventos |
| GET | `/events/report` | Reporte con interesados (JWT) |
| GET | `/events/favorites` | Favoritos del usuario (JWT) |
| POST | `/events/:id/interested` | Marcar interés (JWT) |
| POST | `/auth/login` | Login (username, password) |
| POST | `/auth/register` | Registro (nombre, apellido?, correo?, username, password) |
| GET | `/categories` | Lista de categorías |

## Base de datos

- **Evento:** nombre, descripción, precio, imagen, fecha, categoría; borrado lógico (`deletedAt`).
- **Categoria:** nombre; borrado lógico.
- **Usuario:** nombre, apellido, correo (opcional), username, password, tipo (EXTERNO | INVITADO | ADMINISTRADOR).
- **UsuarioInteresado:** relación usuario–evento para “me interesa” / favoritos.

## Scripts útiles

**Backend**

- `pnpm start:dev` — Desarrollo con hot reload
- `pnpm prisma:studio` — Abrir Prisma Studio
- `pnpm prisma:seed` — Ejecutar seed (crear admin)
- `pnpm prisma:migrate` — Crear/aplicar migraciones en dev

**Frontend**

- `pnpm dev` — Servidor de desarrollo
- `pnpm build` — Build de producción
- `pnpm start` — Servidor de producción

## Licencia

ISC
