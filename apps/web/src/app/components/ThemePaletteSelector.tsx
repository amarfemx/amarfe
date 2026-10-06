'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, PALETTES, ThemePalette, ThemeMode } from '@/lib/theme-context';
import { Palette, Sun, Moon, Check, Sparkles, ChevronDown } from 'lucide-react';

export function ThemePaletteSelector() {
  const { theme, palette, toggleTheme, setTheme, setPalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 9999,
          border: '1.5px solid rgba(230, 57, 111, 0.2)',
          background: 'rgba(255, 255, 255, 0.9)',
          height: 38,
          fontSize: 12,
          fontWeight: 700,
          color: '#9D174D',
        }}
      >
        <Palette size={15} />
        <span>Estilo Visual</span>
      </div>
    );
  }

  const currentPalette = PALETTES.find((p) => p.id === palette) || PALETTES[0];
  const isDark = theme === 'dark';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        id="theme-palette-menu-btn"
        aria-label="Abrir selector de paleta y temas"
        title="Personalizar paleta de colores y modo visual"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 14px',
          borderRadius: 9999,
          border: '1.5px solid var(--primary-rose)',
          background: 'var(--card-bg)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.25s ease',
          fontWeight: 700,
          fontSize: 12,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: currentPalette.primaryColor,
            boxShadow: `0 0 6px ${currentPalette.primaryColor}`,
            display: 'inline-block',
          }}
        />
        <span>{currentPalette.emoji} {currentPalette.name}</span>
        <span style={{ opacity: 0.6, fontSize: 11 }}>• {isDark ? '🌙' : '☀️'}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 310,
            background: 'var(--card-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid var(--card-border)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-lg)',
            padding: 16,
            zIndex: 1000,
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Palette size={16} color="var(--primary-rose)" />
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: -0.2 }}>
                Estilos & Paletas Visuales
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 9999,
                background: 'var(--primary-rose)',
                color: 'white',
              }}
            >
              En Vivo
            </span>
          </div>

          {/* Mode Selector (Light / Dark) */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              MODO DE LUZ
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
                background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)',
                padding: 4,
                borderRadius: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 10px',
                  borderRadius: 9,
                  border: 'none',
                  background: !isDark ? '#FFFFFF' : 'transparent',
                  color: !isDark ? '#9D174D' : 'var(--text-secondary)',
                  fontWeight: !isDark ? 800 : 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: !isDark ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Sun size={14} color={!isDark ? '#E6396F' : 'currentColor'} />
                Modo Claro
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 10px',
                  borderRadius: 9,
                  border: 'none',
                  background: isDark ? 'var(--primary-rose)' : 'transparent',
                  color: isDark ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: isDark ? 800 : 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Moon size={14} color={isDark ? '#FFFFFF' : 'currentColor'} />
                Modo Oscuro
              </button>
            </div>
          </div>

          {/* Palette List */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
              PALETAS CROMÁTICAS DE AMOR & EMOCIÓN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PALETTES.map((p) => {
                const isSelected = p.id === palette;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPalette(p.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: `1.5px solid ${isSelected ? 'var(--primary-rose)' : 'transparent'}`,
                      background: isSelected
                        ? isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(230, 57, 111, 0.08)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: p.primaryColor,
                            display: 'inline-block',
                            boxShadow: `0 0 6px ${p.primaryColor}88`,
                          }}
                        />
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: p.accentColor,
                            display: 'inline-block',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: isSelected ? 800 : 600 }}>
                        {p.emoji} {p.name}
                      </span>
                    </div>

                    {isSelected && (
                      <Check size={16} color="var(--primary-rose)" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
