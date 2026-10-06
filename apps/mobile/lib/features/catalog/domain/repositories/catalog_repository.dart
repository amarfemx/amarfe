import '../entities/product.dart';
import '../entities/florist.dart';

abstract class CatalogRepository {
  /// Fetches featured products, optionally filtered by occasion ('amor', 'amistad', etc.)
  Future<List<Product>> getFeaturedProducts({String? occasionSlug});

  /// Fetches product details by ID
  Future<Product?> getProductById(String id);

  /// Fetches verified florist shops near a GPS coordinate
  Future<List<Florist>> getNearbyFlorists({
    required double lat,
    required double lng,
    double radiusKm = 15.0,
  });

  /// Searches products by keyword
  Future<List<Product>> searchProducts(String query);
}
