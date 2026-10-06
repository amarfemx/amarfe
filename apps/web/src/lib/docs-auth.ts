import crypto from "crypto";

interface OtpEntry {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

interface SessionEntry {
  token: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}

// Global in-memory storage (persists across warm serverless invocations)
declare global {
  var __docsOtpStore: Map<string, OtpEntry> | undefined;
  var __docsSessionStore: Map<string, SessionEntry> | undefined;
}

const otpStore = global.__docsOtpStore || new Map<string, OtpEntry>();
if (process.env.NODE_ENV !== "production") global.__docsOtpStore = otpStore;

const sessionStore = global.__docsSessionStore || new Map<string, SessionEntry>();
if (process.env.NODE_ENV !== "production") global.__docsSessionStore = sessionStore;

export const DOCS_CONFIG = {
  get allowedEmail() {
    return (process.env.DOCS_AUTH_EMAIL || "amarfe.mx@gmail.com").toLowerCase().trim();
  },
  get allowedPassword() {
    return process.env.DOCS_AUTH_PASSWORD || "Admin.2026";
  },
  otpExpiryMinutes: 10,
  sessionExpiryHours: 24,
  cookieName: "amarfe_docs_session",
};

/**
 * Generate a 6-digit OTP code and save it
 */
export function generateOtp(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + DOCS_CONFIG.otpExpiryMinutes * 60 * 1000;

  otpStore.set(normalizedEmail, {
    code,
    email: normalizedEmail,
    expiresAt,
    attempts: 0,
  });

  return code;
}

/**
 * Verify OTP for an email
 */
export function verifyOtp(email: string, inputCode: string): { valid: boolean; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const entry = otpStore.get(normalizedEmail);

  if (!entry) {
    return { valid: false, error: "No hay un código activo. Solicite uno nuevo." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: "El código de verificación ha expirado. Solicite uno nuevo." };
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: "Demasiados intentos fallidos. Solicite un nuevo código." };
  }

  if (entry.code !== inputCode.trim()) {
    return { valid: false, error: "El código de verificación ingresado es incorrecto." };
  }

  // Code is valid -> clean up OTP
  otpStore.delete(normalizedEmail);
  return { valid: true };
}

/**
 * Create a new authenticated session
 */
export function createSession(email: string): { token: string; expiresAt: Date } {
  const normalizedEmail = email.toLowerCase().trim();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAtMs = Date.now() + DOCS_CONFIG.sessionExpiryHours * 60 * 60 * 1000;

  sessionStore.set(token, {
    token,
    email: normalizedEmail,
    expiresAt: expiresAtMs,
    createdAt: Date.now(),
  });

  return { token, expiresAt: new Date(expiresAtMs) };
}

/**
 * Validate a session token
 */
export function validateSession(token: string | undefined): { authenticated: boolean; email?: string } {
  if (!token) return { authenticated: false };

  const session = sessionStore.get(token);
  if (!session) return { authenticated: false };

  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    return { authenticated: false };
  }

  return { authenticated: true, email: session.email };
}

/**
 * Revoke a session token (logout)
 */
export function revokeSession(token: string | undefined): void {
  if (token) {
    sessionStore.delete(token);
  }
}

/**
 * Helper to dispatch notification email with OTP code
 */
export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  console.log(`[AMar Fe Security] ========================================`);
  console.log(`[AMar Fe Security] Email Code Sent to: ${email}`);
  console.log(`[AMar Fe Security] Security OTP Code: [ ${code} ]`);
  console.log(`[AMar Fe Security] Expires in: ${DOCS_CONFIG.otpExpiryMinutes} minutes`);
  console.log(`[AMar Fe Security] ========================================`);

  // If a transactional mail service (e.g. Resend, Sendgrid, Supabase SMTP) is configured:
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AMar Fe Security <security@amarfe.com>",
          to: [email],
          subject: `🔐 Tu código de acceso a la documentación confidencial: ${code}`,
          html: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E6396F; border-radius: 12px;">
              <h2 style="color: #700B34; margin-top: 0;">🌹 AMar Fe / ToLove Faith</h2>
              <p style="color: #333; font-size: 15px;">Has solicitado acceso a la <strong>Documentación Ejecutiva y Plan Financiero</strong> de AMar Fe.</p>
              <div style="background: #FDF6EE; border: 1px solid #E6396F; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
                <span style="font-size: 13px; color: #700B34; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Código de Verificación</span>
                <div style="font-size: 32px; font-weight: 800; color: #9D174D; letter-spacing: 6px; margin-top: 6px;">${code}</div>
              </div>
              <p style="font-size: 12px; color: #666;">Este código es de uso único y expirará en ${DOCS_CONFIG.otpExpiryMinutes} minutos. Si no solicitaste este acceso, puedes ignorar este correo.</p>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error("[AMar Fe Security] Error sending email via Resend:", err);
    }
  }

  return true;
}
