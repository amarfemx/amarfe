import '../../domain/entities/product.dart';
import '../../domain/entities/florist.dart';
import '../../domain/repositories/catalog_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Concrete implementation using Supabase client.
/// NOTE: If migrating to NestJS REST API in the future, only this class
/// is replaced by a NestJsCatalogRepositoryImpl using Dio/Http.
class CatalogRepositoryImpl implements CatalogRepository {
  final SupabaseClient supabaseClient;

  CatalogRepositoryImpl({required this.supabaseClient});

  @override
  Future<List<Product>> getFeaturedProducts({String? occasionSlug}) async {
    try {
      var query = supabaseClient.from('products').select('''
        id, florist_id, title_es, title_en, description_es, description_en,
        price, currency, images, stock_quantity, preparation_minutes,
        is_available, is_featured
      ''').eq('is_available', true);

      if (occasionSlug != null && occasionSlug.isNotEmpty) {
        // filter by occasion join
      }

      final response = await query.order('is_featured', ascending: false);
      return (response as List).map((json) {
        return Product(
          id: json['id'] as String,
          floristId: json['florist_id'] as String,
          titleEs: json['title_es'] as String,
          titleEn: json['title_en'] as String,
          descriptionEs: json['description_es'] ?? '',
          descriptionEn: json['description_en'] ?? '',
          price: (json['price'] as num).toDouble(),
          currency: json['currency'] ?? 'MXN',
          images: List<String>.from(json['images'] ?? []),
          stockQuantity: json['stock_quantity'] ?? 99,
          preparationMinutes: json['preparation_minutes'] ?? 30,
          isAvailable: json['is_available'] ?? true,
          isFeatured: json['is_featured'] ?? false,
        );
      }).toList();
    } catch (e) {
      // Fallback/offline sample data during early dev
      return _mockFeaturedProducts;
    }
  }

  @override
  Future<Product?> getProductById(String id) async {
    try {
      final response = await supabaseClient
          .from('products')
          .select()
          .eq('id', id)
          .maybeSingle();

      if (response == null) return null;
      return Product(
        id: response['id'],
        floristId: response['florist_id'],
        titleEs: response['title_es'],
        titleEn: response['title_en'],
        descriptionEs: response['description_es'] ?? '',
        descriptionEn: response['description_en'] ?? '',
        price: (response['price'] as num).toDouble(),
        currency: response['currency'] ?? 'MXN',
        images: List<String>.from(response['images'] ?? []),
        stockQuantity: response['stock_quantity'] ?? 99,
        preparationMinutes: response['preparation_minutes'] ?? 30,
        isAvailable: response['is_available'] ?? true,
        isFeatured: response['is_featured'] ?? false,
      );
    } catch (e) {
      return _mockFeaturedProducts.firstWhere(
        (p) => p.id == id,
        orElse: () => _mockFeaturedProducts.first,
      );
    }
  }

  @override
  Future<List<Florist>> getNearbyFlorists({
    required double lat,
    required double lng,
    double radiusKm = 15.0,
  }) async {
    try {
      final response = await supabaseClient
          .from('florist_shops')
          .select()
          .eq('is_verified', true);

      return (response as List).map((json) {
        return Florist(
          id: json['id'],
          name: json['name'],
          slug: json['slug'],
          descriptionEs: json['description_es'] ?? '',
          descriptionEn: json['description_en'] ?? '',
          address: json['address'] ?? '',
          lat: (json['lat'] as num).toDouble(),
          lng: (json['lng'] as num).toDouble(),
          phone: json['phone'] ?? '',
          bannerUrl: json['banner_url'],
          logoUrl: json['logo_url'],
          isOpen: json['is_open'] ?? true,
          averageRating: (json['average_rating'] as num?)?.toDouble() ?? 5.0,
          reviewCount: json['review_count'] ?? 0,
        );
      }).toList();
    } catch (e) {
      return _mockFlorists;
    }
  }

  @override
  Future<List<Product>> searchProducts(String query) async {
    return _mockFeaturedProducts
        .where((p) =>
            p.titleEs.toLowerCase().contains(query.toLowerCase()) ||
            p.titleEn.toLowerCase().contains(query.toLowerCase()))
        .toList();
  }

