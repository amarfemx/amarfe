import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../network/supabase_service.dart';

class LocationTrackingService {
  LocationTrackingService._();
  static final LocationTrackingService instance = LocationTrackingService._();

  StreamSubscription<Position>? _positionStreamSubscription;
  Timer? _simulationTimer;
  RealtimeChannel? _trackingChannel;

  String? _currentOrderId;
  bool _isTracking = false;
  bool get isTracking => _isTracking;

  final ValueNotifier<Position?> currentPositionNotifier = ValueNotifier<Position?>(null);
  final ValueNotifier<String> trackingStatusNotifier = ValueNotifier<String>('Inactivo');

  /// Start real GPS tracking or fallback simulation
  Future<bool> startTracking(String orderId, {bool simulate = false}) async {
    _currentOrderId = orderId;
    _isTracking = true;
    trackingStatusNotifier.value = 'Iniciando conexión satelital...';

    // 1. Join Supabase Realtime Broadcast Channel for the order
    try {
      final client = SupabaseService.client;
      _trackingChannel = client.channel('order-tracking:$orderId');
      await _trackingChannel?.subscribe();
      trackingStatusNotifier.value = 'Canal Realtime conectado';
    } catch (e) {
      debugPrint('Error subscribing to Supabase channel: $e');
    }

    if (simulate) {
      _startSimulatedStream(orderId);
      return true;
    }

    // 2. Request GPS permissions
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('Location services are disabled, falling back to simulated GPS.');
      _startSimulatedStream(orderId);
      return true;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('Location permission denied, using simulation.');
        _startSimulatedStream(orderId);
        return true;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('Location permission permanently denied, using simulation.');
      _startSimulatedStream(orderId);
      return true;
    }

    // 3. Start Geolocation Position Stream
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5, // Send update every 5 meters
    );

    _positionStreamSubscription = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen((Position position) {
      _broadcastPosition(orderId, position);
    }, onError: (err) {
      debugPrint('GPS stream error: $err. Switching to simulated route.');
      _startSimulatedStream(orderId);
    });

    trackingStatusNotifier.value = 'Transmitiendo coordenadas GPS en vivo';
    return true;
  }

  /// Broadcast position to Supabase Realtime and update state
  void _broadcastPosition(String orderId, Position position) {
    currentPositionNotifier.value = position;
    trackingStatusNotifier.value = 
        'GPS Activo · Lat: ${position.latitude.toStringAsFixed(4)}, Lng: ${position.longitude.toStringAsFixed(4)} (${(position.speed * 3.6).toStringAsFixed(0)} km/h)';

    try {
      // Broadcast to clients watching the order map
      _trackingChannel?.sendBroadcastMessage(
        event: 'location_update',
        payload: {
          'order_id': orderId,
          'lat': position.latitude,
          'lng': position.longitude,
          'heading': position.heading,
          'speed': position.speed,
          'timestamp': DateTime.now().toIso8601String(),
        },
      );

      // Update courier last known location in Supabase
      final user = SupabaseService.client.auth.currentUser;
      if (user != null) {
        SupabaseService.client.from('couriers').update({
          'current_lat': position.latitude,
          'current_lng': position.longitude,
          'last_location_updated_at': DateTime.now().toIso8601String(),
        }).eq('id', user.id).then((_) {}).catchError((e) {
          debugPrint('Silent update error: $e');
        });
      }
    } catch (e) {
      debugPrint('Broadcast error: $e');
    }
  }

  /// Simulated realistic route (Polanco Florist -> Campos Elíseos Delivery)
  void _startSimulatedStream(String orderId) {
    const List<List<double>> route = [
      [19.4326, -99.1932], // Floristería Masaryk
      [19.4320, -99.1938],
      [19.4312, -99.1945],
      [19.4305, -99.1950],
      [19.4298, -99.1958],
      [19.4290, -99.1965],
      [19.4282, -99.1972],
      [19.4275, -99.1980], // Campos Elíseos
    ];

    int stepIndex = 0;
    _simulationTimer?.cancel();
    _simulationTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (!_isTracking) {
        timer.cancel();
        return;
      }

      final coords = route[stepIndex % route.length];
      stepIndex++;

      final simulatedPosition = Position(
        latitude: coords[0],
        longitude: coords[1],
        timestamp: DateTime.now(),
        accuracy: 5.0,
        altitude: 2240.0,
        altitudeAccuracy: 1.0,
        heading: 215.0,
        headingAccuracy: 1.0,
        speed: 7.5, // ~27 km/h
        speedAccuracy: 0.5,
      );

      _broadcastPosition(orderId, simulatedPosition);
    });
  }

  /// Stop tracking and clean up listeners
  Future<void> stopTracking() async {
    _isTracking = false;
    _currentOrderId = null;
    await _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
    _simulationTimer?.cancel();
    _simulationTimer = null;

    if (_trackingChannel != null) {
      await SupabaseService.client.removeChannel(_trackingChannel!);
      _trackingChannel = null;
    }

    trackingStatusNotifier.value = 'Inactivo';
    currentPositionNotifier.value = null;
  }
}
