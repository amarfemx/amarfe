# AMar Fe / ToLove Faith - System Architecture Document

## 1. Overview & Vision

**AMar Fe** (English: **ToLove Faith**) is an on-demand marketplace for high-emotion deliveries (fresh flowers, artisan gift boxes, customized greeting cards, and anniversary packages) with Uber/DiDi-style realtime GPS courier dispatch and tracking.

## 2. Platform Topology

```
+--------------------------------------------------------------------------+
|                            CLIENT PLATFORMS                              |
+------------------------------------+-------------------------------------+
|      Flutter Mobile Apps           |        Next.js 15 Web Platform      |
|  - Customer App (iOS & Android)    |  - Public Marketing Landing         |
|  - Courier App (GPS & Dispatch)    |  - Florist Merchant Portal          |
|                                    |  - Super-Admin Backoffice           |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                    DATA & APPLICATION LAYER (SUPABASE)                   |
|                                                                          |
|  - Supabase Auth (Phone OTP, Email, Apple Sign-in, Google Auth)          |
|  - PostgreSQL with PostGIS extension (Geo-queries, Zones)                |
|  - Supabase Storage (Flower photos, delivery proof receipts)             |
|  - Supabase Realtime Channels (Broadcast for Courier GPS tracking)       |
|  - Edge Functions (TypeScript) -> Webhook listeners & payment processing |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                         THIRD PARTY INTEGRATIONS                         |
|  - Stripe Connect & Mercado Pago (Payments & Commissions)                |
|  - Google Maps Platform / Mapbox (Routes, Polylines, Distance Matrix)   |
|  - Firebase Cloud Messaging (Push notifications multi-language)          |
+--------------------------------------------------------------------------+
```

## 3. Clean Architecture in Flutter (`apps/mobile`)

The mobile codebase is structured to decouple UI presentation from underlying database SDKs:

```
apps/mobile/lib/
├── app_config.dart                  # Multi-flavor (Customer vs Courier, API keys)
├── core/
│   ├── constants/app_colors.dart    # Brand palette (Rose, Rose Gold, Champagne)
│   ├── errors/failure.dart          # Standardized error handling
│   ├── i18n/                        # ES and EN translations with AppLocalizations
│   ├── network/                     # Network clients
│   └── theme/app_theme.dart         # Material 3 light/dark themes
└── features/
    ├── catalog/
    │   ├── domain/                  # Pure Dart Entities & Repository Interfaces
    │   │   ├── entities/product.dart
    │   │   ├── entities/florist.dart
    │   │   └── repositories/catalog_repository.dart
    │   ├── data/                    # Supabase or REST implementations
    │   │   └── repositories/catalog_repository_impl.dart
    │   └── presentation/            # Flutter Widgets & BLoC state
    │       └── screens/catalog_home_screen.dart
    └── orders/
        ├── domain/entities/order.dart
        ├── domain/repositories/order_repository.dart
        └── presentation/screens/courier_home_screen.dart
```

### The NestJS Migration Strategy

Because presentation code **only** talks to `CatalogRepository` and `OrderRepository` abstract contracts:

- Current implementation: `CatalogRepositoryImpl` uses `supabase_flutter`.
- Future migration to NestJS: Simply create `NestJsCatalogRepositoryImpl` using `Dio` for REST API endpoints (`/api/v1/products`).
- **Zero changes** to screens, widgets, or state management required.

## 4. Multi-Country & Internationalization (i18n)

1. **Database-level i18n**:
   - Products store `title_es`, `title_en`, `description_es`, `description_en`.
   - Occasions store `name_es`, `name_en`.
   - Countries table stores currency (`MXN`, `USD`) and phone dial codes (`+52`, `+1`).
2. **App-level i18n**:
   - Spanish (`es-MX`) as primary locale.
   - English (`en-US`) fully supported with instant locale switcher.