  static const List<Product> _mockFeaturedProducts = [
    Product(
      id: 'p-1',
      floristId: 'f-1',
      titleEs: 'Ramo de 24 Rosas Rojas Amor Eterno',
      titleEn: '24 Red Roses Eternal Love Bouquet',
      descriptionEs: 'Rosas premium seleccionadas de invernadero con follaje fino y dedicatoria personalizada.',
      descriptionEn: 'Handpicked premium greenhouse roses with delicate foliage and customized romantic card.',
      price: 890.0,
      currency: 'MXN',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80'],
    ),
    Product(
      id: 'p-teddy',
      floristId: 'f-1',
      titleEs: "Oso Gigante 'My Love' con Corazón de Terciopelo",
      titleEn: "Giant 'My Love' Teddy Bear with Embroidered Velvet Heart",
      descriptionEs: 'Peluche ultra suave de calidad boutique con moño de seda y corazón de terciopelo bordado.',
      descriptionEn: 'Ultra-soft boutique plush teddy bear with silk ribbon and gold embroidered velvet heart.',
      price: 780.0,
      currency: 'MXN',
      isFeatured: true,
      images: ['/images/products/peluche_oso.jpg', 'assets/images/peluche_oso.jpg'],
    ),
    Product(
      id: 'p-puppy',
      floristId: 'f-1',
      titleEs: "Cachorrito Golden 'Amor & Alegría' con Flor de Felpa",
      titleEn: "Golden Puppy 'Love & Joy' Plush with Heart Flower",
      descriptionEs: 'Tierno perrito de felpa de alta densidad con lazo de satín y corazón floral.',
      descriptionEn: 'Adorable golden retriever puppy plush with satin red bow and embroidered heart flower.',
      price: 640.0,
      currency: 'MXN',
      isFeatured: true,
      images: ['/images/products/peluche_perrito.jpg', 'assets/images/peluche_perrito.jpg'],
    ),
    Product(
      id: 'p-kitten',
      floristId: 'f-2',
      titleEs: "Gatito Dulce 'Para Mi Amor' con Campanilla Dorada",
      titleEn: "Sweet 'For My Love' Kitten Plush with Gold Bell",
      descriptionEs: 'Gatito de peluche esponjoso con collar rosa, campanilla dorada y tarjeta caligrafiada.',
      descriptionEn: 'Fluffy kitten plush with pink satin collar, golden bell and calligraphic gift note.',
      price: 590.0,
      currency: 'MXN',
      isFeatured: true,
      images: ['/images/products/peluche_gatito.jpg', 'assets/images/peluche_gatito.jpg'],
    ),
    Product(
      id: 'p-2',
      floristId: 'f-1',
      titleEs: 'Caja Regalo Amistad Luminosa (Girasoles y Chocolates)',
      titleEn: 'Luminous Friendship Gift Box (Sunflowers & Chocolates)',
      descriptionEs: 'Girasoles frescos, chocolates Ferrero y listón satinado.',
      descriptionEn: 'Fresh sunflowers, Ferrero chocolates and silk ribbon.',
      price: 650.0,
      currency: 'MXN',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80'],
    ),
    Product(
      id: 'p-3',
      floristId: 'f-2',
      titleEs: 'Orquídea Blanca Elegancia & Gratitud',
      titleEn: 'White Orchid Elegance & Gratitude',
      descriptionEs: 'Orquídea Phalaenopsis en maceta de cerámica artesanal con tarjeta caligráfica.',
      descriptionEn: 'Phalaenopsis orchid in handcrafted ceramic pot with calligraphic note.',
      price: 1150.0,
      currency: 'MXN',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80'],
    ),
  ];

  static const List<Florist> _mockFlorists = [
    Florist(
      id: 'f-1',
      name: 'Floristería Pétalos de Fe',
      slug: 'petalos-de-fe',
      descriptionEs: 'Diseños florales con amor y dedicación en CDMX',
      descriptionEn: 'Floral designs handcrafted with love and care in CDMX',
      address: 'Av. Paseo de la Reforma 222, CDMX',
      lat: 19.4295,
      lng: -99.1619,
      phone: '+52 55 1234 5678',
      averageRating: 4.9,
      reviewCount: 148,
    ),
  ];
}
