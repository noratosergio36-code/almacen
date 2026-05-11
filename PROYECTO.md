# InventaPro — Documento de Proyecto

> Control de alcance, historial de cambios y registro de actualizaciones.

---

## Scope original

Sistema de control de inventario para almacenes industriales, diseñado para gestionar stock de componentes con trazabilidad completa de entradas, salidas, apartados y movimientos internos.

### Módulos contemplados

| Módulo | Descripción | Roles con acceso |
|---|---|---|
| Dashboard | KPIs del inventario, alertas y gráficas de actividad | ADMIN |
| Almacén | Vista de ubicaciones con stock por nivel | ADMIN, ALMACENISTA, USUARIO |
| Entradas | Registro de lotes entrantes con precio unitario FIFO | ADMIN, ALMACENISTA |
| Salidas | Despacho de componentes descontando stock FIFO | ADMIN, ALMACENISTA |
| Apartados | Reserva de componentes por proyecto con vigencia | ADMIN, ALMACENISTA, USUARIO |
| Artículos | Catálogo con stock disponible y ubicaciones | ADMIN, ALMACENISTA, USUARIO |
| Ubicaciones | Gestión de pasillos/filas y niveles físicos del almacén | ADMIN, ALMACENISTA |
| Proyectos | Registro de proyectos destino para salidas y apartados | ADMIN, ALMACENISTA, USUARIO |
| Reportes | Reportes de entradas, salidas y movimientos con exportación Excel | ADMIN |
| Usuarios | Gestión de cuentas y roles | ADMIN |
| Mi Perfil | Datos del usuario autenticado | Todos |

### Stack técnico

- **Framework**: Next.js 14 (App Router)
- **ORM**: Prisma 7 + PostgreSQL
- **Auth**: NextAuth.js v4 (JWT, credenciales)
- **UI**: Tailwind CSS + CSS custom properties (variables de tema)
- **Tipografía**: Barlow Semi Condensed (Google Fonts via `next/font`)
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod
- **Notificaciones**: Sonner
- **Excel**: xlsx (exportación de reportes)
- **Costos**: Algoritmo FIFO sobre `LoteEntrada`

### Modelo de datos principal

```
Ubicacion → Nivel → ArticuloNivel ← Articulo
Entrada → LoteEntrada ← SalidaItem ← Salida
Articulo ← ApartadoItem ← Apartado → Proyecto
Articulo ← Movimiento → Nivel (origen/destino)
Usuario → Notificacion, AuditLog, Movimiento
```

### Roles y permisos

| Acción | ADMIN | ALMACENISTA | USUARIO |
|---|:---:|:---:|:---:|
| Ver almacén y artículos | ✓ | ✓ | ✓ |
| Crear entradas / salidas | ✓ | ✓ | — |
| Apartar componentes | ✓ | ✓ | ✓ |
| Mover componentes | ✓ | ✓ | — |
| Ver reportes | ✓ | — | — |
| Gestionar usuarios | ✓ | — | — |

---

## Historial de cambios

---

### v1.0 — Base de la aplicación
**Estado**: Entregado

#### Funcionalidades implementadas
- Estructura Next.js 14 App Router con grupos de rutas `(dashboard)` y `(auth)`
- Autenticación con NextAuth.js (credenciales email/password, JWT)
- Schema Prisma completo: Usuario, Ubicacion, Articulo, Entrada, LoteEntrada, Salida, SalidaItem, Apartado, ApartadoItem, Proyecto, Notificacion, AuditLog
- CRUD completo para: artículos, ubicaciones, entradas, salidas, apartados, proyectos, usuarios
- Algoritmo FIFO en `lib/fifo.ts` para cálculo de costos al despachar
- Dashboard con KPIs: valor inventario, artículos en stock/cero, lotes sin precio, apartados por vencer, proyectos activos
- Tema oscuro industrial con acento cyan (`#00D4FF`)
- Sidebar con navegación y control de acceso por rol
- Sistema de notificaciones in-app (`NotificationBell`)
- `AuditLog` en operaciones críticas
- Importación masiva CSV (entradas, salidas, apartados) con validación previa
- Exportación a Excel en reportes

