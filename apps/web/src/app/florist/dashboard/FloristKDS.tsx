'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  getFloristActiveOrders, 
  acceptFloristOrder, 
  markBouquetReadyAction 
} from '@/app/actions/florist';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  Clock, 
  Camera, 
  CheckCircle, 
  Truck, 
  Sparkles, 
  Heart, 
  RefreshCw, 
  AlertCircle,
  X,
  UploadCloud,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface FloristKDSProps {
  shopId: string;
}

export function FloristKDS({ shopId }: FloristKDSProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderForPhoto, setSelectedOrderForPhoto] = useState<any | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const previousOrderCount = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesize pleasant 3-tone luxury concierge chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5 (Mayor arpeggio)
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        // Natural exponential decay
        gain.gain.setValueAtTime(0.001, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 1.3);
      });
    } catch (e) {
      console.warn('Audio playback not permitted or not supported yet:', e);
    }
  };

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await getFloristActiveOrders(shopId);
      
      // Check if a new placed/paid order arrived to trigger sound
      const placedOrders = (data || []).filter((o: any) => o.status === 'placed');
      if (placedOrders.length > previousOrderCount.current && soundEnabled && !loading) {
        playChime();
        setAlertBanner(`🌹 ¡Nuevo pedido entrante recibido! (${placedOrders[0].order_code})`);
        setTimeout(() => setAlertBanner(null), 8000);
      }
      previousOrderCount.current = placedOrders.length;

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching florist active orders:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to Supabase Realtime for orders table changes
    const supabase = createClient();
    const channel = supabase
      .channel(`florist-orders-${shopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `florist_id=eq.${shopId}`,
        },
        () => {
          fetchOrders(true);
        }
      )
      .subscribe();

    // Polling fallback every 15s
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [shopId, soundEnabled]);

  const handleAcceptOrder = (orderId: string) => {
    startTransition(async () => {
      await acceptFloristOrder(orderId);
      await fetchOrders(true);
    });
  };

  const handleOpenPhotoModal = (order: any) => {
    setSelectedOrderForPhoto(order);
    setPhotoPreview(order.prepared_photo_url || null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleUploadBouquet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrderForPhoto) return;

    const formData = new FormData(e.currentTarget);
    formData.append('orderId', selectedOrderForPhoto.id);

    startTransition(async () => {
      await markBouquetReadyAction(formData);
      setSelectedOrderForPhoto(null);
      setPhotoPreview(null);
      await fetchOrders(true);
    });
  };

  // Group orders by phase
  const newOrders = orders.filter(o => o.status === 'placed');
  const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'florist_accepted');
  const readyAndInTransit = orders.filter(o => ['ready_for_pickup', 'courier_assigned', 'in_transit'].includes(o.status));

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertBanner && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 border border-rose-500/40 text-white flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <span className="font-semibold text-rose-200">{alertBanner}</span>
          </div>
          <button 
            onClick={() => setAlertBanner(null)}
            className="text-xs px-3 py-1 rounded-full bg-rose-500/30 hover:bg-rose-500/50 text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* KDS Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Kitchen Display System (KDS Floristería)
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-normal">
                En Vivo (WebSockets)
              </span>
            </h2>
            <p className="text-xs text-rose-200/70">
              Gestión visual de preparación de arreglos con alertas sonoras en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playChime();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              soundEnabled
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }`}
            title="Activar/Desactivar campanilla de nuevo pedido"
          >
            {soundEnabled ? <Bell className="w-4 h-4 text-rose-400" /> : <BellOff className="w-4 h-4 text-gray-400" />}
            <span>{soundEnabled ? 'Alertas Sonoras: Activadas' : 'Silenciado'}</span>
          </button>

          {/* Test Sound Button */}
          <button
            onClick={playChime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-rose-200 border border-white/10 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Probar Campanilla</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchOrders()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
            title="Recargar órdenes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KDS 3-Column Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* COLUMN 1: NUEVOS PEDIDOS */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                1. Nuevos Pedidos
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              {newOrders.length}
            </span>
          </div>

          {newOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-white/40 text-xs">
              Sin pedidos nuevos pendientes de aceptación
            </div>
          ) : (
            newOrders.map((order) => (
              <div 
                key={order.id} 
                className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900/60 border-2 border-rose-500/50 shadow-lg shadow-rose-950/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {order.order_code}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-rose-200/70">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Products list */}
                <div className="space-y-1.5 text-xs text-white">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                      <span className="font-medium">{item.quantity}x {item.product_title || item.products?.title_es}</span>
                      <span className="text-rose-300 font-mono">${item.subtotal || item.unit_price} MXN</span>
                    </div>
                  ))}
                </div>

                {/* Dedication Card Preview */}
                {order.card_message && (
                  <div className="p-2.5 rounded-xl bg-pink-950/30 border border-pink-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-pink-300 font-semibold text-[11px]">
                      <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                      <span>Tarjeta Dedicatoria {order.is_anonymous ? '(Admirador Secreto)' : ''}</span>
                    </div>
                    <p className="italic text-white/80 line-clamp-2">"{order.card_message}"</p>
                    <div className="text-[10px] text-pink-200/60 text-right">
                      De: {order.is_anonymous ? 'Anónimo' : (order.card_sender_name || 'Remitente')}
                    </div>
                  </div>
                )}

                {/* Recipient Details */}
                <div className="text-[11px] text-white/60 space-y-0.5 pt-1 border-t border-white/5">
                  <p><strong>Destinatario:</strong> {order.recipient_name} ({order.recipient_phone})</p>
                  <p className="truncate"><strong>Entrega:</strong> {order.delivery_address}</p>
                </div>

                {/* Action button */}
                <button
                  disabled={isPending}
                  onClick={() => handleAcceptOrder(order.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Aceptar y Comenzar a Preparar</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* COLUMN 2: EN PREPARACIÓN */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                2. En Preparación
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              {preparingOrders.length}
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-white/40 text-xs">
              Sin ramos en taller actualmente
            </div>
          ) : (
            preparingOrders.map((order) => (
              <div 
                key={order.id} 
                className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900/60 border border-amber-500/40 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {order.order_code}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                    Taller en progreso
                  </span>
                </div>

                {/* Products list */}
                <div className="space-y-1.5 text-xs text-white">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                      <span className="font-medium">{item.quantity}x {item.product_title || item.products?.title_es}</span>
                    </div>
                  ))}
                </div>

                {/* Recipient & card note summary */}
                <div className="p-2.5 rounded-xl bg-white/5 text-xs space-y-1 text-white/80">
                  <p><strong>Para:</strong> {order.recipient_name}</p>
                  {order.card_message && (
                    <p className="italic text-[11px] text-pink-300 line-clamp-1">
                      Nota: "{order.card_message}"
                    </p>
                  )}
                </div>

                {/* Button to Upload Bouquet Photo & Dispatch */}
                <button
                  onClick={() => handleOpenPhotoModal(order)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Subir Foto de Ramo & Solicitar Repartidor</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* COLUMN 3: LISTO PARA RECOGER & EN CAMINO */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                3. Listo / En Camino
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              {readyAndInTransit.length}
            </span>
          </div>

          {readyAndInTransit.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-white/40 text-xs">
              Sin ramos listos en espera de repartidor
            </div>
          ) : (
            readyAndInTransit.map((order) => (
              <div 
                key={order.id} 
                className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-900/60 border border-emerald-500/40 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {order.order_code}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'in_transit' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {order.status === 'in_transit' ? 'En ruta con repartidor' : 'Listo para recolectar'}
                  </span>
                </div>

                {/* Prepared Bouquet Photo Preview */}
                {order.prepared_photo_url && (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-emerald-500/30">
                    <img 
                      src={order.prepared_photo_url} 
                      alt="Ramo terminado" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-[10px] text-white px-1.5 py-0.5 rounded">
                      Foto Verificada
                    </div>
                  </div>
                )}

                <div className="text-xs text-white/80 space-y-1">
                  <p><strong>Destino:</strong> {order.recipient_name}</p>
                  <p className="text-[11px] text-white/60 truncate">{order.delivery_address}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{order.status === 'in_transit' ? 'Repartidor en camino' : 'Buscando repartidor...'}</span>
                  </span>
                  <span className="text-white/40 font-mono text-[10px]">
                    ID: {order.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL: SUBIR FOTO DEL RAMO PREPARADO */}
      {selectedOrderForPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">
                  Foto de Evidencia del Ramo Listo
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedOrderForPhoto(null);
                  setPhotoPreview(null);
                }}
                className="text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-rose-200/70">
              Orden <strong>{selectedOrderForPhoto.order_code}</strong>. Sube una fotografía del arreglo floral terminado para que el cliente la previsualice y se despache al repartidor.
            </p>

            <form onSubmit={handleUploadBouquet} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/80">
                  Seleccionar o Tomar Fotografía
                </label>
                <input
                  type="file"
                  name="photoFile"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="w-full text-xs text-white/70 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-500/20 file:text-rose-300 hover:file:bg-rose-500/30"
                />
              </div>

              {photoPreview && (
                <div className="rounded-xl overflow-hidden aspect-video border border-white/20 relative">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="flex-1 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs shadow-md shadow-rose-500/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isPending ? 'Guardando...' : 'Confirmar Ramo Listo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
