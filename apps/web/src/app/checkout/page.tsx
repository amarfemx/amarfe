'use client';

import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createOrderAction, CreateOrderInput } from '@/app/actions/checkout';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { UserNav } from '@/app/components/UserNav';
import { 
  Heart, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock, 
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';

const messageTemplates = [
  { label: '🌹 Amor & Pasión', text: 'Cada pétalo de estas flores lleva un pedacito de mi corazón para ti. Te amo infinitamente.' },
  { label: '🕊️ Pedir Perdón', text: 'Siento profundamente lo sucedido. Estas flores son un sincero abrazo y mi deseo de empezar de nuevo.' },
  { label: '✨ Aniversario', text: 'Gracias por cada risa, cada abrazo y cada día juntos. ¡Feliz Aniversario mi vida!' },
  { label: '💛 Amistad Incondicional', text: 'Porque las almas como la tuya iluminan el mundo. ¡Gracias por tu valiosa amistad!' },
];

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get('productId') || 'p1';
  const productTitle = searchParams.get('title') || 'Ramo 24 Rosas Rojas Terciopelo \'Amor Eterno\'';
  const unitPrice = parseFloat(searchParams.get('price') || '890');
  const imageUrl = searchParams.get('image') || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80';
  const floristId = searchParams.get('floristId') || 'default';

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryTiming, setDeliveryTiming] = useState<'express' | 'scheduled'>('express');
  const [scheduledDate, setScheduledDate] = useState('');

  // Card Dedication State
  const [cardMessage, setCardMessage] = useState('');
  const [cardSender, setCardSender] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago'>('stripe');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderCode: string; total: number } | null>(null);

  const deliveryFee = 69.00;
  const platformFee = 39.00;
  const tipCourier = 20.00;
  const total = unitPrice + deliveryFee + platformFee + tipCourier;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientPhone || !deliveryAddress) {
      setErrorMsg('Por favor completa todos los datos obligatorios del destinatario.');
      return;
    }

    setErrorMsg(null);

    const payload: CreateOrderInput = {
      productId,
      productTitle,
      unitPrice,
      quantity: 1,
      floristId,
      recipientName,
      recipientPhone,
      deliveryAddress,
      deliveryInstructions,
      deliveryLat: 19.4326,
      deliveryLng: -99.1332,
      cardMessage,
      cardSenderName: cardSender,
      isAnonymous,
      scheduledFor: deliveryTiming === 'scheduled' ? scheduledDate : undefined,
      paymentProvider: paymentMethod,
      deliveryFee,
      platformFee,
      tipCourier,
    };

    startTransition(async () => {
      const res = await createOrderAction(payload);
      if (res?.error) {
        setErrorMsg(res.error);
      } else if (res?.success) {
        setConfirmedOrder({
          orderCode: res.orderCode,
          total: res.total,
        });
      }
    });
  };

  if (confirmedOrder) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'radial-gradient(circle at 50% 20%, rgba(255, 240, 245, 0.9) 0%, rgba(255, 255, 255, 1) 90%)',
      }}>
        <div className="glass-card" style={{
          maxWidth: 540,
          width: '100%',
          padding: '40px 32px',
          textAlign: 'center',
          borderRadius: 28,
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 20px auto',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            ¡Pedido Confirmado con Éxito!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Tu detalle floral ya está siendo coordinado con la floristería asociada para su preparación artesanal.
          </p>

          <div style={{
            background: 'var(--input-bg)',
            border: '1.5px solid var(--card-border)',
            borderRadius: 18,
            padding: '20px',
            marginBottom: 28,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Código de Rastreo:</span>
              <strong style={{ fontSize: 14, color: 'var(--primary-rose)', letterSpacing: 0.5 }}>
                {confirmedOrder.orderCode}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Destinatario:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{recipientName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Pagado:</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-deep)' }}>
                ${confirmedOrder.total.toFixed(2)} MXN
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tiempo estimado:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--emerald-leaf)' }}>
                {deliveryTiming === 'express' ? '60 - 90 minutos' : 'Fecha programada'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              href={`/?trackingOrder=${confirmedOrder.orderCode}`}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '14px', fontSize: 15 }}
            >
              <Sparkles size={18} />
              <span>Ver Seguimiento Satelital en Tiempo Real</span>
            </Link>
            <Link
              href={`/checkout/factura?orderCode=${confirmedOrder.orderCode}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--primary-rose)',
                background: 'transparent',
                color: 'var(--primary-deep)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              <FileText size={16} />
              <span>Solicitar Factura Fiscal SAT (CFDI 4.0)</span>
            </Link>
            <Link
              href="/"
              style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}
            >
              Regresar al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
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
          maxWidth: 1140,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <ArrowLeft size={18} color="var(--primary-deep)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-deep)' }}>Volver al Catálogo</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main style={{ maxWidth: 1140, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Personalización de Entrega & Checkout Seguro
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Dedicatoria de amor, datos del destinatario y pago encriptado
          </p>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 14,
            color: '#991B1B',
            fontSize: 14,
            marginBottom: 24,
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          alignItems: 'start',
        }}>
          {/* LEFT COLUMN: Recipient & Dedication Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Section 1: Tarjeta de Dedicatoria */}
            <div className="glass-card" style={{ padding: '26px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Heart size={20} color="var(--primary-rose)" fill="var(--primary-rose)" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  1. Tarjeta de Dedicatoria Personalizada
                </h2>
              </div>

              {/* Template Buttons */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Inspírate con dedicatorias emotivas:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {messageTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCardMessage(t.text)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--card-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Textarea */}
              <div style={{ marginBottom: 16 }}>
                <textarea
                  rows={4}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  placeholder="Escribe desde tu corazón las palabras que acompañarán este detalle..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 14,
                    border: '1.5px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 15,
                    lineHeight: 1.6,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Sender & Anonymous Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!isAnonymous && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Nombre del Remitente en la Tarjeta:
                    </label>
                    <input
                      type="text"
                      value={cardSender}
                      onChange={(e) => setCardSender(e.target.value)}
                      placeholder="Ej. Tu Amor Secreto, Carlos, etc."
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
                )}

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ accentColor: 'var(--primary-rose)', width: 16, height: 16 }}
                  />
                  <span>Enviar como <strong>Admirador Secreto</strong> (100% Anónimo)</span>
                </label>
              </div>
            </div>

            {/* Section 2: Datos de Quien Recibe */}
            <div className="glass-card" style={{ padding: '26px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <MapPin size={20} color="var(--primary-deep)" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  2. Datos de Destinatario & Entrega
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Nombre del Destinatario *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ej. Valeria Mendoza"
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
                    Teléfono del Destinatario *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
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

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Dirección de Entrega Completa *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Calle, Número exterior/interior, Colonia, Alcaldía/Ciudad"
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

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Instrucciones Especiales o Referencias
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Ej. Tocar timbre 3B, dejar en recepción con vigilancia, etc."
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

              {/* Timing Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Horario de Entrega:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div
                    onClick={() => setDeliveryTiming('express')}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: deliveryTiming === 'express' ? '2px solid var(--primary-rose)' : '1.5px solid var(--input-border)',
                      backgroundColor: deliveryTiming === 'express' ? 'rgba(230, 57, 111, 0.08)' : 'var(--input-bg)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-rose)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={15} /> Entrega Exprés
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      En 60 a 90 minutos con tracking en vivo
                    </div>
                  </div>

                  <div
                    onClick={() => setDeliveryTiming('scheduled')}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: deliveryTiming === 'scheduled' ? '2px solid var(--primary-rose)' : '1.5px solid var(--input-border)',
                      backgroundColor: deliveryTiming === 'scheduled' ? 'rgba(230, 57, 111, 0.08)' : 'var(--input-bg)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={15} /> Programar Fecha
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Elegir día y hora específica
                    </div>
                  </div>
                </div>

                {deliveryTiming === 'scheduled' && (
                  <div style={{ marginTop: 12 }}>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1.5px solid var(--input-border)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: '26px 28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>
                Resumen de tu Pedido
              </h2>

              {/* Product Card */}
              <div style={{ display: 'flex', gap: 14, paddingBottom: 18, borderBottom: '1px solid var(--card-border)' }}>
                <img
                  src={imageUrl}
                  alt={productTitle}
                  style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {productTitle}
                  </h4>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Cantidad: 1 ramo exclusivo
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-rose)', marginTop: 4 }}>
                    ${unitPrice} MXN
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Subtotal Arreglo:</span>
                  <span>${unitPrice.toFixed(2)} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Tarifa de Envío Local:</span>
                  <span>${deliveryFee.toFixed(2)} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Tarifa de Plataforma & Tracking:</span>
                  <span>${platformFee.toFixed(2)} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Propina Repartidor sugerida:</span>
                  <span>${tipCourier.toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16, marginBottom: 24 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Total a Pagar:</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-deep)' }}>
                    ${total.toFixed(2)} <span style={{ fontSize: 12, fontWeight: 600 }}>MXN</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    (~${(total / 18).toFixed(2)} USD)
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                  Método de Pago Seguro:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: paymentMethod === 'stripe' ? '2px solid var(--primary-rose)' : '1.5px solid var(--input-border)',
                      backgroundColor: paymentMethod === 'stripe' ? 'rgba(230, 57, 111, 0.08)' : 'var(--input-bg)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <CreditCard size={15} color="var(--primary-rose)" />
                    <span>Tarjeta (Stripe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mercadopago')}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: paymentMethod === 'mercadopago' ? '2px solid var(--primary-rose)' : '1.5px solid var(--input-border)',
                      backgroundColor: paymentMethod === 'mercadopago' ? 'rgba(230, 57, 111, 0.08)' : 'var(--input-bg)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <span>Mercado Pago</span>
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
                  padding: 16,
                  fontSize: 16,
                  cursor: isPending ? 'wait' : 'pointer',
                }}
              >
                {isPending ? (
                  <span>Procesando pago seguro...</span>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Pagar ${total.toFixed(2)} MXN & Enviar</span>
                  </>
                )}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 14,
                fontSize: 11,
                color: 'var(--text-muted)',
              }}>
                <ShieldCheck size={14} color="var(--emerald-leaf)" />
                <span>Encriptación bancaria SSL de 256 bits</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--primary-rose)', fontWeight: 600 }}>Cargando checkout...</div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
