import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/theme_controller.dart';
import '../../../orders/domain/entities/order.dart';

class OrderTrackingScreen extends StatefulWidget {
  final OrderEntity order;

  const OrderTrackingScreen({super.key, required this.order});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  // CDMX Route coordinates: Florería (Reforma 222) -> Destino (Polanco)
  final List<Offset> _routeCoordinates = const [
    Offset(19.4295, -99.1619), // Floristería Pétalos de Fe
    Offset(19.4312, -99.1678), // Diana Cazadora
    Offset(19.4265, -99.1755), // Estela de Luz
    Offset(19.4278, -99.1832), // Auditorio Nacional
    Offset(19.4326, -99.1915), // Campos Elíseos
    Offset(19.4348, -99.1950), // Horacio (Destino de Entrega)
  ];

  late Timer _telemetryTimer;
  int _currentStepIndex = 0;
  double _fractionToNext = 0.0;
  double _currentLat = 19.4295;
  double _currentLng = -99.1619;
  double _currentSpeedKmH = 34.0;
  int _etaMinutes = 18;

  @override
  void initState() {
    super.initState();
    _startSimulatedGpsMovement();
  }

  @override
  void dispose() {
    _telemetryTimer.cancel();
    super.dispose();
  }

  void _startSimulatedGpsMovement() {
    _telemetryTimer = Timer.periodic(const Duration(milliseconds: 1500), (timer) {
      if (!mounted) return;

      setState(() {
        _fractionToNext += 0.25;
        if (_fractionToNext >= 1.0) {
          _fractionToNext = 0.0;
          if (_currentStepIndex < _routeCoordinates.length - 2) {
            _currentStepIndex++;
          }
        }

        final pA = _routeCoordinates[_currentStepIndex];
        final pB = _routeCoordinates[_currentStepIndex + 1];

        _currentLat = pA.dx + (pB.dx - pA.dx) * _fractionToNext;
        _currentLng = pA.dy + (pB.dy - pA.dy) * _fractionToNext;

        // Dynamic speed & ETA calculation
        _currentSpeedKmH = 28.0 + Random().nextDouble() * 15.0;
        final remainingSteps = (_routeCoordinates.length - 1 - _currentStepIndex);
        _etaMinutes = max(3, (remainingSteps * 3.5).round());
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final palette = ThemeController.instance.currentPaletteData;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Rastreo GPS en Vivo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text(
              'Orden: ${widget.order.orderCode}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.success.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.success.withOpacity(0.3)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.satellite_alt, size: 14, color: AppColors.success),
                SizedBox(width: 4),
                Text(
                  'GPS Activo',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.success),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Interactive Map View / Vector Route Rendering
          Positioned.fill(
            child: _buildInteractiveMapView(palette),
          ),

          // Top Floating Status Card
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: _buildTopEtaCard(palette),
          ),

          // Bottom Floating Courier Sheet
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: _buildCourierBottomSheet(palette),
          ),
        ],
      ),
    );
  }

