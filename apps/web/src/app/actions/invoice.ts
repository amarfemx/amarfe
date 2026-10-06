'use server';

export interface TaxInvoiceInput {
  orderCode: string;
  rfc: string;
  legalName: string;
  fiscalZip: string;
  taxRegime: string;
  cfdiUsage: string;
  totalAmount: number;
}

export interface TaxInvoiceResult {
  success: boolean;
  uuidFiscal?: string;
  xmlContent?: string;
  cadenaOriginal?: string;
  selloSat?: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
  error?: string;
}

export async function requestCfdiInvoiceAction(input: TaxInvoiceInput): Promise<TaxInvoiceResult> {
  const cleanRfc = input.rfc.trim().toUpperCase();

  // Validate Mexican RFC format
  const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
  if (!rfcRegex.test(cleanRfc) && cleanRfc !== 'XAXX010101000' && cleanRfc !== 'XEXX010101000') {
    return {
      success: false,
      error: 'El RFC ingresado no tiene un formato válido ante el SAT (ej. XAXX010101000 o PELE880101AB1).',
    };
  }

  if (!input.fiscalZip || input.fiscalZip.trim().length !== 5) {
    return {
      success: false,
      error: 'El Código Postal fiscal debe contener exactamente 5 dígitos para cotejo con el SAT.',
    };
  }

  // Generate simulated PAC UUID (Folio Fiscal SAT CFDI 4.0)
  const uuidFiscal = `AMF-${Math.random().toString(36).substring(2, 10).toUpperCase()}-4026-${Date.now().toString().slice(-4)}`;
  const subtotal = (input.totalAmount / 1.16).toFixed(2);
  const iva = (input.totalAmount - Number(subtotal)).toFixed(2);
  const fecha = new Date().toISOString();

  // Standard CFDI 4.0 XML template structure
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
    Version="4.0"
    Serie="AMF"
    Folio="${input.orderCode}"
    Fecha="${fecha}"
    SubTotal="${subtotal}"
    Moneda="MXN"
    Total="${input.totalAmount.toFixed(2)}"
    TipoDeComprobante="I"
    Exportacion="01"
    MetodoPago="PUE"
    LugarExpedicion="${input.fiscalZip}">
    <cfdi:Emisor Rfc="AMF240928ABC" Nombre="AMAR FE PLATAFORMA DE REGALOS SAPI DE CV" RegimenFiscal="601"/>
    <cfdi:Receptor Rfc="${cleanRfc}" Nombre="${input.legalName.toUpperCase()}" DomicilioFiscalReceptor="${input.fiscalZip}" RegimenFiscalReceptor="${input.taxRegime}" UsoCFDI="${input.cfdiUsage}"/>
    <cfdi:Conceptos>
        <cfdi:Concepto ClaveProdServ="01010101" Cantidad="1" ClaveUnidad="H87" Descripcion="Arreglo Floral y Regalo con Mensaje Caligrafiado (Orden ${input.orderCode})" ValorUnitario="${subtotal}" Importe="${subtotal}" ObjetoImp="02">
            <cfdi:Impuestos>
                <cfdi:Traslados>
                    <cfdi:Traslado Base="${subtotal}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${iva}"/>
                </cfdi:Traslados>
            </cfdi:Impuestos>
        </cfdi:Concepto>
    </cfdi:Conceptos>
    <cfdi:Impuestos TotalImpuestosTrasladados="${iva}">
        <cfdi:Traslados>
            <cfdi:Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${iva}"/>
        </cfdi:Traslados>
    </cfdi:Impuestos>
    <cfdi:Complemento>
        <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="1.1" UUID="${uuidFiscal}" FechaTimbrado="${fecha}" RfcProvCertif="SAT970701NN3"/>
    </cfdi:Complemento>
</cfdi:Comprobante>`;

  return {
    success: true,
    uuidFiscal,
    xmlContent,
    cadenaOriginal: `||4.0|AMF|${input.orderCode}|${fecha}|PUE|${cleanRfc}|${input.totalAmount.toFixed(2)}||`,
    selloSat: `SelloSAT_AMarFe_${Math.random().toString(36).substring(2, 18)}...`,
    qrCodeUrl: `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuidFiscal}&re=AMF240928ABC&rr=${cleanRfc}&tt=${input.totalAmount}&fe=${fecha.substring(13, 21)}`,
  };
}