---

### v2.0 — Apartados y stock reservado
**Estado**: Entregado

#### Problema resuelto
La pantalla de detalle de artículo mostraba pantalla negra por una referencia obsoleta al campo `proveedor` (eliminado en una migración anterior).

#### Cambios
- **Corrección**: eliminada referencia a `proveedor` en `api/articulos/[id]`, `api/entradas/[id]` y `api/reportes/entradas`
- **Artículos**: columna "Apartado" en la tabla; stock visible = total − reservado
- **Almacén modal**: botón "Apartar" habilitado por nivel con las mismas reglas
- **Reglas de apartado**:
  - Vigencia fija de **7 días calendario** (sin campo editable)
  - **Proyecto obligatorio** — botón deshabilitado sin proyecto seleccionado
- **Stock en modal de almacén**: muestra `disponible` y advertencia en ámbar si hay unidades apartadas

---

### v3.0 — Movimiento de componentes, reportes y ubicaciones en artículos
**Estado**: Entregado

#### Cambios en base de datos
- Nuevo modelo `Movimiento` (artículo, nivel origen, nivel destino, usuario, cantidad, notas)
- Enum `TipoNotificacion` extendido con `MOVIMIENTO_COMPONENTE`
- Relaciones `movimientosOrigen` / `movimientosDestino` en `Nivel`

#### Nuevos endpoints
- `POST /api/movimientos` — transacción atómica: reasigna lotes, actualiza `ArticuloNivel`, crea `Movimiento` y `AuditLog`, notifica a propietarios de apartados afectados
- `GET /api/reportes/movimientos` — filtros: fecha, artículo, origen, destino, usuario; paginación 50/página; exportación Excel

#### Nuevos componentes
- `MoverComponenteModal` — dropdowns en cascada ubicación → nivel; bloquea nivel origen como destino; advertencia si hay apartados afectados
- `UbicacionesBadge` — muestra hasta 2 ubicaciones + overflow "+N más" con tooltip

#### Mejoras UI
- Columna "Ubicación(es)" en catálogo de artículos
- Historial de movimientos en detalle de artículo (últimos 50)
- Reporte de movimientos con filtros y exportación en `/reportes`
- **Sidebar colapsable**: ancho 240 px expandido / 64 px colapsado (solo desktop); transición `200ms ease-in-out`; estado persistido en `localStorage`; iconos `PanelLeftClose` / `PanelLeftOpen`
- Hook `useLocalStorage<T>` genérico

---

### v4.0 — Sistema de temas Light / Dark + tipografía Barlow
**Estado**: Entregado

#### Tipografía
- Reemplazadas fuentes Rajdhani, DM Sans y JetBrains Mono por **Barlow Semi Condensed** (pesos 300, 400, 600, 800)
- Cargada vía `next/font/google` como variable CSS `--font-barlow`
- Clases utilitarias: `.text-headline` (800), `.text-subhead` (300), `.text-body-copy` (300), `.text-body-bold` (600)

#### Sistema de temas
- **Tema Light** (Brand Guide oficial): fondo blanco, primario púrpura `#2E1A47`, acento carmesí `#CE0037`
- **Tema Dark** (industrial cyan existente): fondo `#0A0C0F`, acento `#00D4FF`
- Variables CSS en `:root` (light) y `.dark` para todos los tokens: fondos, bordes, textos, acentos, gradientes, sombras, sidebar, topbar, auth layout
- `ThemeProvider` — contexto con `theme`, `toggleTheme`, `setTheme`; lee `localStorage` en mount; fallback a `prefers-color-scheme`
- `ThemeToggle` — pill 64×28 px con íconos Sun/Moon; transición del thumb 200ms
- Script anti-FOUC inline en `<head>` para aplicar `.dark` antes de la hidratación de React
- `suppressHydrationWarning` en `<html>`

