'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Heart, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Store, 
  Bike, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Navigation,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface LiveOrderTrackerProps {
  initialOrderCode?: string;
}

export function LiveOrderTracker({ initialOrderCode = 'AMF-2026-9021' }: LiveOrderTrackerProps) {
  const [orderCode, setOrderCode] = useState(initialOrderCode);
  const [status, setStatus] = useState<'placed' | 'preparing' | 'ready_for_pickup' | 'in_transit' | 'delivered'>('in_transit');
  const [courierLocation, setCourierLocation] = useState({ lat: 19.4326, lng: -99.1332, progress: 45 });
  const [etaMinutes, setEtaMinutes] = useState(18);

  useEffect(() => {
    // 1. Setup Supabase Realtime Channel
    const supabase = createClient();
    const channel = supabase.channel(`order-tracking:${orderCode}`);

    channel
      .on('broadcast', { event: 'location' }, (payload: any) => {
        if (payload?.lat && payload?.lng) {
          setCourierLocation((prev) => ({
            ...prev,
            lat: payload.lat,
            lng: payload.lng,
          }));
        }
      })
      .on('broadcast', { event: 'status_change' }, (payload: any) => {
        if (payload?.status) {
          setStatus(payload.status);
        }
      })
      .subscribe();

    // 2. Simulated real-world telemetry movement
    const movementInterval = setInterval(() => {
      setCourierLocation((prev) => {
        const nextProgress = prev.progress >= 95 ? 95 : prev.progress + 3;
        return {
          ...prev,
          progress: nextProgress,
        };
      });
      setEtaMinutes((prev) => (prev <= 3 ? 3 : prev - 1));
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(movementInterval);
    };
  }, [orderCode]);

  const steps = [
    { key: 'placed', label: 'Pedido Confirmado', icon: CheckCircle2, time: '14:20' },
    { key: 'preparing', label: 'Diseño Artesanal Florería', icon: Store, time: '14:25' },
    { key: 'ready_for_pickup', label: 'Foto de Evidencia Lista', icon: Camera, time: '14:40' },
    { key: 'in_transit', label: 'Repartidor en Ruta GPS', icon: Bike, time: '14:48' },
    { key: 'delivered', label: 'Sonrisa Entregada', icon: Heart, time: 'ETA 15:06' },
  ];

  const getStepIndex = (s: string) => {
    switch (s) {
      case 'placed': return 0;
      case 'preparing': return 1;
      case 'ready_for_pickup': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 3;
    }
  };

  const currentStepIdx = getStepIndex(status);

  return (
    <div className="glass-card" style={{ padding: '32px 28px', borderRadius: 28 }}>
      {/* Header Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 20,
        borderBottom: '1px solid var(--card-border)',
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Seguimiento en Vivo:</span>
            <strong style={{ fontSize: 16, color: 'var(--primary-rose)', letterSpacing: 0.5 }}>
              {orderCode}
            </strong>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {status === 'delivered' ? '¡Tu amor ha llegado a su destino!' : 'Tu ramo viene en camino con amor'}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'rgba(230, 57, 111, 0.1)',
          padding: '8px 18px',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--card-border)',
        }}>
          <Clock size={18} color="var(--primary-rose)" />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Tiempo Estimado (ETA)</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-deep)' }}>
              {status === 'delivered' ? 'Entregado con Éxito' : `${etaMinutes} minutos`}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          marginBottom: 12,
        }}>
          {/* Timeline Bar */}
          <div style={{
            position: 'absolute',
            top: 18,
            left: 20,
            right: 20,
            height: 4,
            backgroundColor: '#E5E7EB',
            zIndex: 1,
          }}>
            <div style={{
              height: '100%',
              backgroundColor: 'var(--primary-rose)',
              width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>

          {steps.map((st, i) => {
            const Icon = st.icon;
            const isCompleted = i <= currentStepIdx;
            const isCurrent = i === currentStepIdx;

            return (
              <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: 80 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? 'var(--primary-rose)' : 'white',
                  border: isCurrent ? '3px solid var(--primary-deep)' : '2px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? 'white' : '#9CA3AF',
                  boxShadow: isCurrent ? '0 0 16px rgba(230, 57, 111, 0.45)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  <Icon size={18} />
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary-rose)' : 'var(--text-secondary)',
                  textAlign: 'center',
                  marginTop: 8,
                  lineHeight: 1.2,
                }}>
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual GPS Telemetry Simulation Card */}
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: '1.5px solid var(--card-border)',
        position: 'relative',
        height: 280,
        backgroundColor: '#0F172A',
        backgroundImage: 'radial-gradient(#1E293B 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        marginBottom: 24,
      }}>
        {/* Mock Map Route Visual */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path
            d="M 60 210 Q 220 80 440 160 T 820 120"
            fill="none"
            stroke="rgba(230, 57, 111, 0.35)"
            strokeWidth="5"
            strokeDasharray="8 8"
          />
          <path
            d="M 60 210 Q 220 80 440 160 T 820 120"
            fill="none"
            stroke="var(--primary-rose)"
            strokeWidth="5"
            strokeDashoffset={1000 - (courierLocation.progress * 10)}
            strokeDasharray="1000"
          />
        </svg>

        {/* Florist Pin */}
        <div style={{ position: 'absolute', left: 40, top: 185, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-deep)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            <Store size={16} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.65)', padding: '2px 8px', borderRadius: 6 }}>
            Pétalos de Fe
          </span>
        </div>

        {/* Destination Pin */}
        <div style={{ position: 'absolute', right: 40, top: 100, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#10B981',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.5)',
          }}>
            <Heart size={18} fill="white" />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.65)', padding: '2px 8px', borderRadius: 6 }}>
            Destino (Entrega)
          </span>
        </div>

        {/* Moving Courier Marker */}
        <div style={{
          position: 'absolute',
          left: `calc(${courierLocation.progress}% - 20px)`,
          top: `${165 - Math.sin((courierLocation.progress / 100) * Math.PI) * 45}px`,
          transition: 'all 1.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-rose)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(230, 57, 111, 0.8)',
            border: '2.5px solid white',
          }}>
            <Bike size={22} />
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: 'white',
            background: 'var(--primary-deep)',
            padding: '2px 6px',
            borderRadius: 4,
            marginTop: 4,
            whiteSpace: 'nowrap',
          }}>
            En Movimiento GPS
          </span>
        </div>

        {/* Badge in Map */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 14,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          color: 'var(--emerald-leaf)',
          backdropFilter: 'blur(6px)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}>
          <Navigation size={12} />
          <span>Suscrito a Supabase Realtime Telemetry</span>
        </div>
      </div>

      {/* Courier & Florist Proof Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {/* Courier Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderRadius: 16,
          backgroundColor: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--emerald-leaf) 0%, #15803D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
          }}>
            MR
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Mateo Rodríguez
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Repartidor Verificado • Moto Italika 150
            </div>
          </div>
          <button style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: 'none',
            color: 'var(--emerald-leaf)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Phone size={16} />
          </button>
        </div>

        {/* Florist Bouquet Proof */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderRadius: 16,
          backgroundColor: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
        }}>
          <img
            src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80"
            alt="Evidencia ramo preparado"
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Foto de Ramo Listo
            </div>
            <div style={{ fontSize: 11, color: 'var(--emerald-leaf)', fontWeight: 600 }}>
              ✓ Aprobado por control de calidad
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
