'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserRole, UserProfile } from '@/types/database';
import { getLocalizedAuthError } from '@/lib/i18n';

export interface AuthState {
  error?: string | null;
  success?: boolean;
  message?: string | null;
}

export async function login(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectPath = (formData.get('redirect') as string) || '/';

  if (!email || !password) {
    return { error: 'Por favor ingresa tu correo y contraseña.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: getLocalizedAuthError(error.message, 'es') };
  }

  // Fetch profile to redirect based on role
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'florist' && redirectPath === '/') {
      redirect('/florist/dashboard');
    } else if (profile?.role === 'courier' && redirectPath === '/') {
      redirect('/courier/orders');
    }
  }

  redirect(redirectPath);
}

export async function register(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const role = (formData.get('role') as UserRole) || 'customer';
  const language = (formData.get('language') as string) || 'es';

  if (!email || !password || !fullName) {
    return { error: 'Por favor completa todos los campos requeridos.' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        role: role,
        preferred_language: language,
      },
    },
  });

  if (error) {
    return { error: getLocalizedAuthError(error.message, language === 'en' ? 'en' : 'es') };
  }

  if (data?.session) {
    // If auto-confirm is enabled, redirect directly
    if (role === 'florist') {
      redirect('/florist/dashboard');
    } else if (role === 'courier') {
      redirect('/courier/orders');
    }
    redirect('/');
  }

  return { 
    success: true, 
    message: '¡Registro exitoso! Hemos enviado un correo de confirmación a tu bandeja de entrada.' 
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function getCurrentUserProfile(): Promise<{ user: any | null; profile: UserProfile | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { user: null, profile: null };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile: profile as UserProfile | null };
  } catch {
    return { user: null, profile: null };
  }
}
