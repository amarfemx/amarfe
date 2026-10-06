import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/entities/order.dart';
import '../../../tracking/presentation/screens/order_tracking_screen.dart';

class OrderConfirmationScreen extends StatelessWidget {
  final OrderEntity order;

  const OrderConfirmationScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('¡Pedido Confirmado!'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          children: [
            // Success Icon with Glow
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [AppColors.successGreen, Color(0xFF059669)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.successGreen.withOpacity(0.35),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 52),
            ),
            const SizedBox(height: 20),

            const Text(
              '¡Tu Detalle va en Camino al Corazón!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Hemos notificado a la floristería artesanal. Tu arreglo floral está siendo preparado con flores frescas seleccionadas.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.white70
                    : AppColors.textSecondaryLight,
              ),
            ),
            const SizedBox(height: 24),

            // Order Code & Tracking Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.primaryRose.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primaryRose.withOpacity(0.25)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CÓDIGO DE SEGUIMIENTO',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryRose,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        order.orderCode,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryRose,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.radar, size: 14, color: Colors.white),
                        SizedBox(width: 4),
                        Text(
                          'En Vivo',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Timeline Steps
            _buildTimelineCard(context),
            const SizedBox(height: 20),

            // Dedication Stationery Card Preview
            _buildStationeryPreview(context),
            const SizedBox(height: 20),

            // Delivery Details Summary
            _buildDeliveryDetailsCard(context),
            const SizedBox(height: 32),

            // Action Buttons
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => OrderTrackingScreen(order: order),
                    ),
                  );
                },
                icon: const Icon(Icons.radar, size: 20),
                label: const Text(
                  'Ver Rastreo GPS en Vivo',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryRose,
                  foregroundColor: Colors.white,
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                icon: const Icon(Icons.home_outlined),
                label: const Text(
                  'Volver a la Floristería',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineCard(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Estado de tu Entrega Floral',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildTimelineStep(
              title: '1. Pedido confirmado y pagado',
              subtitle: 'Notificación enviada a la florería asociada',
              isCompleted: true,
              isCurrent: false,
            ),
            _buildTimelineStep(
              title: '2. Creación artesanal de arreglo',
              subtitle: 'Florista seleccionando los tallos más frescos',
              isCompleted: false,
              isCurrent: true,
            ),
            _buildTimelineStep(
              title: '3. Asignación de mensajero climatizado',
              subtitle: 'Rastreo GPS en tiempo real con telemetría',
              isCompleted: false,
              isCurrent: false,
            ),
            _buildTimelineStep(
              title: '4. Entrega y fotografía de confirmación',
              subtitle: 'Sonrisa garantizada a quien lo reciba',
              isCompleted: false,
              isCurrent: false,
              isLast: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineStep({
    required String title,
    required String subtitle,
    required bool isCompleted,
    required bool isCurrent,
    bool isLast = false,
  }) {
    Color iconColor;
    IconData iconData;

    if (isCompleted) {
      iconColor = AppColors.successGreen;
      iconData = Icons.check_circle_rounded;
    } else if (isCurrent) {
      iconColor = AppColors.primaryRose;
      iconData = Icons.radio_button_checked;
    } else {
      iconColor = Colors.grey.shade400;
      iconData = Icons.radio_button_unchecked;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Icon(iconData, size: 20, color: iconColor),
            if (!isLast)
              Container(
                width: 2,
                height: 32,
                color: isCompleted ? AppColors.successGreen : Colors.grey.shade300,
                margin: const EdgeInsets.symmetric(vertical: 2),
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isCurrent || isCompleted ? FontWeight.bold : FontWeight.w500,
                  color: isCurrent ? AppColors.primaryRose : null,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStationeryPreview(BuildContext context) {
    if (order.cardMessage == null || order.cardMessage!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF2),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2D6C0), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.brown.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.favorite, size: 16, color: AppColors.primaryDeepRose),
              const SizedBox(width: 6),
              Text(
                order.isAnonymous ? 'TARJETA DE ADMIRADOR SECRETO' : 'TARJETA DE DEDICATORIA CALIGRAFIADA',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                  color: Color(0xFF6B5841),
                ),
              ),
            ],
          ),
          const Divider(color: Color(0xFFE5DAC4), height: 18),
          Text(
            '"${order.cardMessage}"',
            style: const TextStyle(
              fontSize: 14,
              fontStyle: FontStyle.italic,
              color: Color(0xFF3E3224),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              order.isAnonymous ? '— Tu Admirador Secreto 💌' : '— Con amor, ${order.cardSenderName ?? "Remitente"}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF8A6C4A),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryDetailsCard(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Destino de la Entrega',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildDetailRow(Icons.person_outline, 'Destinatario:', order.recipientName),
            _buildDetailRow(Icons.phone_outlined, 'Teléfono:', order.recipientPhone),
            _buildDetailRow(Icons.location_on_outlined, 'Dirección:', order.deliveryAddress),
            _buildDetailRow(
              Icons.attach_money,
              'Total Pagado:',
              '\$${order.total.toStringAsFixed(2)} ${order.currency}',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppColors.primaryRose),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
