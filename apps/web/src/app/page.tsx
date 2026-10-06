"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle2,
  Store,
  ShieldCheck,
  TrendingUp,
  Globe,
  Gift,
  ArrowRight,
  Flame,
  Search,
  Check,
  ChevronRight,
  Navigation
} from "lucide-react";

import { UserNav } from "./components/UserNav";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThemePaletteSelector } from "./components/ThemePaletteSelector";
import { getLiveCatalog } from "./actions/catalog";
import { LiveOrderTracker } from "./components/LiveOrderTracker";

type Language = "es" | "en";
type ActiveTab = "store" | "florist" | "admin";

interface ProductItem {
  id: string;
  titleEs: string;
  titleEn: string;
  price: number;
  currency: string;
  occasion: string;
  floristName: string;
  rating: number;
  imageUrl: string;
  badge?: string;
  prepTime: string;
}

const mockProducts: ProductItem[] = [
  {
    id: "p1",
    titleEs: "Ramo 24 Rosas Rojas Terciopelo 'Amor Eterno'",
    titleEn: "24 Velvet Red Roses 'Eternal Love' Bouquet",
    price: 890,
    currency: "MXN",
    occasion: "amor",
    floristName: "Florería Pétalos de Fe (Polanco)",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
    badge: "Más Vendido",
    prepTime: "25 min",
  },
  {
    id: "p_teddy",
    titleEs: "Oso Gigante 'My Love' con Corazón de Terciopelo Bordado",
    titleEn: "Giant 'My Love' Teddy Bear with Embroidered Velvet Heart",
    price: 780,
    currency: "MXN",
    occasion: "peluches",
    floristName: "Atelier de Peluches & Ternura",
    rating: 4.98,
    imageUrl: "/images/products/peluche_oso.jpg",
    badge: "🧸 Más Abrazable",
    prepTime: "15 min",
  },
  {
    id: "p_puppy",
    titleEs: "Cachorrito Golden 'Amor & Alegría' con Lazo y Flor de Felpa",
    titleEn: "Golden Puppy 'Love & Joy' Plush with Heart Flower",
    price: 640,
    currency: "MXN",
    occasion: "peluches",
    floristName: "Boutique Regalos con Alma",
    rating: 4.95,
    imageUrl: "/images/products/peluche_perrito.jpg",
    badge: "🐶 Favorito Ternura",
    prepTime: "15 min",
  },
  {
    id: "p_kitten",
    titleEs: "Gatito Cariñoso 'Para Mi Amor' con Campanilla Dorada & Tarjeta",
    titleEn: "Sweet 'For My Love' Kitten Plush with Gold Bell & Card",
    price: 590,
    currency: "MXN",
    occasion: "peluches",
    floristName: "Tienda Mágica de Detalles",
    rating: 5.0,
    imageUrl: "/images/products/peluche_gatito.jpg",
    badge: "🐱 Muy Dulce",
    prepTime: "15 min",
  },
  {
    id: "p2",
    titleEs: "Caja de Girasoles & Chocolates Artesanales",
    titleEn: "Sunflowers Box & Artisan Chocolates",
    price: 650,
    currency: "MXN",
    occasion: "amistad",
    floristName: "Boutique Floral Magnolia (Condesa)",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80",
    badge: "Ideal Amistad",
    prepTime: "30 min",
  },
  {
    id: "p_combo",
    titleEs: "Combo Imperial: 18 Rosas Rojas + Oso Peluche + Bombones Suizos",
    titleEn: "Imperial Combo: 18 Red Roses + Teddy Bear + Swiss Chocolates",
    price: 1490,
    currency: "MXN",
    occasion: "amor",
    floristName: "Florería Pétalos de Fe (Polanco)",
    rating: 5.0,
    imageUrl: "/images/products/peluche_oso.jpg",
    badge: "👑 Combo Todo Incluido",
    prepTime: "35 min",
  },
  {
    id: "p3",
    titleEs: "Orquídea Phalaenopsis Blanca & Tarjeta de Perdón",
    titleEn: "White Phalaenopsis Orchid & Apology Card",
    price: 1190,
    currency: "MXN",
    occasion: "perdon",
    floristName: "Orquídeas Roma Norte",
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80",
    badge: "Elegancia Pura",
    prepTime: "20 min",
  },
  {
    id: "p4",
    titleEs: "Arreglo Pastel de Aniversario con Peonías y Rosas",
    titleEn: "Pastel Anniversary Arrangement with Peonies & Roses",
    price: 1350,
    currency: "MXN",
    occasion: "aniversario",
    floristName: "Atelier de Rosas CDMX",
    rating: 4.95,
    imageUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
    badge: "Exclusivo",
    prepTime: "40 min",
  },
];

