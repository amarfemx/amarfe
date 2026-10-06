# 🌹 AMar Fe / ToLove Faith

> **Flores & Regalos con propósito amoroso y tracking en tiempo real estilo Uber.**  
> *Flowers & Gifts with loving purpose and Uber-style realtime delivery tracking.*

## 📌 Resumen del Proyecto / Project Overview

AMar Fe (**ToLove Faith** en inglés) es una plataforma marketplace bajo demanda para el envío de ramos florales prémium, cajas de regalo artesanales, dedicatorias personalizadas y detalles para ocasiones especiales (**Amor, Amistad, Aniversario, Cumpleaños, Perdón**), con despacho y seguimiento en vivo por GPS de repartidores.

### Arquitectura de Solución Acordada

1. **Apps Móviles (Flutter - `apps/mobile/`):**
   - **Cliente:** Experiencia visual cuidada, selección por ocasiones, dedicatoria de tarjetas y tracking en vivo.
   - **Repartidor:** Toggle de disponibilidad online/offline, recepción de pedidos, navegación y confirmación con foto.
   - **Clean Architecture & Repository Pattern:** Código 100% desacoplado. La UI se comunica con contratos abstractos (`CatalogRepository`, `OrderRepository`), permitiendo migrar de Supabase a NestJS en el futuro sin modificar la interfaz de usuario.
   - **i18n Nativo:** Soporte bilingüe completo (Español / Inglés).

2. **Plataforma Web (Next.js 15 - `apps/web/`):**
   - **Landing Page & Catálogo:** Descubrimiento, carrito y demostrador de tracking GPS.
   - **Portal Floristería:** Display para taller de floristas (nuevos pedidos, en preparación, listos para repartidor).
   - **Panel Admin:** Centro de control de operaciones, flota de reparto y métricas en CDMX, GDL y MTY.

3. **Base de Datos & Backend (Supabase PostgreSQL - `supabase/`):**
   - Soporte multi-país y multi-moneda (`countries`, `cities`, `delivery_zones`).
   - Extensiones `uuid-ossp` y `postgis` para zonas de entrega y geolocalización.
   - Tablas relacionales para floristerías, productos con tags de ocasión, pedidos, tracking por GPS e historial de estados.
   - Políticas de seguridad por fila (Row Level Security - RLS).

## 📂 Estructura del Repositorio

```text
AMarFe/
├── apps/
│   ├── mobile/                    # Monorepo / Proyecto Flutter Multi-Rol
│   │   ├── lib/
│   │   │   ├── main_customer.dart # Flavor / Entrada App Clientes
│   │   │   ├── main_courier.dart  # Flavor / Entrada App Repartidores
│   │   │   ├── app_config.dart    # Configuración de roles y endpoints
│   │   │   ├── core/
│   │   │   │   ├── constants/     # Paleta de colores floral y tokens
│   │   │   │   ├── i18n/          # Traducciones es.dart y en.dart + Localizations
│   │   │   │   └── theme/         # Material 3 Light/Dark Theme
│   │   │   └── features/
│   │   │       ├── catalog/       # Clean Architecture (Domain, Data Supabase, UI)
│   │   │       ├── orders/        # Domain, Data & UI de pedidos
│   │   │       └── tracking/      # Lógica de GPS en tiempo real
│   │   └── pubspec.yaml
│   │
│   └── web/                       # Next.js 15 App Router (Landing + Florist + Admin)
│       ├── src/app/
│       │   ├── page.tsx           # Multi-portal (Catálogo, Floristería, Admin, Demo)
│       │   ├── layout.tsx         # Metadatos SEO y tipografía Outfit/Playfair
│       │   └── globals.css        # Sistema de diseño de lujo romántico
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   └── 20260928000000_initial_schema.sql # Esquema Postgres + PostGIS + RLS
│   └── seed.sql                   # Datos iniciales (México, Ciudades, Ocasiones)
│
└── docs/
    └── ARCHITECTURE.md            # Especificación técnica y estrategia de migración
```

## 🚀 Cómo Ejecutar Localmente

### 1. Plataforma Web (Next.js)

```bash
cd apps/web
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con el catálogo de clientes, el portal de floristerías y el panel admin.

### 2. Base de Datos (Supabase)

Puedes aplicar las migraciones directamente en el editor SQL de tu proyecto Supabase o mediante la CLI:

```bash
supabase db push
# O ejecuta supabase/migrations/20260928000000_initial_schema.sql
# seguido de supabase/seed.sql
```

### 3. Apps Móviles (Flutter)

Para ejecutar el rol de **Cliente**:

```bash
cd apps/mobile
flutter run -t lib/main_customer.dart
```

Para ejecutar el rol de **Repartidor**:

```bash
cd apps/mobile
flutter run -t lib/main_courier.dart
```

## 🔄 Hoja de Ruta de Migración a NestJS (Opción A ➔ Opción B)

Cuando el volumen de transacciones justifique microservicios o colas complejas (RabbitMQ/BullMQ):

1. La base de datos PostgreSQL ya es estándar y portable.
2. Los modelos y pantallas en Flutter (`apps/mobile`) **no cambiarán**, gracias a que implementan `CatalogRepository` y `OrderRepository`. Solo se reemplazará la clase de conexión en `apps/mobile/lib/features/*/data/repositories/` de Supabase a llamadas REST con NestJS.
