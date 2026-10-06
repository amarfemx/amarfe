# 🌐 AMar Fe Web (Next.js 15) — Plan de Trabajo & Roadmap

## 📌 Estado Actual del Proyecto (Avances Completados)

### 🎨 Arquitectura, Diseño & Temas

- [x] **Next.js 15 App Router + Server Actions + SSR**:
  - Renderizado rápido y SEO optimizado.
- [x] **Sistema de Diseño Romántico, Multi-Paletas & Modo Oscuro (`theme-context.tsx`, `globals.css` & `ThemePaletteSelector.tsx`)**:
  - Selector de 5 paletas de estilo estético con previsualización en vivo:
    - 🌹 *Rosa Terciopelo* (Clásico Romántico)
    - 🪻 *Lavanda & Amatista* (Místico & Elegante)
    - 🍃 *Esmeralda Botánica* (Naturaleza & Lujo)
    - ✨ *Oro Champaña* (Dorado Imperial)
    - 🌊 *Zafiro Serenidad* (Océano & Paz)
  - Modo Claro (*Champagne Romance*) y Modo Oscuro (*Velvet Noir*) con persistencia en `localStorage`.
  - Componente de selector de estilos visuales `ThemePaletteSelector` integrado en el header.
- [x] **Autenticación & Perfiles con Roles (`/login`, `/register`, `UserNav.tsx`)**:
  - Inicio de sesión con Email/Contraseña y botón de Google OAuth.
  - Registro con selector de roles (**Cliente**, **Floristería Asociada**, **Repartidor**).
  - Componente de usuario `UserNav` con menú flotante, enlaces de portal y cierre de sesión.

### 🏪 Portal de Floristerías (`/florist/dashboard`)

- [x] **Kitchen Display System (KDS) & Alertas Sonoras en Vivo (`FloristKDS.tsx`)**:
  - Alerta acústica sintetizada con Web Audio API (timbre concierge de 3 tonos) que suena automáticamente ante nuevos pedidos entrantes.
  - Tablero Kanban KDS en 3 etapas: *Nuevos Pedidos*, *En Preparación*, y *Listos/En Camino*.
  - Modal para subir foto de ramo terminado con Supabase Storage y solicitud inmediata de repartidor.
  - Botón para probar campanilla sonora y selector de silenciado.
- [x] **Gestión de Catálogo y Subida a Supabase Storage**:
  - Formulario de alta de productos con títulos bilingües, ocasión, precio en MXN, minutos de preparación y fotos.
  - Subida directa de imágenes al bucket `products` en Supabase Storage.
- [x] **Control de Stock y Estado de Tienda**:
  - Toggle instantáneo para pausar/activar arreglos florales.
  - Toggle de apertura/cierre de la tienda en tiempo real.

### 💳 Checkout & Tarjeta de Dedicatoria (`/checkout`)

- [x] **Editor de Dedicatoria Emocional**:
  - Plantillas de inspiración para ocasiones sentimentales (*Amor*, *Perdón*, *Aniversario*, *Amistad*).
  - Selector de remitente o envío como *Admirador Secreto (100% Anónimo)*.
- [x] **Logística y Pasarela de Pagos**:
  - Selector de entrega exprés en 60-90 min o programación de fecha/hora.
  - Métodos de pago con Tarjeta (Stripe) y Mercado Pago.
  - Desglose transparente y generación de código de orden `AMF-2026-XXXX`.

### 🛰️ Telemetría Satelital en Vivo (`LiveOrderTracker.tsx`)

- [x] **Suscripción a Supabase Realtime Broadcast**:
  - Canal `order-tracking:{orderCode}` para recibir eventos de posición y cambios de estado en vivo.
  - Barra de progreso de 5 estados con cálculo dinámico de ETA.
  - Mapa de ruta con marcador animado y fotografía de verificación de calidad.

## 🚀 Próximos Pasos & Plan de Trabajo (Siguientes Hitos)

