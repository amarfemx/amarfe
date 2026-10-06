import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'app_config.dart';
import 'core/theme/app_theme.dart';
import 'core/i18n/app_localizations.dart';
import 'features/orders/presentation/screens/courier_home_screen.dart';

import 'core/theme/theme_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ThemeController.instance.loadTheme();

  AppConfig.initialize(
    const AppConfig(
      role: AppRole.courier,
      appTitle: 'AMar Fe Courier',
      supabaseUrl: 'https://placeholder-project.supabase.co',
      supabaseAnonKey: 'placeholder-anon-key',
      defaultLocale: 'es',
    ),
  );

  runApp(const AmarFeCourierApp());
}

class AmarFeCourierApp extends StatefulWidget {
  const AmarFeCourierApp({super.key});

  @override
  State<AmarFeCourierApp> createState() => _AmarFeCourierAppState();
}

class _AmarFeCourierAppState extends State<AmarFeCourierApp> {
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
          title: _locale.languageCode == 'es' ? 'AMar Fe - Repartidor' : 'ToLove Faith - Courier',
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
          home: CourierHomeScreen(
            currentLocale: _locale.languageCode,
            onToggleLanguage: _toggleLanguage,
          ),
        );
      },
    );
  }
}
