class Florist {
  final String id;
  final String name;
  final String slug;
  final String descriptionEs;
  final String descriptionEn;
  final String address;
  final double lat;
  final double lng;
  final String phone;
  final String? bannerUrl;
  final String? logoUrl;
  final bool isOpen;
  final double averageRating;
  final int reviewCount;

  const Florist({
    required this.id,
    required this.name,
    required this.slug,
    required this.descriptionEs,
    required this.descriptionEn,
    required this.address,
    required this.lat,
    required this.lng,
    required this.phone,
    this.bannerUrl,
    this.logoUrl,
    this.isOpen = true,
    this.averageRating = 5.0,
    this.reviewCount = 0,
  });

  String getDescription(String locale) => locale == 'en' ? descriptionEn : descriptionEs;
}
