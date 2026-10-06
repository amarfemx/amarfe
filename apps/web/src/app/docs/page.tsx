"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Presentation, 
  TrendingUp, 
  Download, 
  ExternalLink, 
  ArrowLeft, 
  Award, 
  Building2, 
  Lock, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  LogOut,
  RefreshCw,
  Clock
} from "lucide-react";

export default function DocsPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authStep, setAuthStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes countdown

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<"all" | "investors" | "licensing">("all");

  // Check initial session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/docs/session");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUserEmail(data.email || "");
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (authStep === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1: Submit Credentials & Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/docs/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Credenciales inválidas.");
        setLoading(false);
        return;
      }

      setAuthStep("otp");
      setCountdown(600);
      setSuccessMessage(data.message || "Código enviado exitosamente a su correo.");
    } catch (err: any) {
      setErrorMessage("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/docs/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Código incorrecto o expirado.");
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(data.email || email);
    } catch (err: any) {
      setErrorMessage("Error al verificar el código de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/docs/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || "No se pudo reenviar el código.");
      } else {
        setCountdown(600);
        setSuccessMessage("Nuevo código de seguridad enviado a su correo.");
      }
    } catch {
      setErrorMessage("Error al reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/docs/session", { method: "DELETE" });
    setIsAuthenticated(false);
    setAuthStep("credentials");
    setEmail("");
    setPassword("");
    setOtpCode("");
  };

  const investorDocs = [
    {
      title: "Plan Financiero & Tesis de Inversión (Q1)",
      description: "Desglose financiero a 90 días, modelo de unit economics (5.9x LTV/CAC), retorno de inversión (+94.6% ROI) y valuación post-Q1.",
      icon: TrendingUp,
      badge: "Ronda Semilla $50K USD",
      htmlUrl: "/docs/Plan-Financiero.html",
      pdfUrl: "/docs/Plan-Financiero.pdf",
      highlight: true,
    },
    {
      title: "Pitch Deck para Inversionistas (Slides)",
      description: "Presentación ejecutiva interactiva en diapositivas para fondos de Venture Capital y ángeles inversionistas.",
      icon: Presentation,
      badge: "Deck Interactivo",
      htmlUrl: "/docs/Presentacion-Inversionistas.html",
      pdfUrl: "/docs/Presentacion-Inversionistas-Beamer.pdf",
      highlight: false,
    },
    {
      title: "Poster Ejecutivo de Financiamiento",
      description: "Resumen infográfico de una página con métricas clave, desglose de capital y propuesta de valor binacional.",
      icon: FileText,
      badge: "Executive Poster",
      htmlUrl: "/docs/Poster-Financiamiento.html",
      pdfUrl: null,
      highlight: false,
    },
  ];

  const licensingDocs = [
    {
      title: "Propuesta de Licenciamiento & Franquicia Digital",
      description: "Modelo B2B SaaS y franquicia tecnológica territorial con marca blanca (White-Label) y puesta en marcha en 14 días.",
      icon: Building2,
      badge: "SaaS / White-Label",
      htmlUrl: "/docs/venta-app/Venta-app.html",
      pdfUrl: "/docs/venta-app/Venta-app.pdf",
      highlight: true,
    },
    {
      title: "Presentación Comercial de Licenciamiento",
      description: "Deck en diapositivas con desglose de arquitectura Next.js 15 + Flutter, planes B2B y cálculo de ROI para el franquiciatario.",
      icon: Presentation,
      badge: "Deck Comercial",
      htmlUrl: "/docs/venta-app/Presentacion-Venta.html",
      pdfUrl: "/docs/venta-app/Presentacion-Venta-Beamer.pdf",
      highlight: false,
    },
  ];

  const competitorsData = [
    {
      feature: "Tiempo de Entrega",
      amarfe: "⚡ 60 a 90 min (On-Demand)",
      enviaflores: "4 a 6 horas o ventanas de día",
      lolaflora: "Mismo día o retraso de 24h",
      rappi: "45 a 60 min",
    },
    {
      feature: "Telemetría Satelital GPS en Vivo",
      amarfe: "🛰️ Sí, en tiempo real con velocímetro & ETA",
      enviaflores: "❌ Pasos estáticos ('En camino')",
      lolaflora: "❌ Solo SMS / Correo",
      rappi: "⚠️ Ruta básica sin foco floral",
    },
    {
      feature: "Cuidado de la Flor en Tránsito",
      amarfe: "🚗 Automóvil climatizado dedicado",
      enviaflores: "🚚 Furgoneta en ruta masiva (calor)",
      lolaflora: "🚚 Paquetería terciarizada",
      rappi: "🛵 Motocicleta / Mochila (maltrato)",
    },
    {
      feature: "Dedicatoria & Admirador Secreto",
      amarfe: "💌 Caligrafía de lujo + Anonimato total",
      enviaflores: "📄 Tarjeta impresa térmica estándar",
      lolaflora: "📄 Texto plano básico",
      rappi: "❌ Sin dedicatoria formal",
    },
    {
      feature: "Evidencia Visual de Taller (KDS)",
      amarfe: "📸 Foto obligatoria antes de despacho",
      enviaflores: "❌ No disponible",
      lolaflora: "❌ No disponible",
      rappi: "❌ No disponible",
    },
    {
      feature: "Comisión para la Floristería",
      amarfe: "💎 12% Fijo (Florista retiene 88%)",
      enviaflores: "20% a 30% variable y opaca",
      lolaflora: "25% a 35% de intermediación",
      rappi: "25% a 35% + comisiones pasarela",
    },
    {
      feature: "Facturación Fiscal SAT CFDI 4.0",
      amarfe: "🏛️ Automática con XML y sello PAC",
      enviaflores: "Portal externo con demora",
      lolaflora: "Manual con fricción fiscal",
      rappi: "Terciarizada con inconsistencias",
    },
    {
      feature: "Pagos Binacionales US-MX",
      amarfe: "💳 Stripe + Apple/Google Pay + MP",
      enviaflores: "Fricción en tarjetas de EE.UU.",
      lolaflora: "Métodos internacionales limitados",
      rappi: "Solo métodos locales",
    },
  ];

  // Loading initial session check
  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <Loader2 className="animate-spin" size={36} color="var(--primary-rose)" />
      </div>
    );
  }

  // If Not Authenticated -> Show 2FA Security Login Gate
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #180B14 0%, #3B1225 50%, #1A0711 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Navbar */}
        <header style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(244, 63, 94, 0.2)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #E6396F 0%, #9D174D 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white" }}>
              🌹
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>
                AMar Fe <span style={{ fontSize: 12, color: "#FDA4AF" }}>/ ToLove Faith</span>
              </div>
              <div style={{ fontSize: 10, color: "#E2CBD7" }}>Portal Confidencial</div>
            </div>
          </Link>

          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "#FDA4AF", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver a la Tienda
          </Link>
        </header>

        {/* Auth Box Container */}
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1.5px solid rgba(244, 63, 94, 0.3)",
              borderRadius: 24,
              padding: "40px 36px",
              maxWidth: 460,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              color: "white",
            }}
          >
            {/* Header Lock Icon */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #E6396F 0%, #9D174D 100%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(230, 57, 111, 0.4)",
                  marginBottom: 16,
                }}
              >
                {authStep === "credentials" ? <Lock size={26} color="white" /> : <KeyRound size={26} color="white" />}
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, margin: "0 0 8px 0" }}>
                {authStep === "credentials" ? "Acceso Confidencial" : "Verificación de Seguridad (2FA)"}
              </h2>
              <p style={{ fontSize: 13, color: "#E2CBD7", lineHeight: 1.5, margin: 0 }}>
                {authStep === "credentials"
                  ? "Ingrese sus credenciales de inversionista o socio comercial para recibir su código de acceso."
                  : `Hemos enviado un código de 6 dígitos a su correo electrónico registrado.`}
              </p>
            </div>

            {/* Alerts */}
            {errorMessage && (
              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, color: "#FCA5A5", fontSize: 12, marginBottom: 20 }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div style={{ background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.4)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, color: "#6EE7B7", fontSize: 12, marginBottom: 20 }}>
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Step 1: Credentials Form */}
            {authStep === "credentials" ? (
              <form onSubmit={handleRequestOtp}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#FDA4AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Correo Electrónico
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} color="#FDA4AF" style={{ position: "absolute", left: 14, top: 14 }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      autoComplete="email"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 40px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 12,
                        color: "white",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#FDA4AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Contraseña de Acceso
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="#FDA4AF" style={{ position: "absolute", left: 14, top: 14 }} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 40px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 12,
                        color: "white",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg, #E6396F 0%, #9D174D 100%)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 16px rgba(230, 57, 111, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Verificar y Enviar Código por Email"}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#FDA4AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>
                    Código de 6 Dígitos
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "2px solid #E6396F",
                      borderRadius: 14,
                      color: "white",
                      fontSize: 28,
                      fontWeight: 800,
                      letterSpacing: 10,
                      textAlign: "center",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: "#E2CBD7" }}>
                    <Clock size={14} color="#FDA4AF" />
                    <span>Código válido durante: <strong>{formatTime(countdown)}</strong></span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: loading || otpCode.length < 6 ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 16px rgba(5, 150, 105, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Validar Código & Acceder"}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{ background: "none", border: "none", color: "#FDA4AF", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}
                  >
                    <RefreshCw size={12} /> Reenviar código
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("credentials");
                      setOtpCode("");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    style={{ background: "none", border: "none", color: "#E2CBD7", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Cambiar credenciales
                  </button>
                </div>
              </form>
            )}

            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", marginTop: 24, paddingTop: 16, textAlign: "center", fontSize: 11, color: "#FDA4AF" }}>
              🔒 Acceso restringido bajo acuerdo de confidencialidad NDA.
            </div>
          </div>
        </main>

        <footer style={{ padding: "16px 24px", textAlign: "center", fontSize: 11, color: "rgba(255, 255, 255, 0.4)" }}>
          © {new Date().getFullYear()} AMar Fe / ToLove Faith. Todos los derechos reservados.
        </footer>
      </div>
    );
  }

  // If Authenticated -> Full Docs Portal
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: "1px solid rgba(230, 57, 111, 0.15)",
          background: "var(--header-bg)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--primary-rose) 0%, var(--primary-deep) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
                boxShadow: "var(--shadow-rose)",
              }}
            >
              🌹
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--primary-deep)", lineHeight: 1.1 }}>
                AMar Fe <span style={{ fontSize: 13, color: "var(--primary-rose)", fontWeight: 600 }}>/ ToLove Faith</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                Portal Ejecutivo & Documentación de Inversión
              </div>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(5, 150, 105, 0.1)", border: "1px solid rgba(5, 150, 105, 0.3)", padding: "6px 12px", borderRadius: 9999, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#059669", fontWeight: 700 }}>
              <ShieldCheck size={14} /> Acceso Seguro (24h)
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(230, 57, 111, 0.25)",
                background: "white",
                color: "var(--primary-deep)",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <LogOut size={14} /> Salir
            </button>

            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(230, 57, 111, 0.25)",
                background: "white",
                color: "var(--primary-deep)",
                fontWeight: 600,
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} /> Tienda
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section style={{ background: "linear-gradient(135deg, #180B14 0%, #3B1225 50%, #1A0711 100%)", color: "white", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ background: "rgba(230, 57, 111, 0.25)", border: "1px solid rgba(244, 63, 94, 0.4)", color: "#FDA4AF", padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              💎 Tesis de Inversión & SaaS B2B
            </span>
            <span style={{ background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.35)", color: "#6EE7B7", padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              ⚡ Ronda Semilla $50K USD
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.2 }}>
            Centro Ejecutivo de Documentación & Propuesta Comercial
          </h1>
          <p style={{ color: "#E2CBD7", fontSize: 16, maxWidth: 840, lineHeight: 1.6, margin: "0 0 28px 0" }}>
            Consulta los planes financieros, pitch decks interactivos y comparativas de mercado contra los principales incumbentes. Todos los documentos están disponibles en formato interactivo (HTML) y formato listo para descargar (PDF).
          </p>

          {/* KPI Highlights Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#FDA4AF", fontWeight: 700 }}>Activo Tecnológico Propietario</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", marginTop: 4 }}>$90,200 USD</div>
              <div style={{ fontSize: 11, color: "#E2CBD7", marginTop: 2 }}>1,500 hrs de desarrollo terminadas</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.06)", padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#34D399", fontWeight: 700 }}>Unit Economics (LTV / CAC)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#34D399", marginTop: 4 }}>5.9x</div>
              <div style={{ fontSize: 11, color: "#E2CBD7", marginTop: 2 }}>Margen bruto plataforma: 23.8%</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.06)", padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#FBBF24", fontWeight: 700 }}>Retorno de Inversión (Q1)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FBBF24", marginTop: 4 }}>+94.6% ROI</div>
              <div style={{ fontSize: 11, color: "#E2CBD7", marginTop: 2 }}>Break-even alcanzado en Mes 2</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.06)", padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#60A5FA", fontWeight: 700 }}>Mercado Binacional (TAM)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", marginTop: 4 }}>$2,950M USD</div>
              <div style={{ fontSize: 11, color: "#E2CBD7", marginTop: 2 }}>México + Remesas Emocionales EE.UU.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main style={{ maxWidth: 1240, width: "100%", margin: "0 auto", padding: "40px 24px", flex: 1 }}>
        {/* Category Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: selectedCategory === "all" ? "var(--primary-deep)" : "white",
              color: selectedCategory === "all" ? "white" : "var(--text-muted)",
              boxShadow: selectedCategory === "all" ? "var(--shadow-rose)" : "none",
              border: "1px solid rgba(230,57,111,0.2)",
            }}
          >
            📂 Todos los Documentos
          </button>
          <button
            onClick={() => setSelectedCategory("investors")}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: selectedCategory === "investors" ? "var(--primary-deep)" : "white",
              color: selectedCategory === "investors" ? "white" : "var(--text-muted)",
              boxShadow: selectedCategory === "investors" ? "var(--shadow-rose)" : "none",
              border: "1px solid rgba(230,57,111,0.2)",
            }}
          >
            💼 Inversionistas & Ronda Semilla
          </button>
          <button
            onClick={() => setSelectedCategory("licensing")}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: selectedCategory === "licensing" ? "var(--primary-deep)" : "white",
              color: selectedCategory === "licensing" ? "white" : "var(--text-muted)",
              boxShadow: selectedCategory === "licensing" ? "var(--shadow-rose)" : "none",
              border: "1px solid rgba(230,57,111,0.2)",
            }}
          >
            🏢 Licenciamiento B2B & Franquicia
          </button>
        </div>

        {/* Section 1: Documents Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24, marginBottom: 56 }}>
          {(selectedCategory === "all" || selectedCategory === "investors") &&
            investorDocs.map((doc, idx) => {
              const Icon = doc.icon;
              return (
                <div
                  key={`inv-${idx}`}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 28,
                    boxShadow: "var(--shadow-card)",
                    border: doc.highlight ? "2px solid var(--primary-rose)" : "1px solid rgba(230, 57, 111, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: doc.highlight ? "rgba(230, 57, 111, 0.12)" : "rgba(112, 11, 52, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: doc.highlight ? "var(--primary-rose)" : "var(--primary-deep)",
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        style={{
                          background: "rgba(230, 57, 111, 0.1)",
                          color: "var(--primary-deep)",
                          padding: "4px 10px",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {doc.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary-deep)", margin: "0 0 10px 0" }}>
                      {doc.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 24px 0" }}>
                      {doc.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={doc.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        fontSize: 12,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <ExternalLink size={14} /> Ver Interactivo (HTML)
                    </a>
                    {doc.pdfUrl && (
                      <a
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline"
                        style={{
                          padding: "10px 14px",
                          fontSize: 12,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Download size={14} /> PDF
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

          {(selectedCategory === "all" || selectedCategory === "licensing") &&
            licensingDocs.map((doc, idx) => {
              const Icon = doc.icon;
              return (
                <div
                  key={`lic-${idx}`}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 28,
                    boxShadow: "var(--shadow-card)",
                    border: doc.highlight ? "2px solid #059669" : "1px solid rgba(230, 57, 111, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: doc.highlight ? "rgba(5, 150, 105, 0.1)" : "rgba(112, 11, 52, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: doc.highlight ? "#059669" : "var(--primary-deep)",
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        style={{
                          background: "rgba(5, 150, 105, 0.1)",
                          color: "#059669",
                          padding: "4px 10px",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {doc.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary-deep)", margin: "0 0 10px 0" }}>
                      {doc.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 24px 0" }}>
                      {doc.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={doc.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        fontSize: 12,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      }}
                    >
                      <ExternalLink size={14} /> Ver Interactivo (HTML)
                    </a>
                    {doc.pdfUrl && (
                      <a
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline"
                        style={{
                          padding: "10px 14px",
                          fontSize: 12,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          borderColor: "#059669",
                          color: "#059669",
                        }}
                      >
                        <Download size={14} /> PDF
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Section 2: Competitive Comparison Matrix */}
        <section
          style={{
            background: "white",
            borderRadius: 24,
            padding: "36px 32px",
            boxShadow: "var(--shadow-card)",
            border: "1px solid rgba(230, 57, 111, 0.15)",
            marginBottom: 48,
          }}
        >
          <div style={{ maxWidth: 780, marginBottom: 28 }}>
            <span style={{ color: "var(--primary-rose)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Benchmark de Mercado
            </span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: "var(--primary-deep)", margin: "4px 0 10px 0" }}>
              Matriz Comparativa vs. Competidores Directos
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              Análisis exhaustivo de ventajas operativas, tecnológicas y de experiencia frente a <strong>EnviaFlores (enviaflores.com)</strong>, <strong>LolaFlora / Mizu</strong> y aplicaciones de entrega rápida agregadas.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--primary-deep)", color: "white" }}>
                  <th style={{ padding: "14px 18px", borderRadius: "12px 0 0 0", fontWeight: 700 }}>Característica / Dimensión</th>
                  <th style={{ padding: "14px 18px", background: "var(--primary-rose)", fontWeight: 700 }}>🌹 AMar Fe / ToLove Faith</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>EnviaFlores</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>LolaFlora / Mizu</th>
                  <th style={{ padding: "14px 18px", borderRadius: "0 12px 0 0", fontWeight: 600 }}>Rappi / Uber</th>
                </tr>
              </thead>
              <tbody>
                {competitorsData.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid rgba(230, 57, 111, 0.08)",
                      background: idx % 2 === 0 ? "white" : "rgba(253, 246, 238, 0.5)",
                    }}
                  >
                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "var(--text-main)" }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "var(--primary-deep)", background: "rgba(230, 57, 111, 0.05)" }}>
                      {row.amarfe}
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)" }}>
                      {row.enviaflores}
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)" }}>
                      {row.lolaflora}
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)" }}>
                      {row.rappi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(230, 57, 111, 0.06)", borderRadius: 14, border: "1px solid rgba(230, 57, 111, 0.15)", display: "flex", alignItems: "center", gap: 12 }}>
            <Award size={24} color="var(--primary-rose)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: "var(--primary-deep)", lineHeight: 1.4 }}>
              <strong>Ventaja Clave:</strong> A diferencia de los almacenes centralizados de EnviaFlores que tardan de 4 a 6 horas y dañan la flor en el calor del transporte masivo, <strong>AMar Fe despacha en 60-90 min directamente desde las mejores floristerías locales</strong> con seguimiento satelital minuto a minuto.
            </div>
          </div>
        </section>

        {/* Section 3: Contact for Investment / Licensing */}
        <section
          style={{
            background: "linear-gradient(135deg, #700B34 0%, #9D174D 100%)",
            borderRadius: 24,
            padding: "40px 32px",
            color: "white",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, margin: "0 0 12px 0" }}>
            ¿Interesado en Invertir o Licenciar la Plataforma?
          </h2>
          <p style={{ fontSize: 15, color: "#FDA4AF", maxWidth: 640, margin: "0 auto 28px auto", lineHeight: 1.5 }}>
            Contáctanos directamente para agendar un demo privado, revisar los términos de la ronda semilla (SAFE) o solicitar una franquicia tecnológica territorial.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <a
              href="mailto:investors@amarfe.com"
              style={{
                background: "white",
                color: "var(--primary-deep)",
                padding: "12px 24px",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              ✉️ Contactar Inversiones (investors@amarfe.com)
            </a>
            <a
              href="mailto:licensing@amarfe.com"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🏢 Licenciamiento B2B (licensing@amarfe.com)
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(230, 57, 111, 0.12)",
          background: "white",
          padding: "24px 20px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <div>
            © {new Date().getFullYear()} <strong>AMar Fe</strong> / <strong>ToLove Faith</strong>. Todos los derechos reservados.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Tienda</Link>
            <Link href="/florist" style={{ color: "inherit", textDecoration: "none" }}>Portal Floristas</Link>
            <Link href="/admin" style={{ color: "inherit", textDecoration: "none" }}>Panel Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
