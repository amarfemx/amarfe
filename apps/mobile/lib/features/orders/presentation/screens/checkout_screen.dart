import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/entities/order.dart';
import '../../data/repositories/order_repository_impl.dart';
import '../widgets/native_payment_sheet.dart';
import 'order_confirmation_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final OrderEntity orderDraft;

  const CheckoutScreen({super.key, required this.orderDraft});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final OrderRepositoryImpl _repository = OrderRepositoryImpl();
  bool _isProcessing = false;
  String _selectedPaymentMethod = 'google_pay';
  double _tipCourier = 20.0;

  double get _deliveryFee => 69.0;
  double get _platformFee => 39.0;
  double get _subtotal => widget.orderDraft.subtotal;
  double get _grandTotal => _subtotal + _deliveryFee + _platformFee + _tipCourier;

  Future<void> _handlePayment() async {
    // 1. If a digital wallet is chosen, prompt the native biometric sheet first
    if (_selectedPaymentMethod == 'apple_pay' || _selectedPaymentMethod == 'google_pay') {
      final walletType = _selectedPaymentMethod == 'apple_pay'
          ? NativeWalletType.applePay
          : NativeWalletType.googlePay;

      final result = await NativePaymentSheet.show(
        context: context,
        walletType: walletType,
        amount: _grandTotal,
        recipientName: widget.orderDraft.recipientName,
      );

      if (result == null || !result.success) {
        // User dismissed sheet or auth cancelled
        return;
      }
    }

    setState(() => _isProcessing = true);

    try {
      // Assemble final complete order
      final finalOrder = OrderEntity(
        id: widget.orderDraft.id,
        orderCode: widget.orderDraft.orderCode,
        customerId: widget.orderDraft.customerId,
        floristId: widget.orderDraft.floristId,
        status: OrderStatus.placed,
        subtotal: _subtotal,
        deliveryFee: _deliveryFee,
        tipCourier: _tipCourier,
        total: _grandTotal,
        currency: 'MXN',
        recipientName: widget.orderDraft.recipientName,
        recipientPhone: widget.orderDraft.recipientPhone,
        deliveryAddress: widget.orderDraft.deliveryAddress,
        deliveryLat: widget.orderDraft.deliveryLat,
        deliveryLng: widget.orderDraft.deliveryLng,
        cardMessage: widget.orderDraft.cardMessage,
        cardSenderName: widget.orderDraft.cardSenderName,
        isAnonymous: widget.orderDraft.isAnonymous,
        scheduledFor: widget.orderDraft.scheduledFor,
        createdAt: DateTime.now(),
        items: widget.orderDraft.items,
      );

      // Execute order creation in repository (persists to Supabase or offline cache)
      final created = await _repository.createOrder(finalOrder);

      // Brief confirmation pause
      await Future.delayed(const Duration(milliseconds: 600));

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrderConfirmationScreen(order: created),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al procesar el pago: $e'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Finalizar Pedido'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Summary Header
            _buildOrderItemsCard(),
            const SizedBox(height: 20),

            // Dedication Stationery Card Preview
            _buildStationeryPreview(),
            const SizedBox(height: 20),

            // Courier Tip Selector
            _buildCourierTipSection(),
            const SizedBox(height: 20),

            // Payment Method Selection
            _buildPaymentMethodSection(),
            const SizedBox(height: 20),

            // Cost Breakdown Card
            _buildPriceBreakdownCard(),
            const SizedBox(height: 24),

            // Trust & Security Badges
            _buildTrustBadges(),
            const SizedBox(height: 28),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _handlePayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _selectedPaymentMethod == 'google_pay' || _selectedPaymentMethod == 'apple_pay'
                      ? Colors.black87
                      : (_selectedPaymentMethod == 'mercadopago' ? const Color(0xFF009EE3) : AppColors.primaryRose),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 4,
                ),
                child: _isProcessing
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          ),
                          SizedBox(width: 12),
                          Text(
                            'Procesando Pago Seguro...',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (_selectedPaymentMethod == 'apple_pay') ...[
                            const Icon(Icons.apple, size: 22),
                            const SizedBox(width: 6),
                            Text(
                              'Pagar con Apple Pay • \$${_grandTotal.toStringAsFixed(2)} MXN',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                          ] else if (_selectedPaymentMethod == 'google_pay') ...[
                            const Icon(Icons.fingerprint, size: 20, color: Color(0xFF4285F4)),
                            const SizedBox(width: 8),
                            Text(
                              'Comprar con GPay • \$${_grandTotal.toStringAsFixed(2)} MXN',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                          ] else ...[
                            const Icon(Icons.lock_outline, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'Pagar \$${_grandTotal.toStringAsFixed(2)} MXN',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderItemsCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.shopping_bag_outlined, color: AppColors.primaryRose, size: 20),
                const SizedBox(width: 8),
                const Text(
                  'Detalle del Encargo Floral',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.warmChampagne.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Artesanal',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDeepRose),
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            ...widget.orderDraft.items.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.primaryRose.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.local_florist, color: AppColors.primaryRose, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                        Text(
                          'Cant: ${item.quantity} x \$${item.unitPrice.toStringAsFixed(0)} MXN',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '\$${item.subtotal.toStringAsFixed(0)} MXN',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildStationeryPreview() {
    final message = widget.orderDraft.cardMessage;
    if (message == null || message.trim().isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5DAC4), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.mail_outline, size: 16, color: Color(0xFF8A6C4A)),
              const SizedBox(width: 6),
              Text(
                widget.orderDraft.isAnonymous
                    ? 'TARJETA DE DEDICATORIA ANÓNIMA'
                    : 'TARJETA DE DEDICATORIA PERSONALIZADA',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.6,
                  color: Color(0xFF8A6C4A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '"$message"',
            style: const TextStyle(
              fontSize: 13,
              fontStyle: FontStyle.italic,
              color: Color(0xFF3E3224),
              height: 1.35,
            ),
          ),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              widget.orderDraft.isAnonymous
                  ? '— Admirador Secreto 🌹'
                  : '— ${widget.orderDraft.cardSenderName ?? "Remitente"}',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF6B5841)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourierTipSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Reconoce a tu Mensajero Floral (Propina)',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'El 100% de esta propina va directamente al repartidor en automóvil climatizado.',
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        const SizedBox(height: 10),
        Row(
          children: [0.0, 20.0, 35.0, 50.0].map((tip) {
            final isSelected = _tipCourier == tip;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ChoiceChip(
                  label: Center(
                    child: Text(
                      tip == 0.0 ? 'Sin propina' : '+\$${tip.toStringAsFixed(0)}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? Colors.white : null,
                      ),
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: AppColors.primaryRose,
                  onSelected: (_) => setState(() => _tipCourier = tip),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPaymentMethodSection() {
    final methods = [
      {'id': 'google_pay', 'label': 'Google Pay (Biométrico)', 'icon': Icons.fingerprint, 'tag': 'GPay'},
      {'id': 'apple_pay', 'label': 'Apple Pay (Face ID)', 'icon': Icons.apple, 'tag': 'Pay'},
      {'id': 'stripe_card', 'label': 'Tarjeta de Crédito / Débito', 'icon': Icons.credit_card, 'tag': 'Stripe'},
      {'id': 'mercadopago', 'label': 'Mercado Pago Checkout', 'icon': Icons.account_balance_wallet, 'tag': 'Latam'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Método de Pago Seguro',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        ...methods.map((m) {
          final isSelected = _selectedPaymentMethod == m['id'];
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSelected ? AppColors.primaryRose : Colors.grey.withOpacity(0.25),
                width: isSelected ? 2 : 1,
              ),
              color: isSelected ? AppColors.primaryRose.withOpacity(0.04) : null,
            ),
            child: ListTile(
              onTap: () => setState(() => _selectedPaymentMethod = m['id'] as String),
              leading: Icon(
                m['icon'] as IconData,
                color: isSelected ? AppColors.primaryRose : Colors.grey.shade700,
              ),
              title: Text(
                m['label'] as String,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                ),
              ),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  m['tag'] as String,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildPriceBreakdownCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            _buildCostRow('Subtotal arreglo floral', '\$${_subtotal.toStringAsFixed(2)} MXN'),
            _buildCostRow('Tarjeta caligrafiada artesanal', 'GRATIS', isPromo: true),
            _buildCostRow('Envío express con chofer', '\$${_deliveryFee.toStringAsFixed(2)} MXN'),
            _buildCostRow('Garantía emocional & plataforma', '\$${_platformFee.toStringAsFixed(2)} MXN'),
            if (_tipCourier > 0)
              _buildCostRow('Propina voluntaria repartidor', '\$${_tipCourier.toStringAsFixed(2)} MXN'),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Final a Pagar',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  '\$${_grandTotal.toStringAsFixed(2)} MXN',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.primaryRose,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCostRow(String title, String amount, {bool isPromo = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, color: Colors.grey)),
          Text(
            amount,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isPromo ? AppColors.successGreen : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustBadges() {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _TrustBadge(icon: Icons.shield, label: 'Pago Seguro 256-bit'),
        _TrustBadge(icon: Icons.local_shipping, label: 'Envío Climatizado'),
        _TrustBadge(icon: Icons.favorite, label: 'Flores 100% Frescas'),
      ],
    );
  }
}

class _TrustBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _TrustBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppColors.primaryRose.withOpacity(0.8)),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
