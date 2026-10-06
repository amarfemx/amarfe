'use client';

import { useTheme } from '@/lib/theme-context';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: showLabel ? '7px 14px' : '7px',
          borderRadius: 9999,
          border: '1.5px solid rgba(230, 57, 111, 0.2)',
          background: 'rgba(255, 255, 255, 0.9)',
          height: 38,
          opacity: 0.8,
        }}
      >
        <Moon size={16} color="#9D174D" />
        {showLabel && <span style={{ fontSize: 12, fontWeight: 700, color: '#9D174D' }}>🌙 Modo Oscuro</span>}
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="theme-toggle-btn"
      aria-label={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      title={isDark ? 'Cambiar a Modo Claro (Champagne)' : 'Cambiar a Modo Oscuro (Velvet Noir)'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: showLabel ? '7px 14px' : '7px 10px',
        borderRadius: 9999,
        border: isDark ? '1.5px solid #FBBF24' : '1.5px solid var(--primary-rose)',
        background: isDark ? 'rgba(35, 18, 30, 0.95)' : '#FFFFFF',
        color: isDark ? '#FBBF24' : 'var(--primary-deep)',
        cursor: 'pointer',
        boxShadow: isDark
          ? '0 0 14px rgba(251, 191, 36, 0.25)'
          : '0 2px 8px rgba(230, 57, 111, 0.12)',
        transition: 'all 0.25s ease',
        fontWeight: 700,
        fontSize: 12,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 0 18px rgba(251, 191, 36, 0.45)'
          : '0 4px 14px rgba(230, 57, 111, 0.28)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 0 14px rgba(251, 191, 36, 0.25)'
          : '0 2px 8px rgba(230, 57, 111, 0.12)';
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(230, 57, 111, 0.12)',
          color: isDark ? '#FBBF24' : 'var(--primary-rose)',
        }}
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </span>
      {showLabel && (
        <span style={{ whiteSpace: 'nowrap' }}>
          {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </span>
      )}
    </button>
  );
}
