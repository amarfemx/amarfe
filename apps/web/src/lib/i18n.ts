// ==============================================================================
// AMar Fe / ToLove Faith - Centralized Internationalization (i18n) & Error Dictionary
// ==============================================================================

export type SupportedLanguage = 'es' | 'en';

export interface AuthErrorDictionary {
  [key: string]: {
    es: string;
    en: string;
  };
}

/**
 * Standardized mapping of Supabase, Stripe, and platform authentication errors
 */
export const AUTH_ERROR_MAPPINGS: AuthErrorDictionary = {
  // Rate limiting errors (frequently triggered when testing signups/emails)
  'email rate limit exceeded': {
    es: 'Has alcanzado el límite de envíos de correo por minuto. Por favor, espera unos instantes antes de volver a intentar.',
    en: 'Email rate limit exceeded. Please wait a few moments before trying again.',
  },
  'over_email_send_rate_limit': {
    es: 'Límite de solicitudes de correo excedido temporalmente. Espera unos minutos para recibir un nuevo correo de confirmación.',
    en: 'Temporary email sending rate limit exceeded. Please wait a few minutes before requesting another confirmation email.',
  },
  'rate limit exceeded': {
    es: 'Demasiadas solicitudes en poco tiempo. Por seguridad, por favor espera un momento.',
    en: 'Rate limit exceeded. For security purposes, please wait a moment.',
  },
  'too many requests': {
    es: 'Demasiadas solicitudes. Por favor espera un momento e intenta nuevamente.',
    en: 'Too many requests. Please wait a moment and try again.',
  },

  // Credentials & Login
  'invalid login credentials': {
    es: 'Credenciales incorrectas. Verifica que tu correo y contraseña sean los correctos.',
    en: 'Invalid login credentials. Please verify your email and password.',
  },
  'invalid_grant': {
    es: 'Correo electrónico o contraseña incorrectos.',
    en: 'Incorrect email or password.',
  },

  // Registration & User exists
  'user already registered': {
    es: 'Este correo electrónico ya se encuentra registrado. Inicia sesión o recupera tu contraseña.',
    en: 'This email is already registered. Please sign in or reset your password.',
  },
  'user_already_exists': {
    es: 'Ya existe una cuenta vinculada a este correo.',
    en: 'An account with this email already exists.',
  },

  // Password requirements
  'password should be at least 6 characters': {
    es: 'La contraseña debe contener al menos 6 caracteres.',
    en: 'Password should be at least 6 characters.',
  },
  'signup requires a valid password': {
    es: 'Por favor ingresa una contraseña válida y segura para completar tu registro.',
    en: 'Please provide a valid and secure password to register.',
  },

  // Verification & Confirmation
  'email not confirmed': {
    es: 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o correo no deseado.',
    en: 'Your email address is not yet confirmed. Please check your inbox or spam folder.',
  },
  'email link is invalid or has expired': {
    es: 'El enlace de confirmación es inválido o ha expirado. Solicita uno nuevo.',
    en: 'The confirmation link is invalid or has expired. Please request a new one.',
  },

  // Format validation
  'unable to validate email address': {
    es: 'El formato del correo electrónico ingresado no es válido.',
    en: 'The provided email address format is invalid.',
  },
  'to signup, please provide your email': {
    es: 'Por favor ingresa un correo electrónico válido para registrarte.',
    en: 'Please provide a valid email address to sign up.',
  },
};

/**
 * Localizes any error string coming from Supabase Auth, Next.js server actions, or API responses
 */
export function getLocalizedAuthError(rawError: string | null | undefined, lang: SupportedLanguage = 'es'): string {
  if (!rawError) return '';

  const cleanError = rawError.trim().toLowerCase();

  // 1. Direct match in dictionary
  if (AUTH_ERROR_MAPPINGS[cleanError]) {
    return AUTH_ERROR_MAPPINGS[cleanError][lang];
  }

  // 2. Partial/fuzzy match for rate limit or security timeouts
  if (cleanError.includes('rate limit') || cleanError.includes('over_email_send_rate_limit')) {
    return AUTH_ERROR_MAPPINGS['email rate limit exceeded'][lang];
  }

  if (cleanError.includes('security purposes') || cleanError.includes('seconds')) {
    return lang === 'es'
      ? 'Por motivos de seguridad, debes esperar unos segundos antes de solicitar otro correo o código.'
      : 'For security purposes, you must wait a few seconds before requesting another email or code.';
  }

  if (cleanError.includes('already registered') || cleanError.includes('already exists')) {
    return AUTH_ERROR_MAPPINGS['user already registered'][lang];
  }

  if (cleanError.includes('invalid') && (cleanError.includes('credential') || cleanError.includes('password'))) {
    return AUTH_ERROR_MAPPINGS['invalid login credentials'][lang];
  }

  if (cleanError.includes('least 6 characters') || cleanError.includes('password')) {
    return AUTH_ERROR_MAPPINGS['password should be at least 6 characters'][lang];
  }

  // 3. Fallback: if already translated or unknown custom message
  return rawError;
}
