#!/usr/bin/env bash
# ==============================================================================
# AMar Fe - Generador de Certificados SSL Autofirmados (Desarrollo / Intranet)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="${SCRIPT_DIR}/ssl"

mkdir -p "${SSL_DIR}"

CERT_FILE="${SSL_DIR}/cert.pem"
KEY_FILE="${SSL_DIR}/key.pem"

if [ -f "${CERT_FILE}" ] && [ -f "${KEY_FILE}" ]; then
  echo "==> Los certificados SSL ya existen en ${SSL_DIR}"
  exit 0
fi

echo "==> Generando certificado SSL autofirmado RSA de 4096 bits para AMar Fe Web..."

openssl req -x509 -nodes -days 3650 -newkey rsa:4096 \
  -keyout "${KEY_FILE}" \
  -out "${CERT_FILE}" \
  -subj "/C=MX/ST=BajaCalifornia/L=Mexicali/O=UABC/OU=DIIS/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

chmod 600 "${KEY_FILE}"
chmod 644 "${CERT_FILE}"

echo "==> Certificados SSL generados exitosamente:"
echo "    Certificado: ${CERT_FILE}"
echo "    Llave Privada: ${KEY_FILE}"
