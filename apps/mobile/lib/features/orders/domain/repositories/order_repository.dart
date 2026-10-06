import '../entities/order.dart';

abstract class OrderRepository {
  /// Create a new order with gifts, recipient data and card message
  Future<OrderEntity> createOrder(OrderEntity order);

  /// Fetch orders placed by the current customer
  Future<List<OrderEntity>> getCustomerOrders();

  /// Stream order status updates in realtime
  Stream<OrderEntity> watchOrder(String orderId);

  /// (For Courier) Fetch available deliveries waiting for pickup
  Future<List<OrderEntity>> getAvailableDeliveriesForCourier();

  /// (For Courier) Accept delivery assignment
  Future<void> acceptDelivery({required String orderId, required String courierId});

  /// (For Courier) Update order progress (e.g. in_transit, delivered with photo)
  Future<void> updateDeliveryStatus({
    required String orderId,
    required OrderStatus newStatus,
    String? proofPhotoUrl,
  });
}
