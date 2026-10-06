enum OrderStatus {
  pendingPayment,
  placed,
  floristAccepted,
  preparing,
  readyForPickup,
  courierAssigned,
  inTransit,
  delivered,
  cancelled,
}

class OrderItem {
  final String id;
  final String productId;
  final String title;
  final double unitPrice;
  final int quantity;

  const OrderItem({
    required this.id,
    required this.productId,
    required this.title,
    required this.unitPrice,
    required this.quantity,
  });

  double get subtotal => unitPrice * quantity;
}

class OrderEntity {
  final String id;
  final String orderCode;
  final String customerId;
  final String floristId;
  final String? courierId;
  final OrderStatus status;
  final double subtotal;
  final double deliveryFee;
  final double tipCourier;
  final double total;
  final String currency;
  final String recipientName;
  final String recipientPhone;
  final String deliveryAddress;
  final double deliveryLat;
  final double deliveryLng;
  final String? cardMessage;
  final String? cardSenderName;
  final bool isAnonymous;
  final DateTime? scheduledFor;
  final DateTime createdAt;
  final List<OrderItem> items;

  const OrderEntity({
    required this.id,
    required this.orderCode,
    required this.customerId,
    required this.floristId,
    this.courierId,
    required this.status,
    required this.subtotal,
    required this.deliveryFee,
    this.tipCourier = 0.0,
    required this.total,
    this.currency = 'MXN',
    required this.recipientName,
    required this.recipientPhone,
    required this.deliveryAddress,
    required this.deliveryLat,
    required this.deliveryLng,
    this.cardMessage,
    this.cardSenderName,
    this.isAnonymous = false,
    this.scheduledFor,
    required this.createdAt,
    this.items = const [],
  });
}
