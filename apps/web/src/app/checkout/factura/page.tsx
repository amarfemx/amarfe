'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Building,
  QrCode
} from 'lucide-react';
import { 
  requestCfdiInvoiceAction, 
  TaxInvoiceResult 
} from '@/app/actions/invoice';
import { TAX_REGIMES, CFDI_USAGES } from '@/lib/sat-constants';

export default function FacturacionPage() {
  const [orderCode, setOrderCode] = useState('');
  const [rfc, setRfc] = useState('');
  const [legalName, setLegalName] = useState('');
  const [fiscalZip, setFiscalZip] = useState('');
  const [taxRegime, setTaxRegime] = useState('626');
  const [cfdiUsage, setCfdiUsage] = useState('G03');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<TaxInvoiceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!orderCode || !rfc || !legalName || !fiscalZip) {
      setErrorMsg('Por favor completa todos los campos requeridos por el SAT.');
      return;
    }

    startTransition(async () => {
      const res = await requestCfdiInvoiceAction({
        orderCode: orderCode.trim().toUpperCase(),
        rfc: rfc.trim().toUpperCase(),
        legalName: legalName.trim(),
        fiscalZip: fiscalZip.trim(),
        taxRegime,
        cfdiUsage,
        totalAmount: 988.00,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Error al emitir factura CFDI 4.0.');
      } else {
        setResult(res);
      }
    });
  };

  const downloadXml = () => {
    if (!result?.xmlContent) return;
    const blob = new Blob([result.xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${result.uuidFiscal}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: 'var(--bg-gradient)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--primary-deep)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={16} /> Volver al Marketplace
        </Link>

        <div className="glass-card" style={{ padding: '36px 30px', borderRadius: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--primary-rose) 0%, var(--primary-deep) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                Portal Fiscal SAT (CFDI 4.0)
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Emisión de comprobantes fiscales digitales para México con validación PAC oficial.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: 14,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {result ? (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 18,
                  padding: 24,
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  ¡Factura Timbrada con Éxito!
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Tu CFDI 4.0 fue validado ante el SAT y registrado con su Folio Fiscal Digital (UUID).
                </p>

                <div
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: 12,
                    padding: 14,
                    marginTop: 16,
                    border: '1px solid var(--card-border)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>FOLIO FISCAL (UUID SAT):</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-rose)', letterSpacing: 0.5, wordBreak: 'break-all' }}>
                    {result.uuidFiscal}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={downloadXml}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Download size={16} /> Descargar XML (.xml)
                </button>
                <button
                  onClick={() => alert(`Visualización de factura PDF SAT para folio: ${result.uuidFiscal}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    borderRadius: 9999,
                    border: '1.5px solid var(--primary-rose)',
                    background: 'transparent',
                    color: 'var(--primary-deep)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={16} /> Ver PDF Timbrado
                </button>
              </div>

              <button
                onClick={() => { setResult(null); setOrderCode(''); }}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: 10,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ← Facturar otro encargo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  Código de Pedido AMar Fe *
                </label>
                <input
                  type="text"
                  placeholder="Ej. AMF-2026-8492"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    RFC del Contribuyente *
                  </label>
                  <input
                    type="text"
                    placeholder="RFC (12 o 13 caracteres)"
                    maxLength={13}
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid var(--input-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    Código Postal Fiscal *
                  </label>
                  <input
                    type="text"
                    placeholder="5 dígitos (ej. 11560)"
                    maxLength={5}
                    value={fiscalZip}
                    onChange={(e) => setFiscalZip(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid var(--input-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  Nombre o Razón Social (según Constancia SAT) *
                </label>
                <input
                  type="text"
                  placeholder="Ej. MARÍA FERNÁNDEZ GÓMEZ"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  Régimen Fiscal *
                </label>
                <select
                  value={taxRegime}
                  onChange={(e) => setTaxRegime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  {TAX_REGIMES.map((r) => (
                    <option key={r.code} value={r.code}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  Uso del CFDI *
                </label>
                <select
                  value={cfdiUsage}
                  onChange={(e) => setCfdiUsage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  {CFDI_USAGES.map((u) => (
                    <option key={u.code} value={u.code}>{u.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary"
                style={{ width: '100%', marginTop: 8, padding: 14, fontSize: 15 }}
              >
                {isPending ? 'Validando ante el SAT...' : 'Emitir Factura Electrónica CFDI 4.0'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
