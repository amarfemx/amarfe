import 'dart:async';
import 'dart:math';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/entities/order.dart';
import '../../domain/repositories/order_repository.dart';

class OrderRepositoryImpl implements OrderRepository {
  final SupabaseClient? _supabaseClient;
  final List<OrderEntity> _localOrders = [];
  final StreamController<OrderEntity> _orderStreamController =
      StreamController<OrderEntity>.broadcast();

  OrderRepositoryImpl({SupabaseClient? supabaseClient})
      : _supabaseClient = supabaseClient;

  @override
  Future<OrderEntity> createOrder(OrderEntity order) async {
    final orderCode = 'AMF-2026-${(1000 + Random().nextInt(9000))}';
    final newId = 'ord_${DateTime.now().millisecondsSinceEpoch}';

    final createdOrder = OrderEntity(
      id: newId,
      orderCode: orderCode,
      customerId: order.customerId,
      floristId: order.floristId,
      courierId: order.courierId,
      status: OrderStatus.placed,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      tipCourier: order.tipCourier,
      total: order.total,
      currency: order.currency,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryLat: order.deliveryLat,
      deliveryLng: order.deliveryLng,
      cardMessage: order.cardMessage,
      cardSenderName: order.isAnonymous ? 'Un Admirador Secreto' : order.cardSenderName,
      isAnonymous: order.isAnonymous,
      scheduledFor: order.scheduledFor,
      createdAt: DateTime.now(),
      items: order.items,
    );

    // Save to local cache
    _localOrders.insert(0, createdOrder);
    _orderStreamController.add(createdOrder);

    // Attempt Supabase insert if client is available
    if (_supabaseClient != null) {
      try {
        await _supabaseClient.from('orders').insert({
          'order_code': createdOrder.orderCode,
          'customer_id': createdOrder.customerId.isNotEmpty ? createdOrder.customerId : null,
          'florist_id': createdOrder.floristId.isNotEmpty ? createdOrder.floristId : null,
          'status': 'placed',
          'payment_status': 'completed',
          'payment_provider': 'stripe',
          'subtotal': createdOrder.subtotal,
          'delivery_fee': createdOrder.deliveryFee,
          'tip_courier': createdOrder.tipCourier,
          'total': createdOrder.total,
          'currency': createdOrder.currency,
          'recipient_name': createdOrder.recipientName,
          'recipient_phone': createdOrder.recipientPhone,
          'delivery_address': createdOrder.deliveryAddress,
          'delivery_lat': createdOrder.deliveryLat,
          'delivery_lng': createdOrder.deliveryLng,
          'card_message': createdOrder.cardMessage,
          'card_sender_name': createdOrder.cardSenderName,
          'is_anonymous': createdOrder.isAnonymous,
          'scheduled_for': createdOrder.scheduledFor?.toIso8601String(),
        });
      } catch (e) {
        // Fallback gracefully to offline/local mode if network or credentials aren't set
        // ignore: avoid_print
        print('Supabase order insert notice: $e');
      }
    }

    return createdOrder;
  }

  @override
  Future<List<OrderEntity>> getCustomerOrders() async {
    return List.unmodifiable(_localOrders);
  }

  @override
  Stream<OrderEntity> watchOrder(String orderId) {
    return _orderStreamController.stream.where((order) => order.id == orderId);
  }

  @override
  Future<List<OrderEntity>> getAvailableDeliveriesForCourier() async {
    return _localOrders
        .where((order) => order.status == OrderStatus.readyForPickup)
        .toList();
  }

  @override
  Future<void> acceptDelivery({
    required String orderId,
    required String courierId,
  }) async {
    final idx = _localOrders.indexWhere((o) => o.id == orderId);
    if (idx != -1) {
      final current = _localOrders[idx];
      final updated = OrderEntity(
        id: current.id,
        orderCode: current.orderCode,
        customerId: current.customerId,
        floristId: current.floristId,
        courierId: courierId,
        status: OrderStatus.courierAssigned,
        subtotal: current.subtotal,
        deliveryFee: current.deliveryFee,
        tipCourier: current.tipCourier,
        total: current.total,
        currency: current.currency,
        recipientName: current.recipientName,
        recipientPhone: current.recipientPhone,
        deliveryAddress: current.deliveryAddress,
        deliveryLat: current.deliveryLat,
        deliveryLng: current.deliveryLng,
        cardMessage: current.cardMessage,
        cardSenderName: current.cardSenderName,
        isAnonymous: current.isAnonymous,
        scheduledFor: current.scheduledFor,
        createdAt: current.createdAt,
        items: current.items,
      );
      _localOrders[idx] = updated;
      _orderStreamController.add(updated);
    }
  }

  @override
  Future<void> updateDeliveryStatus({
    required String orderId,
    required OrderStatus newStatus,
    String? proofPhotoUrl,
  }) async {
    final idx = _localOrders.indexWhere((o) => o.id == orderId);
    if (idx != -1) {
      final current = _localOrders[idx];
      final updated = OrderEntity(
        id: current.id,
        orderCode: current.orderCode,
        customerId: current.customerId,
        floristId: current.floristId,
        courierId: current.courierId,
        status: newStatus,
        subtotal: current.subtotal,
        deliveryFee: current.deliveryFee,
        tipCourier: current.tipCourier,
        total: current.total,
        currency: current.currency,
        recipientName: current.recipientName,
        recipientPhone: current.recipientPhone,
        deliveryAddress: current.deliveryAddress,
        deliveryLat: current.deliveryLat,
        deliveryLng: current.deliveryLng,
        cardMessage: current.cardMessage,
        cardSenderName: current.cardSenderName,
        isAnonymous: current.isAnonymous,
        scheduledFor: current.scheduledFor,
        createdAt: current.createdAt,
        items: current.items,
      );
      _localOrders[idx] = updated;
      _orderStreamController.add(updated);
    }
  }
}
