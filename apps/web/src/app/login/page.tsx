'use client';

import { useActionState, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login, AuthState } from '../actions/auth';
import { createClient } from '@/lib/supabase/client';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Store, 
  Bike, 
  User,
  AlertCircle
} from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    login,
    { error: urlError === 'auth_failed' ? 'Error en la autenticación. Intenta nuevamente.' : null }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setOauthLoading(true);
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });
    } catch (err: any) {
      setOauthLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(circle at 10% 20%, rgba(255, 240, 245, 0.9) 0%, rgba(255, 255, 255, 1) 90%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-rose) 0%, var(--primary-deep) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 16px rgba(230, 57, 111, 0.35)',
            }}>
              <Heart size={22} fill="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '24px', 
                fontWeight: 700, 
                color: 'var(--primary-deep)',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}>
                AMar Fe
              </div>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: 'var(--text-muted)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                ToLove Faith
              </div>
            </div>
          </Link>

          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            marginTop: '20px',
            marginBottom: '6px'
          }}>
            Bienvenido de vuelta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Ingresa a tu cuenta para continuar con tus flores y pedidos
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px 32px', borderRadius: '24px' }}>
          
          {/* Error Banner */}
          {state?.error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              color: '#991B1B',
              fontSize: '13px',
              marginBottom: '20px',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{state.error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={oauthLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'white',
              border: '1.5px solid #E5E7EB',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              cursor: oauthLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '24px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"/>
            </svg>
            {oauthLoading ? 'Conectando con Google...' : 'Continuar con Google'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '24px',
            color: 'var(--text-muted)',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              o con tu correo
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </div>

          {/* Login Form */}
          <form action={formAction}>
            <input type="hidden" name="redirect" value={redirect} />

            {/* Email Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} 
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="tu.correo@ejemplo.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary-rose)')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  Contraseña
                </label>
                <a href="#" style={{ fontSize: '12px', color: 'var(--primary-rose)', textDecoration: 'none', fontWeight: 500 }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} 
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    borderRadius: '12px',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary-rose)')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '15px',
                cursor: isPending ? 'wait' : 'pointer',
                opacity: isPending ? 0.8 : 1,
              }}
            >
              {isPending ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Role Preview Badges */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px dashed rgba(230, 57, 111, 0.2)',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <User size={13} color="var(--primary-rose)" /> Cliente
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Store size={13} color="var(--primary-deep)" /> Floristería
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Bike size={13} color="var(--emerald-leaf)" /> Repartidor
            </span>
          </div>
        </div>

        {/* Footer Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          ¿Aún no tienes una cuenta?{' '}
          <Link 
            href={`/register?redirect=${encodeURIComponent(redirect)}`}
            style={{ 
              color: 'var(--primary-rose)', 
              fontWeight: 700, 
              textDecoration: 'none' 
            }}
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--primary-rose)', fontWeight: 600 }}>Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
