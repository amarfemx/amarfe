# 📱 AMar Fe Mobile (Flutter) — Plan de Trabajo & Roadmap

## 📌 Estado Actual del Proyecto (Avances Completados)

### 🧱 Arquitectura y Configuración Base

- [x] **Estructura Multi-Flavor por Roles (`app_config.dart`)**:
  - `main_customer.dart`: App para clientes y compradores.
  - `main_courier.dart`: App para repartidores y couriers.
- [x] **Sistema de Diseño y Selector de Temas (`theme_controller.dart`)**:
  - Modo Claro (*Romantic Champagne*) y Modo Oscuro (*Velvet Noir*) con persistencia en `SharedPreferences`.
  - Toggle instantáneo con icono en AppBar.
- [x] **Internacionalización Bilingüe (`AppLocalizations`)**:
  - Soporte para Español (MX) e Inglés (US) con cambio de idioma dinámico sin reiniciar la app.
- [x] **Conexión Supabase (`supabase_service.dart`)**:
  - Inicialización centralizada con flujo PKCE.

### 🛍️ Módulo Cliente (Customer App)

- [x] **Catálogo Floral y Ocasiones (`catalog_home_screen.dart`)**:
  - Filtro por ocasiones (*Amor*, *Amistad*, *Aniversario*, *Perdón*).
  - Búsqueda en vivo y visualización de tiempo de preparación y calificación de floristerías.
  - Selector de dirección de entrega.
  - Navegación directa con un toque hacia la personalización de pedidos.
- [x] **Editor de Dedicatoria Emocional & Remitente (`order_customization_screen.dart`)**:
  - Plantillas de inspiración sentimental (*🌹 Amor*, *🕊️ Pedir Perdón*, *✨ Aniversario*, *💛 Amistad*, *🎂 Cumpleaños*).
  - Campo de mensaje para caligrafía en papelería de algodón con límite de 280 caracteres.
  - Switch de **"Admirador Secreto" (100% Anónimo)** para resguardar la identidad del remitente con misterio romántico.
  - Formulario completo de destinatario (nombre, teléfono de contacto discreto, dirección en CDMX e instrucciones de sorpresa).
  - Selector de entrega inmediata Express (60-90 min) o Programada.
- [x] **Experiencia de Checkout & Métodos de Pago (`checkout_screen.dart`)**:
  - Vista previa de la tarjeta de dedicatoria con diseño de papelería artesanal.
  - Selector interactivo de propina para el chofer ($0, $20, $35, $50 MXN).
  - Métodos de pago (Tarjeta de Crédito/Débito Stripe, Apple/Google Pay, Mercado Pago).
  - Desglose transparente de costos (arreglo, tarjeta gratis, envío climatizado, garantía emocional).
  - Sellos de confianza: Pago Seguro SSL 256-bit, Envío Climatizado, Flores 100% Frescas.
- [x] **Confirmación de Pedido & Seguimiento Satelital (`order_confirmation_screen.dart`)**:
  - Generación de código único `AMF-2026-XXXX` y estado en vivo.
  - Timeline interactivo de 4 pasos (*Pedido pagado*, *Florista creando ramo*, *Mensajero en camino*, *Entrega con foto*).
  - Vista previa de la tarjeta caligrafiada final y resumen de entrega.
- [x] **Repositorio de Pedidos con Supabase y Modo Offline (`order_repository_impl.dart`)**:
  - Implementación completa de `OrderRepository` con inserción en Supabase y streams reactivos.
  - Fallback local robusto para pruebas y desarrollo fluido sin conexión requerida.

### 🛵 Módulo Repartidor (Courier App)

- [x] **Panel Operativo de Despacho (`courier_home_screen.dart`)**:
  - Switch de estado **Conectado / Desconectado** con indicador de estado GPS.
  - Tarjetas de métricas de ingresos del día y total de órdenes entregadas.
  - **Pipeline de Entrega Interactivo de 3 Pasos**:
    1. Aceptar pedido en la zona.
    2. Confirmar recolección en floristería y salir a ruta.
    3. Completar entrega con acreditación de ganancia y captura de foto de evidencia.
- [x] **Servicio de Telemetría GPS en Tiempo Real (`location_tracking_service.dart`)**:
  - Emisión continua de coordenadas GPS (`lat`, `lng`, `heading`, `speed`) mediante `geolocator` con filtro de distancia de 5 metros.
  - Publicación instantánea por canal `order-tracking:{orderId}` en Supabase Realtime Broadcast.
  - Actualización periódica en tabla `couriers` de Supabase (`current_lat`, `current_lng`, `last_location_updated_at`).
  - Modo simulador de ruta CDMX (Polanco ➔ Campos Elíseos) integrado para pruebas en emuladores y desarrollo.
  - Widget de telemetría en vivo con velocímetro e indicador satelital.

## 🚀 Próximos Pasos & Plan de Trabajo (Siguientes Hitos)

### 📍 Renderizado Visual de Google Maps & Telemetría (`order_tracking_screen.dart`)

- [x] **Configuración de Google Maps SDK y Permisos GPS**:
  - `AndroidManifest.xml` con permisos de geolocalización fina, segundo plano y meta-data de API Key.
  - Pantalla interactiva `OrderTrackingScreen` con renderizado de polilínea de ruta en tiempo real, marcador de vehículo en movimiento con orientación, cálculo dinámico de velocidad (km/h) y tiempo estimado de llegada (ETA).
  - Tarjeta flotante con datos del chofer, auto climatizado, calificación y botón de contacto seguro.
  - Botón de acceso directo desde la confirmación de pedidos.

### 🔔 Notificaciones Push en Vivo (FCM) (`notification_service.dart`)

- [x] **Alertas Prioritarias para Repartidores & Clientes**:
  - Servicio centralizado `NotificationService` con inicialización FCM y modelado de payloads.
  - Alerta a repartidores cuando una florería asociada marca un pedido como listo.
  - Alerta de proximidad al cliente cuando el mensajero se encuentra a menos de 500 metros del destino.
  - Alerta de confirmación con fotografía cuando el regalo es entregado.

### 💳 Hito 1: Pagos Nativos Móviles (Apple Pay & Google Pay)

- [x] **Checkout Express con Billeteras Digitales (`NativePaymentSheet`)**:
  - Modal interactivo de autorización biométrica (Face ID para Apple Pay y Huella Digital para Google Pay).
  - Selector de tarjeta tokenizada (Mastercard/Visa), desglose de orden y confirmación criptográfica instantánea.
  - Botones dedicados en checkout con branding oficial dinámico (negro con íconos de Apple y GPay).
  - Integración fluida con el ciclo de vida del pedido y pasarela de pago.

### 📦 Hito 2: Automatización de Compilación Release (Android APK & AAB)

- [x] **Pipeline Gradle Nativo con Android SDK & JDK 17**:
  - `apps/mobile/android/local.properties` enlazado al SDK `/media/eramirez/home_deb12/eramirez/Android/Sdk/`.
  - Configuración Gradle 8.7 con Android Gradle Plugin 8.4, soporte AndroidX y Java 17.
  - Scripts ejecutables automatizados `build_apk.sh` (Release APK) y `build_aab.sh` (Google Play Store Bundle).

### 📦 Hito 3: Cache Offline & Sincronización Local

- [ ] Cache local de catálogo e imágenes con `cached_network_image` y `sqflite` / `isar` para navegación fluida en zonas de baja conectividad móvil.
