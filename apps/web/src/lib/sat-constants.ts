// SAT Tax Regimes (CFDI 4.0)
export const TAX_REGIMES = [
  { code: '601', label: '601 - General de Ley Personas Morales' },
  { code: '605', label: '605 - Sueldos y Salarios' },
  { code: '612', label: '612 - Personas Físicas con Actividades Empresariales' },
  { code: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)' },
  { code: '616', label: '616 - Sin obligaciones fiscales' },
];

// SAT CFDI Usages (CFDI 4.0)
export const CFDI_USAGES = [
  { code: 'G01', label: 'G01 - Adquisición de mercancías' },
  { code: 'G03', label: 'G03 - Gastos en general' },
  { code: 'S01', label: 'S01 - Sin efectos fiscales' },
  { code: 'CP01', label: 'CP01 - Pagos' },
];

/**
 * Validates Mexican Tax Identification Number (RFC) for individuals & corporations
 */
export function isValidMexicanRFC(rfc: string): boolean {
  if (!rfc) return false;
  const clean = rfc.trim().toUpperCase();
  if (clean === 'XAXX010101000' || clean === 'XEXX010101000') return true;

  // Persona Física (13 chars) or Persona Moral (12 chars)
  const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
  return rfcRegex.test(clean);
}

export interface CFDI40TemplateParams {
  rfc: string;
  legalName: string;
  taxRegime: string;
  cfdiUsage: string;
  postalCode: string;
  orderCode: string;
  total: number;
  subtotal: number;
  iva: number;
  pacUuid: string;
  fecha?: string;
}

/**
 * Formats a standard SAT CFDI 4.0 XML document
 */
export function generateCFDI40Xml(p: CFDI40TemplateParams): string {
  const fecha = p.fecha || new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
    Version="4.0"
    Serie="AMF"
    Folio="${p.orderCode}"
    Fecha="${fecha}"
    SubTotal="${p.subtotal.toFixed(2)}"
    Moneda="MXN"
    Total="${p.total.toFixed(2)}"
    TipoDeComprobante="I"
    Exportacion="01"
    MetodoPago="PUE"
    LugarExpedicion="06700">
    <cfdi:Emisor Rfc="AMF260101XYZ" Nombre="AMAR FE PLATAFORMA FLORAL S.A.P.I. DE C.V." RegimenFiscal="601"/>
    <cfdi:Receptor Rfc="${p.rfc}" Nombre="${p.legalName}" DomicilioFiscalReceptor="${p.postalCode}" RegimenFiscalReceptor="${p.taxRegime}" UsoCFDI="${p.cfdiUsage}"/>
    <cfdi:Conceptos>
        <cfdi:Concepto ClaveProdServ="01010101" Cantidad="1" ClaveUnidad="ACT" Descripcion="Encargo floral y regalo afectivo - Pedido ${p.orderCode}" ValorUnitario="${p.subtotal.toFixed(2)}" Importe="${p.subtotal.toFixed(2)}" ObjetoImp="02">
            <cfdi:Impuestos>
                <cfdi:Traslados>
                    <cfdi:Traslado Base="${p.subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${p.iva.toFixed(2)}"/>
                </cfdi:Traslados>
            </cfdi:Impuestos>
        </cfdi:Concepto>
    </cfdi:Conceptos>
    <cfdi:Complemento>
        <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="1.1" UUID="${p.pacUuid}"/>
    </cfdi:Complemento>
</cfdi:Comprobante>`;
}
