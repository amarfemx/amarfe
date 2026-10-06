'use client';

import Link from 'next/link';
import { useUser } from '@/lib/supabase/use-user';
import { logout } from '../actions/auth';
import { User, LogIn, LogOut, Store, Bike, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function UserNav() {
  const { user, profile, loading } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // If user is not logged in or during initial mount, show explicit Login and Register actions
  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--primary-rose)',
            background: 'var(--card-bg)',
            color: 'var(--primary-deep)',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <LogIn size={15} />
          <span>Iniciar Sesión</span>
        </Link>
        <Link
          href="/register"
          className="btn-primary"
          style={{
            padding: '7px 16px',
            fontSize: 13,
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          <span>Registrarse</span>
        </Link>
      </div>
    );
  }

  const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
    customer: { label: 'Cliente', icon: User, color: 'var(--primary-rose)' },
    florist: { label: 'Floristería', icon: Store, color: 'var(--primary-deep)' },
    courier: { label: 'Repartidor', icon: Bike, color: 'var(--emerald-leaf)' },
    admin: { label: 'Admin', icon: ShieldCheck, color: '#4F46E5' },
  };

  const currentRole = profile?.role ? roleLabels[profile.role] || roleLabels.customer : roleLabels.customer;
  const RoleIcon = currentRole.icon;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px 4px 6px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--card-bg)',
          border: '1.5px solid var(--card-border)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-rose) 0%, var(--primary-deep) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 13,
        }}>
          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            maxWidth: 120,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {profile?.full_name || user.email?.split('@')[0]}
          </div>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: currentRole.color,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}>
            <RoleIcon size={10} />
            {currentRole.label}
          </div>
        </div>
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 220,
            background: 'var(--card-bg)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--card-border)',
            padding: '8px',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--card-border)', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {profile?.full_name || 'Mi Perfil'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>

          {profile?.role === 'florist' && (
            <Link
              href="/florist/dashboard"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(230, 57, 111, 0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Store size={15} color="var(--primary-deep)" />
              <span>Panel de Floristería</span>
            </Link>
          )}

          {profile?.role === 'courier' && (
            <Link
              href="/courier/orders"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(230, 57, 111, 0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Bike size={15} color="var(--emerald-leaf)" />
              <span>Mis Entregas GPS</span>
            </Link>
          )}

          <Link
            href="/admin/dashboard"
            onClick={() => setDropdownOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(230, 57, 111, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ShieldCheck size={15} color="#4F46E5" />
            <span>Command Center Admin</span>
          </Link>

          <form action={logout}>
            <button
              type="submit"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: 13,
                fontWeight: 600,
                color: '#DC2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