  Widget _buildTopEtaCard(PaletteData palette) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor.withOpacity(0.95),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: palette.primary.withOpacity(0.25)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: palette.primary.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.timer_outlined, color: palette.primary, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'TIEMPO ESTIMADO DE LLEGADA',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.6, color: Colors.grey),
                ),
                Text(
                  'Llegando en ~$_etaMinutes minutos',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: palette.primary),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: palette.primary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.speed, size: 14, color: Colors.white),
                const SizedBox(width: 4),
                Text(
                  '${_currentSpeedKmH.toStringAsFixed(0)} km/h',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourierBottomSheet(PaletteData palette) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: palette.primary.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: palette.primary.withOpacity(0.15),
                child: const Icon(Icons.person, size: 32, color: AppColors.primaryRose),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Text(
                          'Carlos Mendoza',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(width: 6),
                        Icon(Icons.verified, size: 16, color: Colors.blue),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.amber),
                        const SizedBox(width: 3),
                        const Text('4.97 (280 entregas)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 8),
                        Text('• Auto Climatizado', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton.filledTonal(
                icon: const Icon(Icons.phone),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Llamando al mensajero de forma segura...')),
                  );
                },
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Destino:', style: TextStyle(fontSize: 11, color: Colors.grey)),
                  Text(
                    widget.order.deliveryAddress,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade300),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.ac_unit, size: 14, color: Colors.teal),
                    SizedBox(width: 4),
                    Text('Climatizado', style: TextStyle(fontSize: 11, color: Colors.teal, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInteractiveMapView(PaletteData palette) {
    return CustomPaint(
      painter: _RouteMapPainter(
        route: _routeCoordinates,
        courierLat: _currentLat,
        courierLng: _currentLng,
        paletteColor: palette.primary,
        isDark: Theme.of(context).brightness == Brightness.dark,
      ),
      child: Container(),
    );
  }
}

class _RouteMapPainter extends CustomPainter {
  final List<Offset> route;
  final double courierLat;
  final double courierLng;
  final Color paletteColor;
  final bool isDark;

  _RouteMapPainter({
    required this.route,
    required this.courierLat,
    required this.courierLng,
    required this.paletteColor,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Map background color
    final bgPaint = Paint()..color = isDark ? const Color(0xFF141923) : const Color(0xFFF3F5F8);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Decorative grid/streets lines
    final streetPaint = Paint()
      ..color = isDark ? const Color(0xFF222B3D) : const Color(0xFFE2E7ED)
      ..strokeWidth = 2.0;

    for (double y = 40; y < size.height; y += 60) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y + 20), streetPaint);
    }
    for (double x = 40; x < size.width; x += 80) {
      canvas.drawLine(Offset(x, 0), Offset(x - 20, size.height), streetPaint);
    }

    // Coordinate conversion mapping
    final minLat = 19.4240;
    final maxLat = 19.4370;
    final minLng = -99.1980;
    final maxLng = -99.1590;

    Offset toScreen(double lat, double lng) {
      final normX = (lng - minLng) / (maxLng - minLng);
      final normY = 1.0 - (lat - minLat) / (maxLat - minLat);
      return Offset(
        size.width * 0.15 + normX * (size.width * 0.7),
        size.height * 0.2 + normY * (size.height * 0.55),
      );
    }

    // Draw Route Polyline
    final path = Path();
    for (int i = 0; i < route.length; i++) {
      final screenPt = toScreen(route[i].dx, route[i].dy);
      if (i == 0) {
        path.moveTo(screenPt.dx, screenPt.dy);
      } else {
        path.lineTo(screenPt.dx, screenPt.dy);
      }
    }

    // Outer glow for route
    final routeGlowPaint = Paint()
      ..color = paletteColor.withOpacity(0.3)
      ..strokeWidth = 10.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, routeGlowPaint);

    // Main route line
    final routePaint = Paint()
      ..color = paletteColor
      ..strokeWidth = 4.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, routePaint);

    // Origin Pin (Florería)
    final originPt = toScreen(route.first.dx, route.first.dy);
    canvas.drawCircle(originPt, 9, Paint()..color = Colors.white);
    canvas.drawCircle(originPt, 7, Paint()..color = Colors.deepOrange);

    // Destination Pin (Casa del amor)
    final destPt = toScreen(route.last.dx, route.last.dy);
    canvas.drawCircle(destPt, 11, Paint()..color = Colors.white);
    canvas.drawCircle(destPt, 8, Paint()..color = paletteColor);

    // Animated Courier Marker
    final courierPt = toScreen(courierLat, courierLng);

    // Pulsing circle
    canvas.drawCircle(courierPt, 22, Paint()..color = paletteColor.withOpacity(0.25));
    canvas.drawCircle(courierPt, 14, Paint()..color = Colors.white);
    canvas.drawCircle(courierPt, 10, Paint()..color = paletteColor);

    // Heading Arrow icon indicator
    final headingPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.0;
    canvas.drawLine(courierPt, Offset(courierPt.dx + 4, courierPt.dy - 6), headingPaint);
  }

  @override
  bool shouldRepaint(covariant _RouteMapPainter oldDelegate) {
    return oldDelegate.courierLat != courierLat ||
        oldDelegate.courierLng != courierLng ||
        oldDelegate.paletteColor != paletteColor ||
        oldDelegate.isDark != isDark;
  }
}
