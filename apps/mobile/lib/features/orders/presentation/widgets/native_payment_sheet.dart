import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

enum NativeWalletType {
  googlePay,
  applePay,
}

class NativePaymentResult {
  final bool success;
  final String provider;
  final String transactionId;
  final String cardBrand;
  final String last4;
  final String? errorMessage;

  const NativePaymentResult({
    required this.success,
    required this.provider,
    required this.transactionId,
    required this.cardBrand,
    required this.last4,
    this.errorMessage,
  });
}

class NativePaymentSheet extends StatefulWidget {
  final NativeWalletType walletType;
  final double amount;
  final String recipientName;

  const NativePaymentSheet({
    super.key,
    required this.walletType,
    required this.amount,
    required this.recipientName,
  });

  static Future<NativePaymentResult?> show({
    required BuildContext context,
    required NativeWalletType walletType,
    required double amount,
    required String recipientName,
  }) {
    return showModalBottomSheet<NativePaymentResult>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => NativePaymentSheet(
        walletType: walletType,
        amount: amount,
        recipientName: recipientName,
      ),
    );
  }

  @override
  State<NativePaymentSheet> createState() => _NativePaymentSheetState();
}

class _NativePaymentSheetState extends State<NativePaymentSheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;

  bool _isAuthorizing = false;
  bool _isSuccess = false;
  String _authStep = 'Esperando confirmación biométrica...';

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutBack,
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _startBiometricAuth() async {
    setState(() {
      _isAuthorizing = true;
      _authStep = widget.walletType == NativeWalletType.applePay
          ? 'Confirmando con Face ID...'
          : 'Verificando huella digital Google Pay...';
    });

    await Future.delayed(const Duration(milliseconds: 900));

    if (!mounted) return;
    setState(() {
      _authStep = 'Generando token criptográfico seguro...';
    });

    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;
    setState(() {
      _isSuccess = true;
      _authStep = '¡Pago Autorizado!';
    });
    _animController.forward();

    await Future.delayed(const Duration(milliseconds: 850));

    if (!mounted) return;
    Navigator.of(context).pop(
      NativePaymentResult(
        success: true,
        provider: widget.walletType == NativeWalletType.applePay ? 'apple_pay' : 'google_pay',
        transactionId: 'wallet_${DateTime.now().millisecondsSinceEpoch}',
        cardBrand: widget.walletType == NativeWalletType.applePay ? 'Mastercard' : 'Visa',
        last4: widget.walletType == NativeWalletType.applePay ? '8821' : '4242',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isApple = widget.walletType == NativeWalletType.applePay;

    return Container(
      decoration: BoxDecoration(
        color: isApple ? const Color(0xFF1C1C1E) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 20,
            offset: Offset(0, -4),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top pill handle
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: isApple ? Colors.white30 : Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Header brand
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isApple ? Colors.white12 : Colors.grey.shade100,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isApple ? Icons.apple : Icons.account_balance_wallet,
                        color: isApple ? Colors.white : const Color(0xFF1A73E8),
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isApple ? 'Apple Pay' : 'Google Pay',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: isApple ? Colors.white : Colors.black87,
                          ),
                        ),
                        Text(
                          'AMar Fe Floristería & Regalos',
                          style: TextStyle(
                            fontSize: 12,
                            color: isApple ? Colors.white60 : Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Text(
                  '\$${widget.amount.toStringAsFixed(2)} MXN',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: isApple ? Colors.white : AppColors.primaryDeepRose,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            Divider(color: isApple ? Colors.white12 : Colors.grey.shade200),
            const SizedBox(height: 14),

            // Card item preview
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isApple ? const Color(0xFF2C2C2E) : Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isApple ? Colors.white10 : Colors.grey.shade200,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 30,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isApple
                            ? [const Color(0xFFE50914), const Color(0xFFFF5F00)]
                            : [const Color(0xFF1A1F71), const Color(0xFFF7B600)],
                      ),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Center(
                      child: Text(
                        isApple ? 'MC' : 'VISA',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isApple ? 'Mastercard Débito •••• 8821' : 'Visa Crédito •••• 4242',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isApple ? Colors.white : Colors.black87,
                          ),
                        ),
                        Text(
                          'Entrega a: ${widget.recipientName}',
                          style: TextStyle(
                            fontSize: 11,
                            color: isApple ? Colors.white54 : Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.check_circle,
                    size: 18,
                    color: isApple ? const Color(0xFF30D158) : const Color(0xFF34A853),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Biometric prompt area
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
              decoration: BoxDecoration(
                color: isApple ? Colors.black26 : Colors.blue.shade50.withOpacity(0.5),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                children: [
                  if (_isSuccess) ...[
                    ScaleTransition(
                      scale: _scaleAnimation,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: (isApple ? const Color(0xFF30D158) : const Color(0xFF34A853)).withOpacity(0.2),
                        ),
                        child: Icon(
                          Icons.done_all,
                          color: isApple ? const Color(0xFF30D158) : const Color(0xFF34A853),
                          size: 38,
                        ),
                      ),
                    ),
                  ] else if (_isAuthorizing) ...[
                    SizedBox(
                      width: 38,
                      height: 38,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          isApple ? const Color(0xFF0A84FF) : const Color(0xFF1A73E8),
                        ),
                      ),
                    ),
                  ] else ...[
                    Icon(
                      isApple ? Icons.face : Icons.fingerprint,
                      size: 44,
                      color: isApple ? const Color(0xFF0A84FF) : const Color(0xFF1A73E8),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Text(
                    _authStep,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isApple ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Button
            ElevatedButton(
              onPressed: _isAuthorizing ? null : _startBiometricAuth,
              style: ElevatedButton.styleFrom(
                backgroundColor: isApple ? Colors.white : Colors.black,
                foregroundColor: isApple ? Colors.black : Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isApple ? Icons.apple : Icons.fingerprint,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    isApple ? 'Confirmar con Face ID' : 'Pagar con Huella Digital',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.3,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
