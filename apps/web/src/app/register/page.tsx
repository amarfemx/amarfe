'use client';

import { useActionState, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { register, AuthState } from '../actions/auth';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types/database';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Store, 
  Bike, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Globe
} from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    register,
    null
  );

  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [selectedLang, setSelectedLang] = useState<'es' | 'en'>('es');
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
          queryParams: {
            // pass metadata hint
          }
        },
      });
    } catch {
      setOauthLoading(false);
    }
  };

  const roles = [
    {
      id: 'customer' as UserRole,
      title: 'Cliente / Comprador',
      subtitle: 'Enviar flores y dedicatorias con entrega exprés',
      icon: User,
      color: 'var(--primary-rose)',
      bg: 'rgba(230, 57, 111, 0.08)',
    },
    {
      id: 'florist' as UserRole,
      title: 'Floristería Asociada',
      subtitle: 'Vende tus arreglos, gestiona catálogo y recibe pagos',
      icon: Store,
      color: 'var(--primary-deep)',
      bg: 'rgba(157, 23, 77, 0.08)',
    },
    {
      id: 'courier' as UserRole,
      title: 'Repartidor / Courier',
      subtitle: 'Entrega pedidos con rastreo satelital en tiempo real',
      icon: Bike,
      color: 'var(--emerald-leaf)',
      bg: 'rgba(45, 106, 79, 0.08)',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      background: 'radial-gradient(circle at 90% 10%, rgba(255, 240, 245, 0.9) 0%, rgba(255, 255, 255, 1) 90%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            Crea tu cuenta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Únete a la plataforma floral con envío de emociones en tiempo real
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px 32px', borderRadius: '24px' }}>
          
          {/* Success Banner */}
          {state?.success && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #6EE7B7',
              borderRadius: '14px',
              color: '#065F46',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: 1.5,
            }}>
              <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#10B981' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>¡Cuenta Creada con Éxito!</strong>
                {state.message}
                <div style={{ marginTop: '12px' }}>
                  <Link href="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                    Ir a Iniciar Sesión
                  </Link>
                </div>
              </div>
            </div>
          )}

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

          {!state?.success && (
            <>
              {/* Role Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}>
                  ¿Cómo deseas registrarte?
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRole(r.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '14px',
                          border: isSelected ? `2px solid ${r.color}` : '1.5px solid #E5E7EB',
                          backgroundColor: isSelected ? r.bg : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: isSelected ? r.color : '#F3F4F6',
                          color: isSelected ? 'white' : '#6B7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {r.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {r.subtitle}
                          </div>
                        </div>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? `5px solid ${r.color}` : '2px solid #D1D5DB',
                          backgroundColor: 'white',
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form action={formAction}>
                <input type="hidden" name="role" value={selectedRole} />
                <input type="hidden" name="language" value={selectedLang} />

                {/* Full Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}>
                    Nombre Completo {selectedRole === 'florist' && 'o Nombre de Contacto'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User 
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
                      type="text"
                      name="fullName"
                      required
                      placeholder="Ej. Sofia Ramos"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '12px',
                        border: '1.5px solid #E5E7EB',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--primary-rose)')}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: '16px' }}>
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
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--primary-rose)')}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}>
                    Teléfono / WhatsApp <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Opcional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone 
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
                      type="tel"
                      name="phone"
                      placeholder="+52 55 1234 5678"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '12px',
                        border: '1.5px solid #E5E7EB',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--primary-rose)')}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}>
                    Contraseña <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(mínimo 6 caracteres)</span>
                  </label>
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
                      minLength={6}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        borderRadius: '12px',
                        border: '1.5px solid #E5E7EB',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
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

                {/* Language Switch */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#F9FAFB',
                  marginBottom: '24px',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={15} /> Idioma de Notificaciones
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedLang('es')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: selectedLang === 'es' ? 'var(--primary-rose)' : 'transparent',
                        color: selectedLang === 'es' ? 'white' : '#6B7280',
                        cursor: 'pointer',
                      }}
                    >
                      Español
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLang('en')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: selectedLang === 'en' ? 'var(--primary-rose)' : 'transparent',
                        color: selectedLang === 'en' ? 'white' : '#6B7280',
                        cursor: 'pointer',
                      }}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Submit */}
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
                    <span>Registrando cuenta...</span>
                  ) : (
                    <>
                      <span>Crear mi Cuenta</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          ¿Ya tienes una cuenta creada?{' '}
          <Link 
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            style={{ 
              color: 'var(--primary-rose)', 
              fontWeight: 700, 
              textDecoration: 'none' 
            }}
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--primary-rose)', fontWeight: 600 }}>Cargando...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
