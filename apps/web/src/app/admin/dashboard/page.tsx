'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Store,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Heart,
  FileText
} from 'lucide-react';
import { 
  getAdminKpisAction, 
  getAdminOrdersAction, 
  getAdminFloristsAction, 
  toggleFloristVerificationAction,
  adminCancelAndRefundOrderAction,
  AdminKpis 
} from '@/app/actions/admin';
import { ThemePaletteSelector } from '@/app/components/ThemePaletteSelector';
import { UserNav } from '@/app/components/UserNav';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKpis>({
    gmvTotal: 184500,
    platformNetRevenue: 27675,
    activeOrdersCount: 8,
    deliveredOrdersCount: 142,
    activeCouriersCount: 16,
    activeFloristsCount: 12,
    averageDeliveryTimeMin: 54,
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [florists, setFlorists] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'florists' | 'couriers' | 'finance'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [kpisData, ordersData, floristsData] = await Promise.all([
        getAdminKpisAction(),
        getAdminOrdersAction(),
        getAdminFloristsAction(),
      ]);
      setKpis(kpisData);
      setOrders(ordersData);
      setFlorists(floristsData);
    }
    loadData();
  }, []);

  const handleToggleVerification = (shopId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleFloristVerificationAction(shopId, currentStatus);
      if (res.success) {
        setFlorists((prev) =>
          prev.map((f) => (f.id === shopId ? { ...f, is_verified: res.newStatus } : f))
        );
        setAlertNotice(`Floristería actualizada: ${res.newStatus ? 'Verificada y activa' : 'Suspendida'}`);
        setTimeout(() => setAlertNotice(null), 4000);
      }
    });
  };

  const handleRefundOrder = (orderId: string, orderCode: string) => {
    if (!confirm(`¿Estás seguro de cancelar y reembolsar la orden ${orderCode}? Esta acción emitirá un reembolso directo.`)) return;

    startTransition(async () => {
      const res = await adminCancelAndRefundOrderAction(orderId, 'Cancelación solicitada por administración');
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled', payment_status: 'refunded' } : o))
        );
        setAlertNotice(`Orden ${orderCode} reembolsada exitosamente.`);
        setTimeout(() => setAlertNotice(null), 4000);
      }
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? ['placed', 'preparing', 'ready_for_pickup', 'courier_assigned', 'in_transit'].includes(o.status)
        : o.status === statusFilter;

    const matchesSearch =
      (o.order_code?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (o.recipient_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', paddingBottom: 60 }}>
      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--header-bg)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--card-border)',
          padding: '14px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              <ArrowLeft size={16} /> Marketplace
            </Link>
            <div style={{ height: 20, width: 1, background: 'var(--card-border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--primary-rose) 0%, var(--primary-deep) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-deep)', letterSpacing: -0.3 }}>
                AMar Fe • Command Center Nacional
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemePaletteSelector />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1320, margin: '32px auto 0 auto', padding: '0 20px' }}>
        {/* Alert Notice Banner */}
        {alertNotice && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#059669',
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle size={16} />
            <span>{alertNotice}</span>
          </div>
        )}

        {/* Executive KPI Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* GMV */}
          <div className="glass-card" style={{ padding: '22px 20px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Volumen Transaccionado (GMV)
              </span>
              <DollarSign size={20} color="var(--primary-rose)" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>
              ${kpis.gmvTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: '#10B981', fontWeight: 700, marginTop: 4 }}>
              +24.8% vs mes anterior
            </div>
          </div>

          {/* Platform Net Revenue */}
          <div className="glass-card" style={{ padding: '22px 20px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ingresos Plataforma (15%)
              </span>
              <TrendingUp size={20} color="#10B981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary-deep)' }}>
              ${kpis.platformNetRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Comisión neta de mercado
            </div>
          </div>

          {/* Active Orders */}
          <div className="glass-card" style={{ padding: '22px 20px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Órdenes Activas en Curso
              </span>
              <Package size={20} color="var(--primary-rose)" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>
              {kpis.activeOrdersCount}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              En preparación / En ruta
            </div>
          </div>

          {/* Fleet Online */}
          <div className="glass-card" style={{ padding: '22px 20px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Flota Climatizada Activa
              </span>
              <Truck size={20} color="#059669" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>
              {kpis.activeCouriersCount} choferes
            </div>
            <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 4 }}>
              {kpis.averageDeliveryTimeMin} min promedio de entrega
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 24,
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: 12,
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'orders', label: 'Monitor de Órdenes', icon: Package },
            { id: 'florists', label: 'Floristerías Asociadas', icon: Store },
            { id: 'couriers', label: 'Flota y Despacho', icon: Truck },
            { id: 'finance', label: 'Finanzas & Conciliación', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 9999,
                  border: isSelected ? '1.5px solid var(--primary-rose)' : '1px solid transparent',
                  background: isSelected ? 'var(--primary-rose)' : 'transparent',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ORDERS MONITOR */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter & Search Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'Todas las Órdenes' },
                  { id: 'active', label: 'En Curso' },
                  { id: 'delivered', label: 'Entregadas' },
                  { id: 'cancelled', label: 'Canceladas' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--card-border)',
                      background: statusFilter === f.id ? 'var(--primary-deep)' : 'var(--card-bg)',
                      color: statusFilter === f.id ? 'white' : 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--input-bg)',
                  border: '1.5px solid var(--input-border)',
                  padding: '6px 14px',
                  borderRadius: 12,
                  width: 320,
                }}
              >
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar por código o destinatario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="glass-card" style={{ borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.02)' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-muted)' }}>CÓDIGO</th>
                      <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-muted)' }}>ESTADO</th>
                      <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-muted)' }}>DESTINATARIO</th>
                      <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-muted)' }}>FLORISTERÍA</th>
                      <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL</th>
                      <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'right' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => {
                      let badgeBg = 'rgba(230, 57, 111, 0.12)';
                      let badgeColor = 'var(--primary-rose)';
                      let badgeText = ord.status;

                      if (ord.status === 'delivered') {
                        badgeBg = 'rgba(16, 185, 129, 0.15)';
                        badgeColor = '#059669';
                        badgeText = 'Entregado';
                      } else if (ord.status === 'in_transit') {
                        badgeBg = 'rgba(59, 130, 246, 0.15)';
                        badgeColor = '#2563EB';
                        badgeText = 'En Camino (GPS)';
                      } else if (ord.status === 'preparing') {
                        badgeBg = 'rgba(245, 158, 11, 0.15)';
                        badgeColor = '#D97706';
                        badgeText = 'En Creación';
                      } else if (ord.status === 'cancelled') {
                        badgeBg = 'rgba(239, 68, 68, 0.15)';
                        badgeColor = '#DC2626';
                        badgeText = 'Reembolsado';
                      }

                      return (
                        <tr
                          key={ord.id}
                          style={{
                            borderBottom: '1px solid var(--card-border)',
                            transition: 'background 0.15s',
                          }}
                        >
                          <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary-rose)' }}>
                            {ord.order_code}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: badgeBg,
                                color: badgeColor,
                                fontWeight: 800,
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 0.4,
                              }}
                            >
                              {badgeText}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ord.recipient_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ord.delivery_address}</div>
                          </td>
                          <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                            {ord.florist_shops?.name || 'Floristería Asociada'}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            ${Number(ord.total).toFixed(2)} MXN
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 8 }}>
                              <Link
                                href={`/?trackingOrder=${ord.order_code}`}
                                title="Ver telemetría satelital"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  background: 'var(--card-bg)',
                                  border: '1px solid var(--card-border)',
                                  color: 'var(--primary-deep)',
                                  textDecoration: 'none',
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                GPS
                              </Link>
                              {ord.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleRefundOrder(ord.id, ord.order_code)}
                                  title="Emitir reembolso inmediato"
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    color: '#DC2626',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Reembolsar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLORISTS MANAGEMENT */}
        {activeTab === 'florists' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {florists.map((f) => (
              <div key={f.id} className="glass-card" style={{ padding: 22, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {f.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <MapPin size={13} color="var(--primary-rose)" />
                      <span>{f.address}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 8,
                      background: f.is_verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: f.is_verified ? '#059669' : '#D97706',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {f.is_verified ? 'Verificada' : 'Pendiente'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tel: {f.phone}</span>
                  <button
                    onClick={() => handleToggleVerification(f.id, f.is_verified)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: f.is_verified ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-rose)',
                      color: f.is_verified ? '#DC2626' : 'white',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {f.is_verified ? 'Suspender Tienda' : 'Aprobar & Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: COURIERS FLEET */}
        {activeTab === 'couriers' && (
          <div className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
              Supervisión de Flota Climatizada (16 Unidades en Ruta)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Todos los mensajeros activos cuentan con verificación de vehículo con aire acondicionado para resguardar la frescura de los pétalos.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {[
                { name: 'Carlos Mendoza', car: 'Nissan Versa (A/C)', deliveries: 280, rating: 4.97, status: 'En ruta' },
                { name: 'Roberto Valdés', car: 'Chevrolet Aveo (A/C)', deliveries: 194, rating: 4.92, status: 'En ruta' },
                { name: 'Diana Escalante', car: 'Mazda 2 (A/C)', deliveries: 312, rating: 4.99, status: 'Disponible' },
                { name: 'Jorge H. Ríos', car: 'Volkswagen Gol (A/C)', deliveries: 142, rating: 4.88, status: 'En ruta' },
              ].map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>{c.name}</strong>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>{c.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.car}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-rose)', marginTop: 8 }}>
                    ⭐ {c.rating} • {c.deliveries} entregas exitosas
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FINANCE */}
        {activeTab === 'finance' && (
          <div className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
              Resumen de Conciliación Financiera y Comisiones
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 20 }}>
              <div style={{ padding: 18, borderRadius: 14, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GMV Bruto Procesado</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
                  ${kpis.gmvTotal.toFixed(2)} MXN
                </div>
              </div>
              <div style={{ padding: 18, borderRadius: 14, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Take Rate Plataforma (15%)</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary-deep)', marginTop: 4 }}>
                  ${(kpis.gmvTotal * 0.15).toFixed(2)} MXN
                </div>
              </div>
              <div style={{ padding: 18, borderRadius: 14, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Liquidación a Floristerías (75%)</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
                  ${(kpis.gmvTotal * 0.75).toFixed(2)} MXN
                </div>
              </div>
              <div style={{ padding: 18, borderRadius: 14, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tarifas de Choferes Climatizados</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#059669', marginTop: 4 }}>
                  ${(kpis.gmvTotal * 0.10).toFixed(2)} MXN
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
