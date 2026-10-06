class Product {
  final String id;
  final String floristId;
  final String titleEs;
  final String titleEn;
  final String descriptionEs;
  final String descriptionEn;
  final double price;
  final String currency;
  final List<String> images;
  final int stockQuantity;
  final int preparationMinutes;
  final bool isAvailable;
  final bool isFeatured;
  final List<String> occasions;

  const Product({
    required this.id,
    required this.floristId,
    required this.titleEs,
    required this.titleEn,
    required this.descriptionEs,
    required this.descriptionEn,
    required this.price,
    this.currency = 'MXN',
    this.images = const [],
    this.stockQuantity = 99,
    this.preparationMinutes = 30,
    this.isAvailable = true,
    this.isFeatured = false,
    this.occasions = const [],
  });

  String getTitle(String locale) => locale == 'en' ? titleEn : titleEs;
  String getDescription(String locale) => locale == 'en' ? descriptionEn : descriptionEs;
}