export default function HomePage() {
  const [lang, setLang] = useState<Language>("es");
  const [activeTab, setActiveTab] = useState<ActiveTab>("store");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [cardMessage, setCardMessage] = useState("");
  const [orderStep, setOrderStep] = useState<"catalog" | "tracking">("catalog");

  // Simulated live courier tracking movement
  const [courierProgress, setCourierProgress] = useState(35);
  useEffect(() => {
    if (orderStep === "tracking") {
      const interval = setInterval(() => {
        setCourierProgress((prev) => (prev >= 98 ? 98 : prev + 4));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [orderStep]);

  const t = {
    es: {
      appName: "AMar Fe",
      brandSub: "ToLove Faith",
      tagline: "Flores & Regalos con Propósito Amoroso",
      heroDesc: "El primer marketplace con entrega exprés estilo Uber para flores, detalles y tarjetas sinceras que tocan el corazón.",
      navStore: "Catálogo & Clientes",
      navFlorist: "Portal Floristerías",
      navAdmin: "Panel Operaciones Admin",
      downloadApp: "Descargar App Móvil",
      allOccasions: "Todos los Regalos",
      plushies: "Peluches & Ternura",
      love: "Amor & Romance",
      friendship: "Amistad sincera",
      anniversary: "Aniversarios",
      apology: "Para pedir perdón",
      searchPlaceholder: "Buscar rosas, peluches, osos, cajas de chocolates...",
      expressBadge: "Entrega express en 60-90 min con tracking GPS en vivo",
      from: "Desde",
      addToCart: "Personalizar y Enviar",
      cardTitle: "Dedicatoria para la Tarjeta de Amor",
      cardPlaceholder: "Escribe desde tu corazón las palabras que acompañarán este detalle...",
      simTracking: "Ver Demo de Tracking en Tiempo Real",
      backToCatalog: "Regresar al Catálogo",
      // Florist portal
      floristPortalTitle: "Portal de Floristerías Aliadas",
      floristWelcome: "Panel de Gestión de Pedidos - Florería Pétalos de Fe",
      newOrders: "Nuevos Pedidos",
      inPrep: "En Preparación",
      readyForCourier: "Listos para Recoger",
      acceptOrder: "Aceptar y Preparar",
      markReady: "Confirmar Listo (Foto adjunta)",
      // Admin portal
      adminTitle: "Centro de Control Operativo Nacional",
      activeCouriers: "Repartidores en Ruta",
      totalOrdersToday: "Pedidos Hoy",
      grossRevenue: "Volumen Transaccionado (GMV)",
      activeFlorists: "Floristerías Activas",
    },
    en: {
      appName: "ToLove Faith",
      brandSub: "AMar Fe",
      tagline: "Flowers & Gifts with Loving Purpose",
      heroDesc: "The first on-demand Uber-style delivery marketplace for bouquets, luxury gifts, and heartfelt notes that touch the soul.",
      navStore: "Catalog & Customers",
      navFlorist: "Florist Merchant Portal",
      navAdmin: "Operations Admin",
      downloadApp: "Download Mobile App",
      allOccasions: "All Gifts",
      plushies: "Plushies & Soft Toys",
      love: "Love & Romance",
      friendship: "Heartfelt Friendship",
      anniversary: "Anniversaries",
      apology: "I am Sorry / Apology",
      searchPlaceholder: "Search red roses, teddy bears, chocolates...",
      expressBadge: "Express 60-90 min delivery with live GPS courier tracking",
      from: "From",
      addToCart: "Customize & Send",
      cardTitle: "Personalized Romantic Note",
      cardPlaceholder: "Write the words straight from your heart to accompany this gift...",
      simTracking: "View Live Realtime Tracking Demo",
      backToCatalog: "Back to Catalog",
      // Florist portal
      floristPortalTitle: "Florist Partners Portal",
      floristWelcome: "Live Kitchen Display - Florería Pétalos de Fe",
      newOrders: "New Incoming Orders",
      inPrep: "Currently Preparing",
      readyForCourier: "Ready for Courier Pickup",
      acceptOrder: "Accept & Start Bouquet",
      markReady: "Mark Ready (Photo Attached)",
      // Admin portal
      adminTitle: "National Operations Command Center",
      activeCouriers: "Couriers on Route",
      totalOrdersToday: "Orders Today",
      grossRevenue: "Gross Merchandise Value (GMV)",
      activeFlorists: "Active Verified Florists",
    },
  }[lang];

  const [liveProducts, setLiveProducts] = useState<ProductItem[]>(mockProducts);

  useEffect(() => {
    async function loadCatalog() {
      const data = await getLiveCatalog();
      if (data && data.length > 0) {
        const mapped: ProductItem[] = data.map((item: any) => ({
          id: item.id,
          titleEs: item.title_es,
          titleEn: item.title_en || item.title_es,
          price: Number(item.price),
          currency: item.currency || 'MXN',
          occasion: item.product_occasions?.[0]?.occasions?.slug || 'amor',
          floristName: item.florist_shops?.name || 'Floristería Asociada AMar Fe',
          rating: 5.0,
          imageUrl: item.images?.[0] || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
          badge: item.is_featured ? 'Destacado' : undefined,
          prepTime: `${item.preparation_minutes || 30} min`,
        }));
        setLiveProducts(mapped);
      }
    }
    loadCatalog();
  }, []);

  const filteredProducts = liveProducts.filter((p) => {
    const matchesOccasion = selectedOccasion === "all" || p.occasion === selectedOccasion;
    const title = lang === "es" ? p.titleEs : p.titleEn;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOccasion && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Banner Navigation */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--header-bg)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--card-border)",
          padding: "14px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #E6396F 0%, #9D174D 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 4px 12px rgba(230, 57, 111, 0.35)",
              }}
            >
              <Heart size={24} fill="white" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--primary-deep)",
                  }}
                >
                  {t.appName}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  ({t.brandSub})
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: -2 }}>
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Role Navigation Switcher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#FFF0F3",
              borderRadius: "var(--radius-full)",
              padding: 4,
              border: "1px solid rgba(230, 57, 111, 0.15)",
            }}
          >
            <button
              onClick={() => { setActiveTab("store"); setOrderStep("catalog"); }}
              style={{
                background: activeTab === "store" ? "#E6396F" : "transparent",
                color: activeTab === "store" ? "white" : "#9D174D",
                border: "none",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShoppingBag size={15} />
              {t.navStore}
            </button>
            <button
              onClick={() => setActiveTab("florist")}
              style={{
                background: activeTab === "florist" ? "#E6396F" : "transparent",
                color: activeTab === "florist" ? "white" : "#9D174D",
                border: "none",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Store size={15} />
              {t.navFlorist}
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              style={{
                background: activeTab === "admin" ? "#E6396F" : "transparent",
                color: activeTab === "admin" ? "white" : "#9D174D",
                border: "none",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShieldCheck size={15} />
              {t.navAdmin}
            </button>
          </div>

          {/* Language Switcher, User Auth & App Trigger */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--primary-rose)",
                background: "white",
                color: "#700B34",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <Globe size={14} color="#700B34" />
              {lang === "es" ? "ES (MXN $)" : "EN (USD $)"}
            </button>
            <ThemePaletteSelector />
            <UserNav />
            <Link
              href="/docs"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid rgba(230, 57, 111, 0.3)",
                background: "rgba(230, 57, 111, 0.08)",
                color: "var(--primary-deep)",
                fontWeight: 700,
                fontSize: 12,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              💼 {lang === "es" ? "Inversionistas / Docs" : "Investors / Docs"}
            </Link>
            <button className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
              {t.downloadApp}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1240, width: "100%", margin: "0 auto", padding: "32px 20px" }}>
        {/* VIEW 1: CUSTOMER CATALOG & TRACKING */}
        {activeTab === "store" && (
          <div>
            {orderStep === "catalog" ? (
              <div>
                {/* Romantic Hero */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #FFE8EE 0%, #FFF5F7 60%, #FDF6EE 100%)",
                    borderRadius: "var(--radius-lg)",
                    padding: "48px 36px",
                    marginBottom: 36,
                    border: "1px solid rgba(230, 57, 111, 0.15)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ maxWidth: 720, position: "relative", zIndex: 2 }}>
                    <div
                      className="pill-badge"
                      style={{ marginBottom: 16, background: "white", borderColor: "#E6396F", color: "#700B34" }}
                    >
                      <Sparkles size={14} color="#E6396F" />
                      <span>{t.expressBadge}</span>
                    </div>
                    <h1
                      style={{
                        fontSize: "clamp(2rem, 4vw, 3.2rem)",
                        color: "#700B34",
                        lineHeight: 1.15,
                        marginBottom: 16,
                      }}
                    >
                      {t.tagline}
                    </h1>
                    <p
                      style={{
                        fontSize: 17,
                        color: "#4A2838",
                        lineHeight: 1.6,
                        marginBottom: 28,
                      }}
                    >
                      {t.heroDesc}
                    </p>

                    {/* Search Input */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "white",
                        borderRadius: "var(--radius-full)",
                        padding: "6px 8px 6px 20px",
                        boxShadow: "var(--shadow-md)",
                        border: "1.5px solid rgba(230, 57, 111, 0.2)",
                        maxWidth: 580,
                      }}
                    >
                      <Search size={20} color="#9D174D" />
                      <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          fontSize: 15,
                          marginLeft: 12,
                          flex: 1,
                          color: "#2B1822",
                          background: "transparent",
                        }}
                      />
                      <button className="btn-primary" style={{ padding: "10px 22px" }}>
                        Buscar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Occasions Selector */}
                <div style={{ marginBottom: 28 }}>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--primary-deep)",
                      marginBottom: 14,
                    }}
                  >
                    Ocasiones Especiales
                  </h2>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      { id: "all", label: t.allOccasions, icon: Sparkles },
                      { id: "peluches", label: t.plushies, icon: Gift },
                      { id: "amor", label: t.love, icon: Heart },
                      { id: "amistad", label: t.friendship, icon: Gift },
                      { id: "aniversario", label: t.anniversary, icon: Flame },
                      { id: "perdon", label: t.apology, icon: ShieldCheck },
                    ].map((occ) => {
                      const Icon = occ.icon;
                      const active = selectedOccasion === occ.id;
                      return (
                        <button
                          key={occ.id}
                          onClick={() => setSelectedOccasion(occ.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 20px",
                            borderRadius: "var(--radius-full)",
                            border: `1.5px solid ${active ? "var(--primary-rose)" : "rgba(230, 57, 111, 0.2)"}`,
                            background: active ? "var(--primary-rose)" : "white",
                            color: active ? "white" : "#2B1822",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow: active ? "0 4px 14px rgba(230, 57, 111, 0.3)" : "0 2px 6px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Icon size={16} color={active ? "white" : "#700B34"} />
                          <span>{occ.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 24,
                  }}
                >
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="glass-card"
                      style={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      {p.badge && (
                        <div
                          style={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                            zIndex: 2,
                            background: "rgba(157, 23, 77, 0.92)",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "var(--radius-full)",
                            fontSize: 11,
                            fontWeight: 700,
                            backdropFilter: "blur(6px)",
                          }}
                        >
                          {p.badge}
                        </div>
                      )}
                      <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={lang === "es" ? p.titleEs : p.titleEn}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          padding: 20,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 12,
                              color: "var(--emerald-leaf)",
                              fontWeight: 600,
                              marginBottom: 6,
                            }}
                          >
                            <Store size={14} />
                            <span>{p.floristName}</span>
                          </div>
                          <h3
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              lineHeight: 1.35,
                              marginBottom: 10,
                            }}
                          >
                            {lang === "es" ? p.titleEs : p.titleEn}
                          </h3>
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              justifyContent: "space-between",
                              marginBottom: 14,
                            }}
                          >
                            <div>
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {t.from}{" "}
                              </span>
                              <span
                                style={{
                                  fontSize: 22,
                                  fontWeight: 800,
                                  color: "var(--primary-rose)",
                                }}
                              >
                                ${p.price}{" "}
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.currency}</span>
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                color: "var(--text-secondary)",
                              }}
                            >
                              <Clock size={13} color="var(--primary-rose)" />
                              <span>{p.prepTime}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="btn-primary"
                            style={{ width: "100%", justifyContent: "center" }}
                          >
                            <Gift size={16} />
                            {t.addToCart}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Modal for Personalized Dedication */}
                {selectedProduct && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 200,
                      background: "rgba(18, 10, 15, 0.6)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20,
                    }}
                  >
                    <div
                      className="glass-card"
                      style={{
                        background: "white",
                        maxWidth: 520,
                        width: "100%",
                        padding: 32,
                        position: "relative",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 22,
                          color: "var(--primary-deep)",
                          marginBottom: 6,
                        }}
                      >
                        {t.cardTitle}
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          marginBottom: 20,
                        }}
                      >
                        {lang === "es" ? selectedProduct.titleEs : selectedProduct.titleEn}
                      </p>

                      <div style={{ marginBottom: 18 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 700,
                            marginBottom: 8,
                            color: "var(--text-primary)",
                          }}
                        >
                          Palabras para la tarjeta dedicatoria:
                        </label>
                        <textarea
                          rows={4}
                          value={cardMessage}
                          onChange={(e) => setCardMessage(e.target.value)}
                          placeholder={t.cardPlaceholder}
                          style={{
                            width: "100%",
                            padding: 14,
                            borderRadius: "var(--radius-md)",
                            border: "1.5px solid rgba(230, 57, 111, 0.3)",
                            fontSize: 14,
                            fontFamily: "inherit",
                            outline: "none",
                            resize: "none",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="btn-secondary"
                        >
                          Cancelar
                        </button>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link
                            href={`/checkout?productId=${selectedProduct.id}&title=${encodeURIComponent(lang === 'es' ? selectedProduct.titleEs : selectedProduct.titleEn)}&price=${selectedProduct.price}&image=${encodeURIComponent(selectedProduct.imageUrl)}`}
                            className="btn-primary"
                          >
                            <span>Ir al Checkout & Pagar</span>
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LIVE REALTIME TRACKING */
              <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => setOrderStep("catalog")}
                    className="btn-secondary"
                    style={{ padding: "8px 18px", fontSize: 13 }}
                  >
                    ← {t.backToCatalog}
                  </button>
                </div>
                <LiveOrderTracker />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: FLORIST MERCHANT PORTAL */}
        {activeTab === "florist" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h1 style={{ fontSize: 28, color: "var(--primary-deep)" }}>
                  {t.floristPortalTitle}
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  {t.floristWelcome}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#DCFCE7",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#16A34A",
                  }}
                />
                Floristería Abierta y Recibiendo Pedidos
              </div>
            </div>

            {/* Kanban Columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {/* Column 1: Incoming */}
              <div className="glass-card" style={{ padding: 20, background: "white" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ fontSize: 16, color: "var(--primary-velvet)" }}>{t.newOrders}</h3>
                  <span
                    style={{
                      background: "#FEE2E2",
                      color: "#991B1B",
                      padding: "2px 10px",
                      borderRadius: "var(--radius-full)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    1 urgente
                  </span>
                </div>

                <div
                  style={{
                    padding: 16,
                    border: "1.5px solid #FCA5A5",
                    borderRadius: "var(--radius-md)",
                    background: "#FEF2F2",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontWeight: 800, color: "#991B1B" }}>#AMF-9901</span>
                    <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 700 }}>
                      Hace 3 min
                    </span>
                  </div>
                  <h4 style={{ fontSize: 15, marginBottom: 4 }}>
                    Ramo 24 Rosas Rojas Amor Eterno
                  </h4>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      fontStyle: "italic",
                      marginBottom: 12,
                    }}
                  >
                    Tarjeta: &ldquo;Para el amor de mi vida en nuestro 3er año juntos...&rdquo;
                  </p>
                  <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    <Check size={16} />
                    {t.acceptOrder}
                  </button>
                </div>
              </div>

              {/* Column 2: In Preparation */}
              <div className="glass-card" style={{ padding: 20, background: "white" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ fontSize: 16, color: "var(--primary-velvet)" }}>{t.inPrep}</h3>
                  <span
                    style={{
                      background: "#FEF3C7",
                      color: "#92400E",
                      padding: "2px 10px",
                      borderRadius: "var(--radius-full)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    2 en mesa
                  </span>
                </div>

                <div
                  style={{
                    padding: 16,
                    border: "1px solid #FDE68A",
                    borderRadius: "var(--radius-md)",
                    background: "#FFFBEB",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontWeight: 800, color: "#92400E" }}>#AMF-9884</span>
                    <span style={{ fontSize: 12, color: "#92400E" }}>Tiempo: 12 min</span>
                  </div>
                  <h4 style={{ fontSize: 15, marginBottom: 8 }}>
                    Caja de Girasoles & Chocolates
                  </h4>
                  <button
                    className="btn-secondary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      borderColor: "#D97706",
                      color: "#92400E",
                    }}
                  >
                    {t.markReady}
                  </button>
                </div>
              </div>

              {/* Column 3: Ready for Courier */}
              <div className="glass-card" style={{ padding: 20, background: "white" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ fontSize: 16, color: "var(--primary-velvet)" }}>
                    {t.readyForCourier}
                  </h3>
                  <span
                    style={{
                      background: "#E0E7FF",
                      color: "#3730A3",
                      padding: "2px 10px",
                      borderRadius: "var(--radius-full)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    1 esperando moto
                  </span>
                </div>

                <div
                  style={{
                    padding: 16,
                    border: "1px solid #C7D2FE",
                    borderRadius: "var(--radius-md)",
                    background: "#EEF2FF",
                  }}
                >
                  <span style={{ fontWeight: 800, color: "#3730A3" }}>#AMF-9872</span>
                  <h4 style={{ fontSize: 15, margin: "6px 0" }}>Orquídea Phalaenopsis</h4>
                  <p style={{ fontSize: 12, color: "#4338CA" }}>
                    🛵 Repartidor Roberto H. llegando en 4 minutos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ADMIN BACKOFFICE */}
        {activeTab === "admin" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 28, color: "var(--primary-deep)", marginBottom: 4 }}>
                {t.adminTitle}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Monitoreo en tiempo real de operaciones en México (CDMX, Guadalajara, Monterrey)
              </p>
            </div>

            {/* KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 20,
                marginBottom: 32,
              }}
            >
              {[
                { title: t.grossRevenue, value: "$48,920 MXN", change: "+24% vs ayer", icon: TrendingUp },
                { title: t.totalOrdersToday, value: "68 pedidos", change: "98% a tiempo", icon: ShoppingBag },
                { title: t.activeCouriers, value: "14 repartidores", change: "En ruta activa", icon: Navigation },
                { title: t.activeFlorists, value: "22 floristerías", change: "Verificadas", icon: Store },
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={idx} className="glass-card" style={{ padding: 24, background: "white" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                        {kpi.title}
                      </span>
                      <Icon size={18} color="var(--primary-rose)" />
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: "var(--primary-velvet)",
                        marginBottom: 4,
                      }}
                    >
                      {kpi.value}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--emerald-leaf)", fontWeight: 600 }}>
                      {kpi.change}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Active City Distribution */}
            <div className="glass-card" style={{ padding: 28, background: "white" }}>
              <h3 style={{ fontSize: 18, color: "var(--primary-deep)", marginBottom: 16 }}>
                Cobertura y Volumen por Ciudad
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { city: "Ciudad de México (CDMX)", orders: "42 pedidos", percent: 62 },
                  { city: "Guadalajara, Jalisco", orders: "16 pedidos", percent: 24 },
                  { city: "Monterrey, Nuevo León", orders: "10 pedidos", percent: 14 },
                ].map((item, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      <span>{item.city}</span>
                      <span style={{ color: "var(--primary-rose)" }}>{item.orders}</span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#FFE8EE",
                        borderRadius: "var(--radius-full)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${item.percent}%`,
                          height: "100%",
                          background: "var(--primary-rose)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
            <Link href="/docs" style={{ color: "var(--primary-deep)", fontWeight: 600, textDecoration: "none" }}>
              💼 Inversionistas & Documentación
            </Link>
            <span>Términos y Condiciones</span>
            <span>Aviso de Privacidad</span>
            <span>Floristerías Aliadas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
