'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { 
  getFloristProfileAndShop, 
  getFloristProducts, 
  getOccasions, 
  createProductAction, 
  toggleProductAvailability, 
  deleteProductAction,
  toggleShopStatus 
} from '@/app/actions/florist';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { UserNav } from '@/app/components/UserNav';
import { 
  Store, 
  Plus, 
  Image as ImageIcon, 
  Clock, 
  DollarSign, 
  Sparkles, 
  Heart, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Power,
  Package,
  Eye,
  EyeOff,
  Flame,
  LayoutGrid,
  BellRing
} from 'lucide-react';
import { FloristKDS } from './FloristKDS';

export default function FloristDashboardPage() {
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kds' | 'catalog'>('kds');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { shop: shopData } = await getFloristProfileAndShop();
        setShop(shopData);
        if (shopData) {
          const [productsData, occasionsData] = await Promise.all([
            getFloristProducts(shopData.id),
            getOccasions(),
          ]);
          setProducts(productsData);
          setOccasions(occasionsData);
        }
      } catch (err) {
        console.error('Error loading florist data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleShop = async () => {
    if (!shop) return;
    const newStatus = !shop.is_open;
    setShop({ ...shop, is_open: newStatus });
    await toggleShopStatus(shop.id, newStatus);
  };

  const handleToggleProduct = async (productId: string, currentStatus: boolean) => {
    const updated = products.map((p) => p.id === productId ? { ...p, is_available: !currentStatus } : p);
    setProducts(updated);
    await toggleProductAvailability(productId, !currentStatus);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este arreglo del catálogo?')) return;
    setProducts(products.filter((p) => p.id !== productId));
    await deleteProductAction(productId);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createProductAction(formData);
      if (res?.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setStatusMessage({ type: 'success', text: '¡Arreglo publicado con éxito!' });
        setShowCreateModal(false);
        setImagePreview(null);
        form.reset();
        // Reload products
        if (shop) {
          const fresh = await getFloristProducts(shop.id);
          setProducts(fresh);
        }
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--card-border)',
        padding: '14px 24px',
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link 
              href="/" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                color: 'var(--primary-deep)', 
                textDecoration: 'none', 
                fontSize: 14, 
                fontWeight: 600 
              }}
            >
              <ArrowLeft size={18} />
              <span>Volver a Tienda</span>
            </Link>
            <div style={{ width: 1, height: 24, backgroundColor: 'var(--card-border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Store size={22} color="var(--primary-rose)" />
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {shop?.name || 'Portal de Floristería'}
                </h1>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {shop?.cities?.name ? `Sede ${shop.cities.name}, ${shop.cities.state}` : 'Gestión de Catálogo y Pedidos'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Shop Status Toggle */}
            {shop && (
              <button
                onClick={handleToggleShop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${shop.is_open ? 'var(--emerald-leaf)' : '#EF4444'}`,
                  backgroundColor: shop.is_open ? 'rgba(45, 106, 79, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: shop.is_open ? 'var(--emerald-leaf)' : '#DC2626',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Power size={15} />
                <span>{shop.is_open ? 'Floristería Abierta' : 'Floristería Cerrada'}</span>
              </button>
            )}

            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1240, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        {statusMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.type === 'success' ? '#10B981' : '#EF4444'}`,
            borderRadius: '14px',
            color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
            fontSize: 14,
            marginBottom: 24,
          }}>
            {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          <div className="glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Total Productos</span>
              <Package size={20} color="var(--primary-rose)" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
              {products.length}
            </div>
            <span style={{ fontSize: 12, color: 'var(--emerald-leaf)', fontWeight: 600 }}>
              {products.filter((p) => p.is_available).length} disponibles para entrega
            </span>
          </div>

          <div className="glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Tiempo Promedio Prep.</span>
              <Clock size={20} color="var(--primary-deep)" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
              25 min
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Listo para recolección de repartidor
            </span>
          </div>

          <div className="glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Calificación Floristería</span>
              <Heart size={20} color="var(--primary-rose)" fill="var(--primary-rose)" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
              {shop?.average_rating ? `${shop.average_rating} ★` : '5.0 ★'}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Basado en dedicatorias entregadas
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 28,
          borderBottom: '1px solid var(--card-border)',
          paddingBottom: 12,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setActiveTab('kds')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'kds' ? '1.5px solid var(--primary-rose)' : '1px solid var(--card-border)',
              backgroundColor: activeTab === 'kds' ? 'rgba(230, 57, 111, 0.15)' : 'transparent',
              color: activeTab === 'kds' ? 'var(--primary-rose)' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <BellRing size={17} />
            <span>KDS en Vivo & Alertas Sonoras</span>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981',
            }} />
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'catalog' ? '1.5px solid var(--primary-rose)' : '1px solid var(--card-border)',
              backgroundColor: activeTab === 'catalog' ? 'rgba(230, 57, 111, 0.15)' : 'transparent',
              color: activeTab === 'catalog' ? 'var(--primary-rose)' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LayoutGrid size={17} />
            <span>Catálogo de Arreglos ({products.length})</span>
          </button>
        </div>

        {/* Tab 1: KDS en Vivo */}
        {activeTab === 'kds' && shop && (
          <FloristKDS shopId={shop.id} />
        )}

        {/* Tab 2: Catálogo */}
        {activeTab === 'catalog' && (
          <>
            {/* Catalog Management Section Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 24,
            }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Catálogo de Arreglos & Ramos
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Crea nuevos ramos, ajusta precios y activa o pausa disponibilidad al instante.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
                style={{ padding: '12px 22px' }}
              >
                <Plus size={18} />
                <span>Crear Nuevo Arreglo</span>
              </button>
            </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Cargando catálogo de tu floristería...
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(230, 57, 111, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--primary-rose)',
            }}>
              <Sparkles size={32} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Aún no has agregado ramos a tu catálogo
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 460, margin: '0 auto 24px auto' }}>
              Publica tu primer diseño floral con fotos de alta calidad y ocasión para empezar a recibir pedidos de clientes.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus size={18} />
              <span>Publicar Primer Ramo</span>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 24,
          }}>
            {products.map((p) => {
              const img = p.images?.[0] || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80';
              return (
                <div
                  key={p.id}
                  className="glass-card"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: p.is_available ? 1 : 0.65,
                    position: 'relative',
                  }}
                >
                  {/* Image Container */}
                  <div style={{ position: 'relative', height: 210, width: '100%', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={p.title_es}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: p.is_available ? 'rgba(45, 106, 79, 0.92)' : 'rgba(239, 68, 68, 0.92)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 11,
                      fontWeight: 700,
                      backdropFilter: 'blur(6px)',
                    }}>
                      {p.is_available ? 'En Stock' : 'Pausado / Agotado'}
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                      {p.title_es}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      {p.title_en}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: 14,
                      borderTop: '1px solid var(--card-border)',
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-rose)' }}>
                        ${p.price} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>MXN</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleToggleProduct(p.id, p.is_available)}
                          title={p.is_available ? 'Pausar producto' : 'Activar producto'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--card-border)',
                            background: 'var(--input-bg)',
                            color: p.is_available ? '#D97706' : 'var(--emerald-leaf)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {p.is_available ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{p.is_available ? 'Pausar' : 'Activar'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Eliminar producto"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </main>

      {/* Modal: Crear Producto */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 1000,
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: 580,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 32,
            borderRadius: 24,
            background: 'var(--card-bg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Publicar Nuevo Arreglo Floral
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Sube foto a Supabase Storage y configura precios
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <input type="hidden" name="shopId" value={shop?.id} />

              {/* Image Upload */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Foto del Arreglo (Supabase Storage)
                </label>
                <div style={{
                  border: '2px dashed var(--card-border)',
                  borderRadius: 14,
                  padding: 18,
                  textAlign: 'center',
                  backgroundColor: 'var(--input-bg)',
                  position: 'relative',
                  cursor: 'pointer',
                }}>
                  {imagePreview ? (
                    <div style={{ position: 'relative', height: 160, width: '100%' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                      />
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <ImageIcon size={36} style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--primary-rose)' }} />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Haz clic para seleccionar o arrastra una imagen</div>
                      <div style={{ fontSize: 11 }}>JPG, PNG o WebP (Máx. 5MB)</div>
                    </div>
                  )}
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>

              {/* Title ES */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Título en Español *
                </label>
                <input
                  type="text"
                  name="titleEs"
                  required
                  placeholder="Ej. Ramo 50 Rosas Premium 'Pasión'"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1.5px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Title EN */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Título en Inglés (Bilingüe)
                </label>
                <input
                  type="text"
                  name="titleEn"
                  placeholder="Ej. 50 Premium Red Roses 'Passion' Bouquet"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1.5px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Price & Occasion */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Precio (MXN $) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    placeholder="850.00"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Ocasión Principal
                  </label>
                  <select
                    name="occasionId"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  >
                    <option value="">Selecciona una ocasión</option>
                    {occasions.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.name_es}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prep Time & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Minutos de Preparación
                  </label>
                  <input
                    type="number"
                    name="prepMinutes"
                    defaultValue="30"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue="50"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {isPending ? 'Guardando en Supabase...' : 'Guardar y Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
