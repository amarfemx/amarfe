import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../catalog/domain/entities/product.dart';
import '../../domain/entities/order.dart';
import 'checkout_screen.dart';

class OrderCustomizationScreen extends StatefulWidget {
  final Product product;
  final String currentLocale;

  const OrderCustomizationScreen({
    super.key,
    required this.product,
    this.currentLocale = 'es',
  });

  @override
  State<OrderCustomizationScreen> createState() => _OrderCustomizationScreenState();
}

class _OrderCustomizationScreenState extends State<OrderCustomizationScreen> {
  final _formKey = GlobalKey<FormState>();

  // Dedication Card
  final TextEditingController _cardMessageController = TextEditingController();
  final TextEditingController _senderNameController = TextEditingController();
  bool _isAnonymous = false;

  // Recipient Information
  final TextEditingController _recipientNameController = TextEditingController();
  final TextEditingController _recipientPhoneController = TextEditingController();
  final TextEditingController _deliveryAddressController =
      TextEditingController(text: 'Av. Horacio 1420, Polanco, CDMX');
  final TextEditingController _deliveryInstructionsController = TextEditingController();

  // Delivery Timing
  String _deliveryTiming = 'express'; // 'express' | 'scheduled'
  DateTime _scheduledDate = DateTime.now().add(const Duration(days: 1));

  final List<Map<String, String>> _emotionalTemplates = [
    {
      'title': '🌹 Amor',
      'text': 'Cada pétalo de estas flores lleva un pedacito de mi corazón para ti. Te amo infinitamente.',
    },
    {
      'title': '🕊️ Pedir Perdón',
      'text': 'Siento profundamente lo sucedido. Estas flores son un sincero abrazo y mi deseo de empezar de nuevo.',
    },
    {
      'title': '✨ Aniversario',
      'text': 'Gracias por cada risa, cada abrazo y cada día juntos. ¡Feliz Aniversario mi amor!',
    },
    {
      'title': '💛 Amistad',
      'text': 'Porque las almas como la tuya iluminan el mundo. ¡Gracias por tu valiosa amistad sincera!',
    },
    {
      'title': '🎂 Cumpleaños',
      'text': 'Que la vida te colme hoy y siempre de sonrisas, salud y hermosos momentos. ¡Feliz Cumpleaños!',
    },
  ];

  @override
  void dispose() {
    _cardMessageController.dispose();
    _senderNameController.dispose();
    _recipientNameController.dispose();
    _recipientPhoneController.dispose();
    _deliveryAddressController.dispose();
    _deliveryInstructionsController.dispose();
    super.dispose();
  }

