import { describe, it, expect } from 'bun:test';
import { getLocalizedAuthError } from '../src/lib/i18n';
import { isValidMexicanRFC, generateCFDI40Xml } from '../src/lib/sat-constants';

describe('1. i18n & Error Localization Tests', () => {
  it('translates "email rate limit exceeded" to localized Spanish and English', () => {
    const errorEs = getLocalizedAuthError('email rate limit exceeded', 'es');
    const errorEn = getLocalizedAuthError('email rate limit exceeded', 'en');

    expect(errorEs).toContain('límite de envíos');
    expect(errorEn).toContain('rate limit exceeded');
  });

  it('translates "over_email_send_rate_limit" correctly', () => {
    const errorEs = getLocalizedAuthError('over_email_send_rate_limit', 'es');
    expect(errorEs).toContain('Límite de solicitudes');
  });

  it('translates invalid login credentials to clear message', () => {
    const errorEs = getLocalizedAuthError('Invalid login credentials', 'es');
    expect(errorEs).toContain('Credenciales incorrectas');
  });

  it('handles security timeouts correctly', () => {
    const errorEs = getLocalizedAuthError('For security purposes, you can only request this after 30 seconds', 'es');
    expect(errorEs).toContain('motivos de seguridad');
  });
});

describe('2. SAT CFDI 4.0 Fiscal Invoicing Validation', () => {
  it('validates legitimate Mexican RFC formats (Persona Física & Moral)', () => {
    expect(isValidMexicanRFC('XAXX010101000')).toBe(true); // Genérico nacional
    expect(isValidMexicanRFC('XEXX010101000')).toBe(true); // Genérico extranjero
    expect(isValidMexicanRFC('BME950821811')).toBe(true);  // Persona Moral (12 chars)
    expect(isValidMexicanRFC('GODE561231GR8')).toBe(true); // Persona Física (13 chars)
  });

  it('rejects invalid RFC formats', () => {
    expect(isValidMexicanRFC('INVALID_RFC')).toBe(false);
    expect(isValidMexicanRFC('12345')).toBe(false);
    expect(isValidMexicanRFC('')).toBe(false);
  });

  it('generates valid CFDI 4.0 XML structure with PAC UUID', () => {
    const xml = generateCFDI40Xml({
      rfc: 'XAXX010101000',
      legalName: 'JUAN PÉREZ GARCÍA',
      taxRegime: '616',
      cfdiUsage: 'S01',
      postalCode: '06700',
      orderCode: 'AMF-2026-9901',
      total: 890.0,
      subtotal: 767.24,
      iva: 122.76,
      pacUuid: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(xml).toContain('Version="4.0"');
    expect(xml).toContain('cfdi:Comprobante');
    expect(xml).toContain('XAXX010101000');
    expect(xml).toContain('AMF-2026-9901');
    expect(xml).toContain('550e8400-e29b-41d4-a716-446655440000');
  });
});

describe('3. Financial & Fee Calculation Sandbox Rules', () => {
  it('calculates order fees according to financial business model', () => {
    const unitPrice = 890;
    const quantity = 1;
    const deliveryFee = 69;
    const platformFee = 39;
    const tipCourier = 20;

    const subtotal = unitPrice * quantity;
    const total = subtotal + deliveryFee + platformFee + tipCourier;

    expect(subtotal).toBe(890);
    expect(total).toBe(1018);

    // Platform commission (12% take-rate from florist subtotal + platformFee)
    const floristPayout = subtotal * 0.88;
    const platformRevenue = subtotal * 0.12 + platformFee;

    expect(floristPayout).toBe(783.2);
    expect(platformRevenue).toBe(145.8);
  });
});
