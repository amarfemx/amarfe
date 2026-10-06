import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_colors.dart';

enum AppPalette {
  rose,
  lavender,
  emerald,
  gold,
  ocean,
}

class PaletteData {
  final AppPalette palette;
  final String nameEs;
  final String nameEn;
  final String emoji;
  final Color primary;
  final Color deep;
  final Color accent;

  const PaletteData({
    required this.palette,
    required this.nameEs,
    required this.nameEn,
    required this.emoji,
    required this.primary,
    required this.deep,
    required this.accent,
  });
}

const List<PaletteData> availablePalettes = [
  PaletteData(
    palette: AppPalette.rose,
    nameEs: 'Rosa Terciopelo',
    nameEn: 'Velvet Rose',
    emoji: '🌹',
    primary: AppColors.primaryRose,
    deep: AppColors.primaryDeepRose,
    accent: AppColors.accentRoseGold,
  ),
  PaletteData(
    palette: AppPalette.lavender,
    nameEs: 'Lavanda & Amatista',
    nameEn: 'Lavender & Amethyst',
    emoji: '🪻',
    primary: Color(0xFF8B5CF6),
    deep: Color(0xFF6D28D9),
    accent: Color(0xFFC4B5FD),
  ),
  PaletteData(
    palette: AppPalette.emerald,
    nameEs: 'Esmeralda Botánica',
    nameEn: 'Botanical Emerald',
    emoji: '🍃',
    primary: Color(0xFF059669),
    deep: Color(0xFF047857),
    accent: Color(0xFF6EE7B7),
  ),
  PaletteData(
    palette: AppPalette.gold,
    nameEs: 'Oro Champaña',
    nameEn: 'Royal Champagne',
    emoji: '✨',
    primary: Color(0xFFD97706),
    deep: Color(0xFFB45309),
    accent: Color(0xFFFCD34D),
  ),
  PaletteData(
    palette: AppPalette.ocean,
    nameEs: 'Zafiro Serenidad',
    nameEn: 'Sapphire Serenity',
    emoji: '🌊',
    primary: Color(0xFF0284C7),
    deep: Color(0xFF0369A1),
    accent: Color(0xFF7DD3FC),
  ),
];

class ThemeController extends ChangeNotifier {
  static final ThemeController instance = ThemeController._();
  ThemeController._();

  ThemeMode _themeMode = ThemeMode.system;
  ThemeMode get themeMode => _themeMode;

  AppPalette _palette = AppPalette.rose;
  AppPalette get palette => _palette;

  PaletteData get currentPaletteData =>
      availablePalettes.firstWhere((p) => p.palette == _palette, orElse: () => availablePalettes.first);

  bool get isDarkMode => _themeMode == ThemeMode.dark;

  Future<void> loadTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedMode = prefs.getString('theme_mode');
      if (savedMode == 'dark') {
        _themeMode = ThemeMode.dark;
      } else if (savedMode == 'light') {
        _themeMode = ThemeMode.light;
      } else {
        _themeMode = ThemeMode.system;
      }

      final savedPalette = prefs.getString('theme_palette');
      if (savedPalette != null) {
        _palette = AppPalette.values.firstWhere(
          (e) => e.name == savedPalette,
          orElse: () => AppPalette.rose,
        );
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('theme_mode', mode.name);
    } catch (_) {}
  }

  Future<void> setPalette(AppPalette palette) async {
    _palette = palette;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('theme_palette', palette.name);
    } catch (_) {}
  }

  void toggleTheme() {
    if (_themeMode == ThemeMode.dark) {
      setThemeMode(ThemeMode.light);
    } else {
      setThemeMode(ThemeMode.dark);
    }
  }

  /// Show interactive visual style selector sheet
  void showThemePaletteDialog(BuildContext context, {String locale = 'es'}) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        locale == 'es' ? '🎨 Estilos & Paletas Visuales' : '🎨 Visual Themes & Palettes',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Mode Toggle
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          avatar: const Icon(Icons.light_mode, size: 16),
                          label: Text(locale == 'es' ? 'Modo Claro' : 'Light Mode'),
                          selected: _themeMode != ThemeMode.dark,
                          onSelected: (_) {
                            setThemeMode(ThemeMode.light);
                            setModalState(() {});
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          avatar: const Icon(Icons.dark_mode, size: 16),
                          label: Text(locale == 'es' ? 'Modo Oscuro' : 'Dark Mode'),
                          selected: _themeMode == ThemeMode.dark,
                          onSelected: (_) {
                            setThemeMode(ThemeMode.dark);
                            setModalState(() {});
                          },
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  Text(
                    locale == 'es' ? 'Paleta Cromática' : 'Color Palette',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey),
                  ),
                  const SizedBox(height: 10),

                  ...availablePalettes.map((p) {
                    final isSelected = p.palette == _palette;
                    return InkWell(
                      onTap: () {
                        setPalette(p.palette);
                        setModalState(() {});
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected ? p.primary.withOpacity(0.1) : null,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? p.primary : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 18,
                              height: 18,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: p.primary,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: p.deep,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              '${p.emoji} ${locale == 'es' ? p.nameEs : p.nameEn}',
                              style: TextStyle(
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              ),
                            ),
                            const Spacer(),
                            if (isSelected) Icon(Icons.check, size: 18, color: p.primary),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