#### Actualización de componentes
- `Sidebar` — usa variables `--sidebar-*` (fondo púrpura en light, negro en dark)
- `Topbar` — usa `--topbar-bg` / `--topbar-border`; `ThemeToggle` agregado antes de `NotificationBell`
- `Badge` — variantes con clases CSS `badge-success/warning/danger/info/purple/cyan` vía `color-mix()`
- `globals.css` — eliminado `@import` de Google Fonts; colores hardcodeados migrados a `color-mix()` en toda la app
- Auth layout — fondo `--auth-layout-bg` (gradiente oscuro de marca en light, sólido en dark)
- Login — card blanca en light / glass en dark; `ThemeToggle` en esquina superior derecha
- Hook `useChartColors` para futuros componentes Recharts

---

### v5.0 — Vista de almacén: grilla de niveles
**Estado**: Entregado

#### Cambios
- **Terminología**: "Pasillo" renombrado a **"Fila"** en toda la aplicación
- **Niveles por defecto**: `nivelesCount` cambiado de 1 a **6** en schema y en la API
- **Nomenclatura de niveles**: `N1` → `N-1`, `N-2`… en la interfaz
- **`UbicacionCard` rediseñado**: muestra grilla 3×2 con un tile por nivel
  - Dot de color: verde (≥ 3 tipos), ámbar (1–2 tipos), rojo (vacío)
  - Etiqueta `N-1` … `N-6`
  - Contador de **artículos distintos** con stock > 0 (no total de piezas)
- **Script `prisma/add-niveles.ts`**: actualiza ubicaciones existentes añadiendo los niveles faltantes hasta llegar a 6
- **Fix hidratación** `useLocalStorage`: inicializa siempre con `initialValue` (server-safe) y sincroniza desde `localStorage` en `useEffect`, eliminando el error de mismatch entre servidor y cliente

---

### v6.0 — Modal de almacén en tabla + búsqueda por artículo
**Estado**: Entregado

#### Cambios
- **`UbicacionDetailModal` — panel derecho convertido a tabla**: columnas Artículo (thumbnail + nombre), Marca, Apartado, Disponible (con subtext "de total"), Unidad y Acciones (Apartar, Mover). Filas alternadas con `--bg-primary` / `--bg-secondary`.
- **Búsqueda en almacén por artículo**: el filtro de la vista de almacén pasó de buscar por nombre de ubicación a buscar por **nombre de artículo o marca** en cualquier nivel de cualquier ubicación.
  - Implementado con `useMemo` que genera un `Set<string>` de IDs de niveles con coincidencias
  - Todas las ubicaciones permanecen visibles (sin filtrado): las que no tienen coincidencias se atenúan a `opacity: 0.4`
  - Las tarjetas con coincidencia reciben borde de acento; los tiles de nivel coincidentes pulsan con animación CSS
  - Animación `@keyframes tile-match` en `globals.css`: fondo oscila entre 18% y 32% de `--accent-primary` (puro CSS, sin re-renders)
  - Mensaje "No se encontraron artículos" cuando la búsqueda no retorna ningún nivel

---

## Pendientes / Backlog

> Funcionalidades discutidas o detectadas pero aún no implementadas.

| # | Descripción | Prioridad |
|---|---|---|
| — | — | — |

---

## Deploy

| Entorno | URL | Plataforma |
|---|---|---|
| Producción | Por configurar | Railway |
| Repositorio | https://github.com/noratosergio36-code/almacen | GitHub |

### Variables de entorno requeridas en producción

```
DATABASE_URL        → PostgreSQL (Railway provee ${{Postgres.DATABASE_URL}})
NEXTAUTH_URL        → https://dominio.up.railway.app
NEXTAUTH_SECRET     → openssl rand -base64 32
NODE_ENV            → production
```

### Variables opcionales

```
RESEND_API_KEY / RESEND_FROM_EMAIL   → notificaciones por correo
TELEGRAM_BOT_TOKEN                   → notificaciones Telegram
CLOUDINARY_*                         → subida de imágenes de artículos
```