### 📊 Hito 1: Panel Administrativo Nacional (`/admin/dashboard`)

- [ ] **Command Center de Operaciones**:
  - Monitor en tiempo real de pedidos activos en toda la República Mexicana.
  - KPIs financieros: GMV, comisiones acumuladas, tiempo promedio de entrega por ciudad.
  - Aprobación y verificación de nuevas floristerías y repartidores.

### 🔔 Pasarela de Pagos & Webhook Criptográfico (`/api/webhooks/stripe`)

- [x] **Webhook Seguro de Stripe en Producción**:
  - Endpoint de Next.js Route Handler `/api/webhooks/stripe` con verificación criptográfica de cabecera `stripe-signature` y `STRIPE_WEBHOOK_SECRET`.
  - Procesamiento en tiempo real de eventos `payment_intent.succeeded` y `checkout.session.completed`:
    - Actualización atómica en Supabase de `status = 'placed'`, `payment_status = 'completed'`, `payment_transaction_id` y `updated_at`.
    - Activación inmediata del Kitchen Display System (KDS) de floristería mediante Supabase Realtime `postgres_changes` con repique de campana sonora.
  - Gestión de incidencias: `payment_intent.payment_failed` (`payment_status = 'failed'`) y `charge.refunded` (`payment_status = 'refunded'`).
  - Server Action `createStripePaymentIntentAction` para vinculación de metadatos de pedido (`orderId`, `orderCode`, montos en centavos MXN).

## 🚀 Próximos Pasos & Plan de Trabajo (Siguientes Hitos)

### 📊 Hito 1: Panel Administrativo Nacional (`/admin/dashboard`)

- [ ] **Command Center de Operaciones**:
  - Monitor en tiempo real de pedidos activos en toda la República Mexicana.
  - KPIs financieros: GMV, comisiones acumuladas, tiempo promedio de entrega por ciudad.
  - Aprobación y verificación de nuevas floristerías y repartidores.

### 🧾 Facturación Fiscal SAT (CFDI 4.0) (`/checkout/factura`)

- [x] **Módulo de Facturación Electrónica SAT para México**:
  - Página dedicada `/checkout/factura` y Server Action `requestCfdiInvoiceAction`.
  - Validación formal de RFC (física y moral), Código Postal fiscal y Régimen Fiscal (601, 605, 612, 626, 616).
  - Generación de estructura estándar XML CFDI 4.0 con Timbre Fiscal Digital (UUID) y desglose de IVA (16%).
  - Descarga directa de archivo `.xml` y previsualización de factura con código QR del SAT.

### 🔔 Notificaciones Push en Vivo (`/api/notifications/push`)

- [x] **Despachador de Alertas FCM**:
  - Endpoint `/api/notifications/push` para emisión de notificaciones de cambio de estado a repartidores y clientes.

## 🚀 Próximos Pasos & Plan de Trabajo (Siguientes Hitos)

### 📊 Hito 1: Panel Administrativo Nacional (`/admin/dashboard`)

- [x] **Command Center de Operaciones**:
  - Monitor en tiempo real de pedidos activos en toda la República Mexicana.
  - KPIs financieros: GMV, comisiones acumuladas, tiempo promedio de entrega por ciudad.
  - Aprobación y verificación de nuevas floristerías y repartidores.
  - Conciliación de reembolsos y auditoría de pagos.

### 🔔 Hito 2: Webhooks Complementarios de Mercado Pago

- [x] Endpoint `/api/webhooks/mercadopago` con validación de firma HMAC (SHA256) y gestión de pagos mediante IPN / Webhooks de Mercado Pago Checkout Pro.
  - Actualización atómica de órdenes en Supabase (`status`, `payment_status`, `payment_provider`).
  - Compatibilidad dual con `order_code` y UUID.
  - Endpoint diagnóstico `GET /api/webhooks/mercadopago` y verificación de frescura temporal para prevenir ataques de repetición.
