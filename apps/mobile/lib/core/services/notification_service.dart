import 'dart:async';
import 'package:flutter/material.dart';

enum NotificationAudience {
  customer,
  courier,
  florist,
}

class PushNotificationPayload {
  final String id;
  final String title;
  final String body;
  final String? orderId;
  final String? orderCode;
  final NotificationAudience audience;
  final DateTime timestamp;
  final Map<String, dynamic>? data;

  const PushNotificationPayload({
    required this.id,
    required this.title,
    required this.body,
    this.orderId,
    this.orderCode,
    required this.audience,
    required this.timestamp,
    this.data,
  });
}

class NotificationService {
  static final NotificationService instance = NotificationService._();
  NotificationService._();

  final StreamController<PushNotificationPayload> _notificationStream =
      StreamController<PushNotificationPayload>.broadcast();

  Stream<PushNotificationPayload> get onNotificationReceived => _notificationStream.stream;

  String? _fcmToken = 'fcm_mock_token_amarfe_2026';
  String? get fcmToken => _fcmToken;

  /// Initialize Firebase Cloud Messaging (FCM) & push channels
  Future<void> initialize() async {
    // In production, Firebase.initializeApp() and FirebaseMessaging.instance.requestPermission()
    // For local dev and emulators, we generate and configure a simulated reactive token
    _fcmToken = 'fcm_tk_${DateTime.now().millisecondsSinceEpoch}';
    // ignore: avoid_print
    print('🔔 [NotificationService] FCM Service initialized with token: $_fcmToken');
  }

  /// Trigger simulated or incoming notification
  void dispatchNotification(PushNotificationPayload notification) {
    _notificationStream.add(notification);
    // ignore: avoid_print
    print('🔔 [NotificationService] Push received: "${notification.title}" - ${notification.body}');
  }

  /// Show in-app romantic toast / banner overlay
  void showInAppBanner(BuildContext context, PushNotificationPayload payload) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;

    messenger.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        backgroundColor: const Color(0xFF1F151C),
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFD6336C).withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.favorite, color: Color(0xFFFB7185), size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    payload.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                  ),
                  Text(
                    payload.body,
                    style: const TextStyle(fontSize: 12, color: Colors.white70),
                  ),
                ],
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  /// Notification Trigger: Courier pickup ready
  void notifyCourierBouquetReady({required String orderCode, required String floristName}) {
    dispatchNotification(
      PushNotificationPayload(
        id: 'notif_${DateTime.now().millisecondsSinceEpoch}',
        title: '🛵 ¡Arreglo floral listo para recolección!',
        body: 'El florista en "$floristName" preparó el pedido $orderCode. Acude por él.',
        orderCode: orderCode,
        audience: NotificationAudience.courier,
        timestamp: DateTime.now(),
      ),
    );
  }

  /// Notification Trigger: Customer delivery approaching
  void notifyCustomerCourierApproaching({required String orderCode, required int minutesAway}) {
    dispatchNotification(
      PushNotificationPayload(
        id: 'notif_${DateTime.now().millisecondsSinceEpoch}',
        title: '🌹 ¡Tu detalle está muy cerca!',
        body: 'El mensajero climatizado llegará en aproximadamente $minutesAway minutos ($orderCode).',
        orderCode: orderCode,
        audience: NotificationAudience.customer,
        timestamp: DateTime.now(),
      ),
    );
  }

  /// Notification Trigger: Delivery confirmed with photo
  void notifyCustomerDelivered({required String orderCode}) {
    dispatchNotification(
      PushNotificationPayload(
        id: 'notif_${DateTime.now().millisecondsSinceEpoch}',
        title: '🎉 ¡Entrega completada con una sonrisa!',
        body: 'El regalo del pedido $orderCode fue entregado con éxito. Revisa la foto de evidencia.',
        orderCode: orderCode,
        audience: NotificationAudience.customer,
        timestamp: DateTime.now(),
      ),
    );
  }
}
