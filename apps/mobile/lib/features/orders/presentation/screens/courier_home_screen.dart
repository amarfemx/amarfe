import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/theme_controller.dart';
import '../../../../core/i18n/app_localizations.dart';
import '../../../../core/services/location_tracking_service.dart';

class CourierHomeScreen extends StatefulWidget {
  final VoidCallback onToggleLanguage;
  final String currentLocale;

  const CourierHomeScreen({
    super.key,
    required this.onToggleLanguage,
    required this.currentLocale,
  });

  @override
  State<CourierHomeScreen> createState() => _CourierHomeScreenState();
}

class _CourierHomeScreenState extends State<CourierHomeScreen> {
  bool _isOnline = true;
  String _activeStep = 'available'; // 'available', 'assigned', 'in_transit', 'delivered'
  bool _isEmittingGps = false;
  bool _simulateMode = false;

  @override
  void dispose() {
    LocationTrackingService.instance.stopTracking();
    super.dispose();
  }

  void _handleAcceptOrder() {
    setState(() {
      _activeStep = 'assigned';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('¡Pedido asignado! Dirígete a la floristería para recoger el ramo.'),
        backgroundColor: AppColors.primaryDeepRose,
      ),
    );
  }

  void _handleStartTransit() async {
    setState(() {
      _activeStep = 'in_transit';
      _isEmittingGps = true;
    });

    await LocationTrackingService.instance.startTracking(
      'AMF-2026-9021',
      simulate: _simulateMode,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡En ruta GPS! Transmitiendo coordenadas satelitales en vivo a Supabase.'),
          backgroundColor: AppColors.primaryRose,
        ),
      );
    }
  }

  void _handleDeliverOrder() async {
    await LocationTrackingService.instance.stopTracking();
    setState(() {
      _activeStep = 'delivered';
      _isEmittingGps = false;
    });
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: AppColors.success),
            SizedBox(width: 8),
            Text('¡Entrega Exitosa!'),
          ],
        ),
        content: const Text(
          'Felicidades, has entregado una sonrisa con amor.\nGanancia acreditada: \$95.00 MXN.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _activeStep = 'available';
              });
            },
            child: const Text('Aceptar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tr = (String k) => context.tr(k);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          tr('courier_app_name'),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          IconButton(
            tooltip: 'Modo Oscuro / Claro',
            icon: Icon(
              isDark ? Icons.light_mode : Icons.dark_mode_outlined,
              color: isDark ? AppColors.amberGold : AppColors.primaryDeepRose,
            ),
            onPressed: () => ThemeController.instance.toggleTheme(),
          ),
          IconButton(
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primaryRose),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                widget.currentLocale.toUpperCase(),
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryRose),
              ),
            ),
            onPressed: widget.onToggleLanguage,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Online Toggle Switch Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: _isOnline ? AppColors.success.withOpacity(0.15) : Colors.grey.withOpacity(0.2),
                    child: Icon(
                      _isOnline ? Icons.two_wheeler : Icons.power_settings_new,
                      color: _isOnline ? AppColors.success : Colors.grey,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isOnline ? 'Conectado y Disponible' : 'Desconectado',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          _isOnline 
                              ? (_isEmittingGps ? '🟢 Emitiendo GPS en vivo a Supabase' : 'Listo para despachos en tu zona')
                              : 'Activa el interruptor para comenzar',
                          style: TextStyle(
                            fontSize: 12, 
                            color: _isEmittingGps ? AppColors.success : Colors.grey,
                            fontWeight: _isEmittingGps ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: _isOnline,
                    activeColor: AppColors.primaryRose,
                    onChanged: (val) => setState(() => _isOnline = val),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Daily Stats Row
          Row(
            children: [
              Expanded(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      children: [
                        const Text('Ganancias Hoy', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 4),
                        Text(
                          '\$380.00 MXN',
                          style: TextStyle(
                            fontSize: 18, 
                            fontWeight: FontWeight.bold, 
                            color: isDark ? Colors.white : AppColors.primaryDeepRose,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      children: [
                        const Text('Entregas Hoy', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 4),
                        Text(
                          '4 órdenes',
                          style: TextStyle(
                            fontSize: 18, 
                            fontWeight: FontWeight.bold, 
                            color: isDark ? Colors.white : AppColors.primaryDeepRose,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Section Header
          Text(
            _isOnline ? 'Pipeline de Entrega Activa' : 'Historial de Pedidos',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          // Active Order Dispatch Card
          if (_isOnline) ...[
            // Telemetry & GPS Broadcast Status
            ValueListenableBuilder<String>(
              valueListenable: LocationTrackingService.instance.trackingStatusNotifier,
              builder: (context, statusText, _) {
                final isTransmitting = LocationTrackingService.instance.isTracking;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isTransmitting ? AppColors.success.withOpacity(0.12) : Colors.black.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isTransmitting ? AppColors.success.withOpacity(0.4) : Colors.grey.withOpacity(0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isTransmitting ? Icons.satellite_alt : Icons.location_off,
                        color: isTransmitting ? AppColors.success : Colors.grey,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          statusText,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isTransmitting ? FontWeight.bold : FontWeight.normal,
                            color: isTransmitting ? AppColors.success : Colors.grey,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _simulateMode = !_simulateMode;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: _simulateMode ? AppColors.primaryRose.withOpacity(0.15) : Colors.grey.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: _simulateMode ? AppColors.primaryRose : Colors.transparent,
                            ),
                          ),
                          child: Text(
                            _simulateMode ? 'Simulador CDMX' : 'GPS Real',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: _simulateMode ? AppColors.primaryRose : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
                side: BorderSide(
                  color: _activeStep == 'in_transit' ? AppColors.primaryRose : AppColors.borderLight,
                  width: _activeStep == 'in_transit' ? 2 : 1,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Pedido #AMF-2026-9021',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.primaryDeepRose),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Ganancia: \$95.00 MXN',
                            style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Stage status badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _activeStep == 'in_transit' ? Colors.blue.withOpacity(0.1) : AppColors.primaryRose.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _activeStep == 'available'
                            ? '● Listo para Recolección en Floristería'
                            : (_activeStep == 'assigned'
                                ? '● En camino a recoger flores'
                                : '● En ruta al destinatario (GPS Activo)'),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _activeStep == 'in_transit' ? Colors.blue : AppColors.primaryRose,
                        ),
                      ),
                    ),
                    const Divider(height: 24),

                    // Store Info
                    const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.storefront, size: 20, color: AppColors.primaryRose),
                        SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Florería Pétalos de Fe (Polanco)',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              Text(
                                'Av. Presidente Masaryk 110 (A 800m de ti)',
                                style: TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Destination Info
                    const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.location_pin, size: 20, color: AppColors.accentRoseGold),
                        SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Destino: Sofía R. (Recepción Sorpresa)',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              Text(
                                'Campos Elíseos 180, Torre B, Piso 5 (A 2.1 km)',
                                style: TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Interactive Action Button according to pipeline step
                    if (_activeStep == 'available')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.handshake),
                          label: const Text('Aceptar Entrega (\$95.00 MXN)'),
                          onPressed: _handleAcceptOrder,
                        ),
                      )
                    else if (_activeStep == 'assigned')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.two_wheeler),
                          label: const Text('Confirmar Recolección y Salir a Ruta'),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryDeepRose),
                          onPressed: _handleStartTransit,
                        ),
                      )
                    else if (_activeStep == 'in_transit')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.camera_alt),
                          label: const Text('Completar Entrega & Subir Foto'),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                          onPressed: _handleDeliverOrder,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