  void _proceedToCheckout() {
    if (!_formKey.currentState!.validate()) return;

    final subtotal = widget.product.price;
    final orderDraft = OrderEntity(
      id: 'draft_${DateTime.now().millisecondsSinceEpoch}',
      orderCode: 'AMF-DRAFT',
      customerId: 'usr_guest_mobile',
      floristId: widget.product.floristId,
      status: OrderStatus.pendingPayment,
      subtotal: subtotal,
      deliveryFee: 69.0,
      tipCourier: 20.0,
      total: subtotal + 69.0 + 39.0 + 20.0,
      currency: widget.product.currency,
      recipientName: _recipientNameController.text.trim(),
      recipientPhone: _recipientPhoneController.text.trim(),
      deliveryAddress: _deliveryAddressController.text.trim(),
      deliveryLat: 19.4326,
      deliveryLng: -99.1332,
      cardMessage: _cardMessageController.text.trim(),
      cardSenderName: _isAnonymous ? 'Un Admirador Secreto' : _senderNameController.text.trim(),
      isAnonymous: _isAnonymous,
      scheduledFor: _deliveryTiming == 'scheduled' ? _scheduledDate : null,
      createdAt: DateTime.now(),
      items: [
        OrderItem(
          id: 'item_1',
          productId: widget.product.id,
          title: widget.product.getTitle(widget.currentLocale),
          unitPrice: widget.product.price,
          quantity: 1,
        ),
      ],
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CheckoutScreen(orderDraft: orderDraft),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.product.getTitle(widget.currentLocale);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Personalizar Detalle'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Hero Summary
              _buildProductSummary(title),
              const SizedBox(height: 24),

              // Emotional Dedication Card Section
              _buildDedicationSection(),
              const SizedBox(height: 24),

              // Recipient & Address Section
              _buildRecipientSection(),
              const SizedBox(height: 24),

              // Delivery Timing Section
              _buildTimingSection(),
              const SizedBox(height: 32),

              // Bottom Button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  onPressed: _proceedToCheckout,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryRose,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 3,
                  ),
                  icon: const Icon(Icons.arrow_forward),
                  label: Text(
                    'Continuar al Checkout • \$${widget.product.price.toStringAsFixed(0)} ${widget.product.currency}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductSummary(String title) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.primaryRose.withOpacity(0.15)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: widget.product.images.isNotEmpty
                ? Image.network(
                    widget.product.images.first,
                    width: 76,
                    height: 76,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 76,
                      height: 76,
                      color: AppColors.warmChampagne,
                      child: const Icon(Icons.local_florist, color: AppColors.primaryRose),
                    ),
                  )
                : Container(
                    width: 76,
                    height: 76,
                    color: AppColors.warmChampagne,
                    child: const Icon(Icons.local_florist, color: AppColors.primaryRose),
                  ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.storefront, size: 14, color: AppColors.primaryDeepRose),
                    const SizedBox(width: 4),
                    Text(
                      widget.product.floristName ?? 'Floristería Premium',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '\$${widget.product.price.toStringAsFixed(0)} ${widget.product.currency}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    color: AppColors.primaryRose,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDedicationSection() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.edit_note, color: AppColors.primaryRose, size: 22),
                SizedBox(width: 8),
                Text(
                  'Tarjeta de Dedicatoria',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Será caligrafiada a mano en fina papelería de algodón con sello de cera.',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 14),

            // Inspiration Templates
            const Text(
              'Plantillas de inspiración rápida:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _emotionalTemplates.map((template) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: Text(template['title']!),
                      backgroundColor: AppColors.warmChampagne.withOpacity(0.4),
                      side: BorderSide(color: AppColors.primaryRose.withOpacity(0.3)),
                      onPressed: () {
                        setState(() {
                          _cardMessageController.text = template['text']!;
                        });
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 14),

            // Message Field
            TextFormField(
              controller: _cardMessageController,
              maxLines: 4,
              maxLength: 280,
              decoration: InputDecoration(
                hintText: 'Escribe tu mensaje desde el corazón...',
                alignLabelWithHint: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                filled: true,
                fillColor: const Color(0xFFFFFBF2),
              ),
            ),
            const SizedBox(height: 8),

            // Secret Admirer Toggle
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: _isAnonymous
                    ? AppColors.primaryRose.withOpacity(0.08)
                    : Colors.grey.withOpacity(0.06),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: _isAnonymous ? AppColors.primaryRose : Colors.transparent,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _isAnonymous ? Icons.lock : Icons.lock_open,
                    color: _isAnonymous ? AppColors.primaryRose : Colors.grey,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Enviar como Admirador Secreto',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Text(
                          'Tu nombre se mantendrá en absoluto misterio.',
                          style: TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  Switch.adaptive(
                    value: _isAnonymous,
                    activeColor: AppColors.primaryRose,
                    onChanged: (val) {
                      setState(() => _isAnonymous = val);
                    },
                  ),
                ],
              ),
            ),

            if (!_isAnonymous) ...[
              const SizedBox(height: 14),
              TextFormField(
                controller: _senderNameController,
                decoration: InputDecoration(
                  labelText: 'Tu Nombre o Firma en la Tarjeta',
                  hintText: 'Ej. Juan, Tu consentida, etc.',
                  prefixIcon: const Icon(Icons.person_pin, color: AppColors.primaryRose),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRecipientSection() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.location_on, color: AppColors.primaryRose, size: 22),
                SizedBox(width: 8),
                Text(
                  'Datos de la Entrega',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Recipient Name
            TextFormField(
              controller: _recipientNameController,
              decoration: InputDecoration(
                labelText: 'Nombre Completo de quien recibe *',
                hintText: 'Ej. Sofía Martínez Ruiz',
                prefixIcon: const Icon(Icons.person_outline),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
              validator: (val) =>
                  (val == null || val.trim().isEmpty) ? 'Ingresa el nombre del destinatario' : null,
            ),
            const SizedBox(height: 14),

            // Phone
            TextFormField(
              controller: _recipientPhoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Teléfono Móvil del Destinatario *',
                hintText: '55 1234 5678 (para avisar al llegar)',
                prefixIcon: const Icon(Icons.phone_outlined),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
              validator: (val) =>
                  (val == null || val.trim().isEmpty) ? 'Ingresa el teléfono de contacto' : null,
            ),
            const SizedBox(height: 14),

            // Address
            TextFormField(
              controller: _deliveryAddressController,
              decoration: InputDecoration(
                labelText: 'Dirección Completa de Entrega *',
                hintText: 'Calle, número interior/exterior, colonia, ciudad',
                prefixIcon: const Icon(Icons.map_outlined),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
              validator: (val) =>
                  (val == null || val.trim().isEmpty) ? 'Ingresa la dirección de entrega' : null,
            ),
            const SizedBox(height: 14),

            // Delivery instructions
            TextFormField(
              controller: _deliveryInstructionsController,
              decoration: InputDecoration(
                labelText: 'Instrucciones Especiales (Opcional)',
                hintText: 'Ej. Es una sorpresa, dejar con el guardia, timbre 3B...',
                prefixIcon: const Icon(Icons.info_outline),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimingSection() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.timer_outlined, color: AppColors.primaryRose, size: 22),
                SizedBox(width: 8),
                Text(
                  'Momento de Entrega',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _deliveryTiming = 'express'),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: _deliveryTiming == 'express'
                            ? AppColors.primaryRose.withOpacity(0.08)
                            : null,
                        border: Border.all(
                          color: _deliveryTiming == 'express'
                              ? AppColors.primaryRose
                              : Colors.grey.withOpacity(0.3),
                          width: _deliveryTiming == 'express' ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.bolt, color: AppColors.primaryRose, size: 18),
                              SizedBox(width: 4),
                              Text('Express Hoy', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          SizedBox(height: 4),
                          Text('60 a 90 minutos', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _deliveryTiming = 'scheduled'),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: _deliveryTiming == 'scheduled'
                            ? AppColors.primaryRose.withOpacity(0.08)
                            : null,
                        border: Border.all(
                          color: _deliveryTiming == 'scheduled'
                              ? AppColors.primaryRose
                              : Colors.grey.withOpacity(0.3),
                          width: _deliveryTiming == 'scheduled' ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.calendar_month, color: AppColors.primaryRose, size: 18),
                              SizedBox(width: 4),
                              Text('Programar', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          SizedBox(height: 4),
                          Text('Fecha especial', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
