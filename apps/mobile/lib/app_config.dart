enum AppRole {
  customer,
  courier,
}

class AppConfig {
  final AppRole role;
  final String appTitle;
  final String supabaseUrl;
  final String supabaseAnonKey;
  final String defaultLocale;

  const AppConfig({
    required this.role,
    required this.appTitle,
    required this.supabaseUrl,
    required this.supabaseAnonKey,
    this.defaultLocale = 'es',
  });

  static late AppConfig current;

  static void initialize(AppConfig config) {
    current = config;
  }

  bool get isCustomer => role == AppRole.customer;
  bool get isCourier => role == AppRole.courier;
}
