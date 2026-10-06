import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/theme_controller.dart';
import '../../../../core/i18n/app_localizations.dart';
import '../../domain/entities/product.dart';
import '../../data/repositories/catalog_repository_impl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../orders/presentation/screens/order_customization_screen.dart';

class CatalogHomeScreen extends StatefulWidget {
  final VoidCallback onToggleLanguage;
  final String currentLocale;

  const CatalogHomeScreen({
    super.key,
    required this.onToggleLanguage,
    required this.currentLocale,
  });

  @override
  State<CatalogHomeScreen> createState() => _CatalogHomeScreenState();
}

class _CatalogHomeScreenState extends State<CatalogHomeScreen> {
  late final CatalogRepositoryImpl _repository;
  List<Product> _products = [];
  bool _isLoading = true;
  String _selectedOccasion = 'all';

  @override
  void initState() {
    super.initState();
    // Using mock/offline data fallback until Supabase credentials are configured in .env
    _repository = CatalogRepositoryImpl(supabaseClient: Supabase.instance.client);
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    final products = await _repository.getFeaturedProducts();
    if (mounted) {
      setState(() {
        _products = products;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final tr = (String k) => context.tr(k);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: AppColors.primaryRose),
                const SizedBox(width: 4),
                Text(
                  tr('delivery_to'),
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                ),
              ],
            ),
            const Text(
              'Polanco, CDMX',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight),
            ),
          ],
        ),
          IconButton(
            tooltip: 'Estilo Visual & Paletas',
            icon: Icon(
              Icons.palette_outlined,
              color: ThemeController.instance.currentPaletteData.primary,
            ),
            onPressed: () => ThemeController.instance.showThemePaletteDialog(
              context,
              locale: widget.currentLocale,
            ),
          ),
          IconButton(
            tooltip: 'Cambiar idioma / Switch language',
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primaryRose.withOpacity(0.4)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                widget.currentLocale.toUpperCase(),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: AppColors.primaryRose,
                ),
              ),
            ),
            onPressed: widget.onToggleLanguage,
          ),
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryRose))
          : RefreshIndicator(
              onRefresh: _loadProducts,
              color: AppColors.primaryRose,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                children: [
                  // Romantic Greeting Banner
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primaryRose, AppColors.primaryDeepRose],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryRose.withOpacity(0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          tr('tagline'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          widget.currentLocale == 'es'
                              ? 'Envía una sorpresa hoy y toca su corazón con flores frescas.'
                              : 'Send a romantic surprise today and touch their heart.',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Occasions Section
                  Text(
                    tr('occasions'),
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 42,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _buildOccasionChip('all', 'Todos / All'),
                        _buildOccasionChip('peluches', widget.currentLocale == 'es' ? '🧸 Peluches & Ternura' : '🧸 Plushies & Soft Gifts'),
                        _buildOccasionChip('amor', tr('occasion_love')),
                        _buildOccasionChip('amistad', tr('occasion_friendship')),
                        _buildOccasionChip('aniversario', tr('occasion_anniversary')),
                        _buildOccasionChip('cumpleanos', tr('occasion_birthday')),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Product Catalog Grid
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.68,
                    ),
                    itemCount: _products.length,
                    itemBuilder: (context, index) {
                      final product = _products[index];
                      return _buildProductCard(product);
                    },
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildOccasionChip(String slug, String label) {
    final isSelected = _selectedOccasion == slug;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppColors.primaryRose,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppColors.textPrimaryLight,
          fontSize: 13,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        backgroundColor: Colors.white,
        side: BorderSide(
          color: isSelected ? AppColors.primaryRose : AppColors.borderLight,
        ),
        onSelected: (_) {
          setState(() => _selectedOccasion = slug);
        },
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    void openCustomization() {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => OrderCustomizationScreen(
            product: product,
            currentLocale: widget.currentLocale,
          ),
        ),
      );
    }

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: openCustomization,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (product.images.isNotEmpty)
                  product.images.first.startsWith('assets/')
                      ? Image.asset(product.images.first, fit: BoxFit.cover)
                      : Image.network(
                          product.images.first,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AppColors.warmChampagne,
                            child: const Icon(Icons.favorite, size: 40, color: AppColors.primaryRose),
                          ),
                        )
                else
                  Container(
                    color: AppColors.warmChampagne,
                    child: const Icon(Icons.favorite, size: 40, color: AppColors.primaryRose),
                  ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: CircleAvatar(
                    radius: 14,
                    backgroundColor: Colors.white.withOpacity(0.9),
                    child: const Icon(Icons.favorite_border, size: 16, color: AppColors.primaryRose),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.getTitle(widget.currentLocale),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$${product.price.toStringAsFixed(0)} ${product.currency}',
                      style: const TextStyle(
                        color: AppColors.primaryRose,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    InkWell(
                      onTap: openCustomization,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryRose,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.add, size: 16, color: Colors.white),
                      ),
                    ),
                  ],
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
