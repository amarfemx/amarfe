import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'app_config.dart';
import 'core/theme/app_theme.dart';
import 'core/i18n/app_localizations.dart';
import 'features/catalog/presentation/screens/catalog_home_screen.dart';

import 'core/theme/theme_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ThemeController.instance.loadTheme();

  AppConfig.initialize(
    const AppConfig(
      role: AppRole.customer,
      appTitle: 'AMar Fe / ToLove Faith',
      supabaseUrl: 'https://placeholder-project.supabase.co',
      supabaseAnonKey: 'placeholder-anon-key',
      defaultLocale: 'es',
    ),
  );

  runApp(const AmarFeCustomerApp());
}

class AmarFeCustomerApp extends StatefulWidget {
  const AmarFeCustomerApp({super.key});

  @override
  State<AmarFeCustomerApp> createState() => _AmarFeCustomerAppState();
}

class _AmarFeCustomerAppState extends State<AmarFeCustomerApp> {
  Locale _locale = const Locale('es');

  void _toggleLanguage() {
    setState(() {
      _locale = _locale.languageCode == 'es' ? const Locale('en') : const Locale('es');
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: ThemeController.instance,
      builder: (context, _) {
        return MaterialApp(
          title: _locale.languageCode == 'es' ? 'AMar Fe' : 'ToLove Faith',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeController.instance.themeMode,
          locale: _locale,
          supportedLocales: const [
            Locale('es', 'MX'),
            Locale('en', 'US'),
          ],
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: CatalogHomeScreen(
            currentLocale: _locale.languageCode,
            onToggleLanguage: _toggleLanguage,
          ),
        );
      },
    );
  }
}
