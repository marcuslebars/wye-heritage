/**
 * DESIGN PHILOSOPHY: Dark Marine Premium
 * - Charcoal black (#0d0d0d) background, A1 Cyan accent
 * - Syne for headings, DM Sans for body
 * - Full-width sections, dramatic hero, sticky top nav
 * - Smooth tab switching between service categories
 * - Real-time interactive quote calculator
 */

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { ChevronDown, Anchor, Sparkles, Layers, Droplets, Waves, Paintbrush, Scissors, Calculator, Star, Phone, Mail, ExternalLink } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416842994/cNQZjY9PDBBtriZZVrz4oh/wye-heritage-logo_4caaf0df.png";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416842994/cNQZjY9PDBBtriZZVrz4oh/marina_hero_bg-ciBnuwt69YTPTstqegLTJT.webp";
const DETAILING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416842994/cNQZjY9PDBBtriZZVrz4oh/boat_detailing_bg-enmxuamfmSHwdu9eyZyRrY.webp";
const COATING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416842994/cNQZjY9PDBBtriZZVrz4oh/ceramic_coating_bg-M6heuGVfNdNky9vYGxpFkr.webp";

// ── Pricing Data ──────────────────────────────────────────────
const gelcoatHullRates: Record<string, number> = {
  "20": 21, "21-24": 23, "25-30": 25, "31-35": 27, "36-40": 29, "41-45": 31, "46+": 33
};
const gelcoatTopsideRates: Record<string, number> = {
  "20": 24, "21-24": 26, "25-30": 28, "31-35": 30, "36-40": 32, "41-45": 34, "46+": 36
};
const bowriderRates: Record<string, number> = {
  "under22": 18, "22-25": 19, "26-30": 20
};

function getLengthBracket(len: number): string {
  if (len <= 20) return "20";
  if (len <= 24) return "21-24";
  if (len <= 30) return "25-30";
  if (len <= 35) return "31-35";
  if (len <= 40) return "36-40";
  if (len <= 45) return "41-45";
  return "46+";
}

function getBowriderBracket(len: number): string {
  if (len < 22) return "under22";
  if (len <= 25) return "22-25";
  return "26-30";
}

// ── Animated Counter ─────────────────────────────────────────
function AnimatedNumber({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}</span>;
}

// ── Scroll Reveal Hook ────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

// ── Section Reveal Wrapper ────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// ── Pricing Table ─────────────────────────────────────────────
function PricingTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10" style={{ background: "oklch(0.85 0.18 195 / 0.12)" }}>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-[#00e5ff] font-['Syne']">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="pricing-row border-b border-white/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "text-white/80" : "text-[#00e5ff] font-medium"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Add-On Badge List ─────────────────────────────────────────
function AddOnList({ items }: { items: { label: string; price: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm">
          <span className="text-white/70">{item.label}</span>
          <span className="text-[#00e5ff] font-medium">{item.price}</span>
        </div>
      ))}
    </div>
  );
}

// ── Include List ──────────────────────────────────────────────
function IncludeList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ── Service Icon Map ──────────────────────────────────────────
const serviceIcons: Record<string, React.ReactNode> = {
  gelcoat: <Sparkles className="w-5 h-5" />,
  exterior: <Droplets className="w-5 h-5" />,
  interior: <Layers className="w-5 h-5" />,
  ceramic: <Star className="w-5 h-5" />,
  graphene: <Anchor className="w-5 h-5" />,
  wetsand: <Waves className="w-5 h-5" />,
  bottom: <Paintbrush className="w-5 h-5" />,
  vinyl: <Scissors className="w-5 h-5" />,
};

// ── Chart Data ────────────────────────────────────────────────
const priceComparisonData = [
  { service: "Gelcoat\n(Hull)", rate: 25, fill: "#00e5ff" },
  { service: "Exterior\nDetail", rate: 20, fill: "#00c8e0" },
  { service: "Interior\nDetail", rate: 18, fill: "#00adc0" },
  { service: "Ceramic", rate: 55, fill: "#0092a0" },
  { service: "Graphene", rate: 70, fill: "#007880" },
  { service: "Wet Sand", rate: 65, fill: "#005e60" },
  { service: "Bottom\nPaint", rate: 40, fill: "#004445" },
  { service: "Vinyl\nInstall", rate: 18, fill: "#002a2b" },
];

const tierData = [
  { tier: "Refresh", exterior: 20, interior: 18 },
  { tier: "Standard", exterior: 24, interior: 21.6 },
  { tier: "Deep Clean", exterior: 28, interior: 25.2 },
  { tier: "Restoration", exterior: 32, interior: 28.8 },
];

// ── Main Component ────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState("gelcoat");
  const [navScrolled, setNavScrolled] = useState(false);

  // Calculator state
  const [boatLength, setBoatLength] = useState(28);
  const [calcService, setCalcService] = useState("gelcoat-full");
  const [detailTier, setDetailTier] = useState("standard");
  const [correctionLevel, setCorrectionLevel] = useState("moderate");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [heavyOxidation, setHeavyOxidation] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Quote Calculation ──────────────────────────────────────
  const calcQuote = (): { base: number; addOnsTotal: number; total: number } => {
    const bracket = getLengthBracket(boatLength);
    let base = 0;
    let addOnsTotal = 0;

    if (calcService === "gelcoat-hull") {
      base = boatLength * (gelcoatHullRates[bracket] ?? 25);
    } else if (calcService === "gelcoat-topsides") {
      base = boatLength * (gelcoatTopsideRates[bracket] ?? 28);
    } else if (calcService === "gelcoat-full") {
      base = boatLength * (gelcoatHullRates[bracket] ?? 25) + boatLength * (gelcoatTopsideRates[bracket] ?? 28);
    } else if (calcService === "bowrider") {
      const bb = getBowriderBracket(boatLength);
      base = boatLength * (bowriderRates[bb] ?? 19);
    } else if (calcService === "exterior") {
      const mult = { refresh: 1.0, standard: 1.2, "deep-clean": 1.4, restoration: 1.6 }[detailTier] ?? 1.2;
      base = boatLength * 20 * mult;
    } else if (calcService === "interior") {
      const mult = { refresh: 1.0, standard: 1.2, "deep-clean": 1.4, restoration: 1.6 }[detailTier] ?? 1.2;
      base = boatLength * 18 * mult;
    } else if (calcService === "ceramic") {
      base = boatLength * 55;
    } else if (calcService === "graphene") {
      base = boatLength * 70;
    } else if (calcService === "wetsand") {
      const mult = { moderate: 1.2, heavy: 1.5, extreme: 1.8 }[correctionLevel] ?? 1.2;
      base = boatLength * 65 * mult;
    } else if (calcService === "bottom") {
      base = boatLength * 40;
    } else if (calcService === "vinyl-removal") {
      base = boatLength * 12;
    } else if (calcService === "vinyl-install") {
      base = boatLength * 18;
    }

    if (heavyOxidation && (calcService.startsWith("gelcoat"))) {
      base *= 1.2;
    }

    const addOnPrices: Record<string, number> = {
      "radar-arch": 175, "hard-top": 475, "spot-wet": 112, "teak": 225, "canvas": 150,
      "fender": 60, "ext-ozone": 100, "int-ozone": 150, "carpet": 120, "mold": 175,
      "appliance": 95, "protectant": 85, "glass-coat": 120, "metal-coat": 95,
      "prop-paint": 125, "heavy-prep": 150, "custom-vinyl": 250
    };
    addOns.forEach(a => { addOnsTotal += addOnPrices[a] ?? 0; });

    return { base: Math.round(base), addOnsTotal, total: Math.round(base + addOnsTotal) };
  };

  const quote = calcQuote();

  const toggleAddOn = (key: string) => {
    setAddOns(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);
  };

  const calcAddOnOptions: { key: string; label: string; price: string }[] = {
    "gelcoat-hull": [{ key: "radar-arch", label: "Radar Arch", price: "$175" }, { key: "hard-top", label: "Hard Top", price: "$350–600" }, { key: "spot-wet", label: "Spot Wet Sand", price: "$75–150" }],
    "gelcoat-topsides": [{ key: "radar-arch", label: "Radar Arch", price: "$175" }, { key: "hard-top", label: "Hard Top", price: "$350–600" }, { key: "spot-wet", label: "Spot Wet Sand", price: "$75–150" }],
    "gelcoat-full": [{ key: "radar-arch", label: "Radar Arch", price: "$175" }, { key: "hard-top", label: "Hard Top", price: "$350–600" }, { key: "spot-wet", label: "Spot Wet Sand", price: "$75–150" }],
    "bowrider": [{ key: "spot-wet", label: "Spot Wet Sand", price: "$75–150" }],
    "exterior": [{ key: "teak", label: "Teak Cleaning", price: "$225" }, { key: "canvas", label: "Canvas Cleaning", price: "$150" }, { key: "fender", label: "Fender Cleaning", price: "$60" }, { key: "ext-ozone", label: "Ozone Treatment", price: "$100" }],
    "interior": [{ key: "int-ozone", label: "Ozone Treatment", price: "$150" }, { key: "carpet", label: "Carpet Shampoo", price: "$120" }, { key: "mold", label: "Mold Treatment", price: "$175" }, { key: "appliance", label: "Appliance Cleaning", price: "$95" }, { key: "protectant", label: "Interior Protectant", price: "$85" }],
    "ceramic": [{ key: "glass-coat", label: "Glass Coating", price: "$120" }, { key: "metal-coat", label: "Metal Coating", price: "$95" }],
    "graphene": [{ key: "glass-coat", label: "Glass Coating", price: "$120" }, { key: "metal-coat", label: "Metal Coating", price: "$95" }],
    "wetsand": [],
    "bottom": [{ key: "prop-paint", label: "Prop & Running Gear", price: "$125" }, { key: "heavy-prep", label: "Heavy Prep", price: "$150" }],
    "vinyl-removal": [{ key: "custom-vinyl", label: "Custom Design", price: "$250" }],
    "vinyl-install": [{ key: "custom-vinyl", label: "Custom Design", price: "$250" }],
  }[calcService] ?? [];

  const navItems = [
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "calculator", label: "Calculator" },
    { id: "charts", label: "Analytics" },
    { id: "contact", label: "Contact" },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.09 0.005 240)" }}>

      {/* ── Navigation ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled ? "oklch(0.09 0.005 240 / 0.95)" : "transparent",
          backdropFilter: navScrolled ? "blur(12px)" : "none",
          borderBottom: navScrolled ? "1px solid oklch(1 0 0 / 8%)" : "none"
        }}
      >
        <div className="container flex items-center justify-between h-16">
          <img src={LOGO_URL} alt="A1 Marine Care" className="h-8 object-contain" />
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm text-white/60 hover:text-[#00e5ff] transition-colors font-['DM_Sans']"
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => scrollTo("calculator")}
            className="text-xs font-semibold"
            style={{ background: "oklch(0.85 0.18 195)", color: "oklch(0.09 0.005 240)" }}
          >
            Get Quote
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, oklch(0.09 0.005 240 / 0.6) 0%, oklch(0.09 0.005 240 / 0.85) 70%, oklch(0.09 0.005 240) 100%)" }} />
        <div className="relative z-10 container">
          <Reveal>
            <Badge className="mb-6 text-xs tracking-widest uppercase px-4 py-1.5" style={{ background: "oklch(0.85 0.18 195 / 0.15)", color: "#00e5ff", border: "1px solid oklch(0.85 0.18 195 / 0.3)" }}>
              2026 Season Proposal
            </Badge>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight font-['Syne']">
              Wye Heritage<br />
              <span style={{ color: "#00e5ff" }} className="cyan-glow-text">Marine Resort</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 font-['DM_Sans'] font-light">
              Professional marine detailing, restoration, and protection services by A1 Marine Care — exclusively tailored for Wye Heritage Marine Resort.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => scrollTo("calculator")}
                className="font-semibold px-8"
                style={{ background: "#00e5ff", color: "oklch(0.09 0.005 240)" }}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Your Quote
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("services")}
                className="font-semibold px-8 border-white/20 text-white hover:bg-white/5"
              >
                View All Services
              </Button>
            </div>
          </Reveal>
        </div>
        <button
          onClick={() => scrollTo("services")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hover:text-[#00e5ff] transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-10 border-y border-white/8" style={{ background: "oklch(0.11 0.006 240)" }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Services Offered", value: "8" },
              { label: "Price Tiers", value: "4" },
              { label: "Base Rate (from)", value: "$18/ft" },
              { label: "Season", value: "2026" },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 80}>
                <div>
                  <div className="text-3xl font-bold font-['Syne']" style={{ color: "#00e5ff" }}>{stat.value}</div>
                  <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Overview ── */}
      <section id="services" className="py-24">
        <div className="container">
          <Reveal>
            <div className="mb-12">
              <p className="text-[#00e5ff] text-sm tracking-widest uppercase font-['DM_Sans'] mb-2">Tailored for You</p>
              <h2 className="text-4xl font-bold text-white font-['Syne']">Services Customized for Wye Heritage</h2>
              <div className="cyan-rule w-24 mt-4" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: "gelcoat", title: "Gelcoat Restoration", desc: "2-Stage compound & wax restoration for hull and topsides. Removes oxidation and restores gloss.", rate: "From $18/ft", icon: serviceIcons.gelcoat },
              { id: "exterior", title: "Exterior Detailing", desc: "4-tier exterior cleaning and polishing from Refresh to full Restoration.", rate: "From $20/ft", icon: serviceIcons.exterior },
              { id: "interior", title: "Interior Detailing", desc: "Condition-based interior cleaning with photo verification and 4-tier pricing.", rate: "From $18/ft", icon: serviceIcons.interior },
              { id: "ceramic", title: "Ceramic Coating", desc: "Professional-grade ceramic coating with surface prep and polish included.", rate: "$55/ft", icon: serviceIcons.ceramic },
              { id: "graphene", title: "Graphene Nano Coating", desc: "Advanced graphene nano coating for superior protection and hydrophobic performance.", rate: "$70/ft", icon: serviceIcons.graphene },
              { id: "wetsand", title: "Wet Sanding & Correction", desc: "Paint and gelcoat correction from moderate to extreme levels.", rate: "From $65/ft", icon: serviceIcons.wetsand },
              { id: "bottom", title: "Bottom Painting", desc: "Antifouling paint application with full surface prep and sanding.", rate: "$40/ft", icon: serviceIcons.bottom },
              { id: "vinyl", title: "Vinyl Services", desc: "Professional vinyl removal and installation with custom design options.", rate: "From $12/ft", icon: serviceIcons.vinyl },
            ].map((svc, i) => (
              <Reveal key={svc.id} delay={i * 60}>
                <div
                  className="service-card rounded-xl p-5 h-full cursor-pointer"
                  style={{ background: "oklch(0.12 0.006 240)" }}
                  onClick={() => { setActiveSection(svc.id); scrollTo("pricing"); }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "oklch(0.85 0.18 195 / 0.12)", color: "#00e5ff" }}>
                    {svc.icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2 font-['Syne'] text-base">{svc.title}</h3>
                  <p className="text-white/50 text-sm mb-3 leading-relaxed">{svc.desc}</p>
                  <Badge style={{ background: "oklch(0.85 0.18 195 / 0.12)", color: "#00e5ff", border: "1px solid oklch(0.85 0.18 195 / 0.2)" }} className="text-xs">
                    {svc.rate}
                  </Badge>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Detailing Image Break ── */}
      <section className="relative h-64 overflow-hidden">
        <img src={DETAILING_IMG} alt="Boat detailing" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, oklch(0.09 0.005 240) 0%, transparent 30%, transparent 70%, oklch(0.09 0.005 240) 100%)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/80 text-xl font-['Syne'] font-semibold tracking-wide text-center px-4">
            Precision detailing. Professional results.
          </p>
        </div>
      </section>

      {/* ── Full Pricing ── */}
      <section id="pricing" className="py-24">
        <div className="container">
          <Reveal>
            <div className="mb-10">
              <p className="text-[#00e5ff] text-sm tracking-widest uppercase font-['DM_Sans'] mb-2">2026 Rates</p>
              <h2 className="text-4xl font-bold text-white font-['Syne']">Full Service Pricing</h2>
              <div className="cyan-rule w-24 mt-4" />
            </div>
          </Reveal>

          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="flex flex-wrap gap-1 h-auto mb-8 p-1 rounded-xl" style={{ background: "oklch(0.12 0.006 240)" }}>
              {[
                { value: "gelcoat", label: "Gelcoat" },
                { value: "exterior", label: "Exterior" },
                { value: "interior", label: "Interior" },
                { value: "ceramic", label: "Ceramic" },
                { value: "graphene", label: "Graphene" },
                { value: "wetsand", label: "Wet Sand" },
                { value: "bottom", label: "Bottom Paint" },
                { value: "vinyl", label: "Vinyl" },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs px-3 py-2 rounded-lg data-[state=active]:text-[#00e5ff] data-[state=active]:font-semibold transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Gelcoat */}
            <TabsContent value="gelcoat">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.gelcoat}</span>
                        Hull Only (Below Rub Rail)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Boat Length", "Price / ft"]}
                        rows={[["20 ft & under", "$21/ft"], ["21–24 ft", "$23/ft"], ["25–30 ft", "$25/ft"], ["31–35 ft", "$27/ft"], ["36–40 ft", "$29/ft"], ["41–45 ft", "$31/ft"], ["46 ft +", "$33/ft"]]}
                      />
                      <p className="text-xs text-white/40 mt-3 italic">Includes oxidation removal, compound & polish, gloss restoration, final sealant.</p>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={100}>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.gelcoat}</span>
                        Topsides Only (Above Rub Rail)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Boat Length", "Price / ft"]}
                        rows={[["20 ft & under", "$24/ft"], ["21–24 ft", "$26/ft"], ["25–30 ft", "$28/ft"], ["31–35 ft", "$30/ft"], ["36–40 ft", "$32/ft"], ["41–45 ft", "$34/ft"], ["46 ft +", "$36/ft"]]}
                      />
                      <p className="text-xs text-white/40 mt-3 italic">Includes upper hull polish, rail & edge detailing, compound & gloss restoration, protective sealant.</p>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={200}>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne']">Bowrider Special</CardTitle>
                      <p className="text-sm text-white/50">For low-profile bowriders with limited topside gelcoat</p>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Boat Length", "Price / ft"]}
                        rows={[["Under 22 ft", "$18/ft"], ["22–25 ft", "$19/ft"], ["26–30 ft", "$20/ft"]]}
                      />
                      <p className="text-xs text-white/40 mt-3 italic">Only applies to runabouts, ski boats, small bowriders. Not applicable to cruisers or cabin boats.</p>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={300}>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne']">Full Boat Formula</CardTitle>
                      <p className="text-sm text-white/50">Hull + Topsides combined</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 rounded-lg" style={{ background: "oklch(0.85 0.18 195 / 0.08)", border: "1px solid oklch(0.85 0.18 195 / 0.2)" }}>
                          <p className="text-[#00e5ff] font-mono text-xs">Hull subtotal = Length × Hull Rate</p>
                          <p className="text-[#00e5ff] font-mono text-xs mt-1">Topsides subtotal = Length × Topsides Rate</p>
                          <p className="text-white font-mono text-xs mt-1 font-bold">Total = Hull + Topsides + Add-Ons</p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: "oklch(0.14 0.006 240)" }}>
                          <p className="text-white/60 text-xs mb-1">Example: 28 ft boat</p>
                          <p className="text-white/80 text-xs">Hull: 28 × $25 = $700</p>
                          <p className="text-white/80 text-xs">Topsides: 28 × $28 = $784</p>
                          <p className="text-[#00e5ff] text-sm font-bold mt-1">Total: $1,484</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-white/50 mb-2 font-['Syne'] uppercase tracking-wider">Add-Ons</p>
                        <AddOnList items={[{ label: "Radar Arch", price: "$175" }, { label: "Hard Top", price: "$350–600" }, { label: "Spot Wet Sanding", price: "$75–150/area" }, { label: "Heavy Oxidation", price: "+15–25%" }]} />
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            {/* Exterior */}
            <TabsContent value="exterior">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.exterior}</span>
                        Exterior Detailing Tiers
                      </CardTitle>
                      <p className="text-sm text-white/50">Base Rate: $20 / foot</p>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Tier", "Multiplier", "Effective Rate"]}
                        rows={[["Refresh", "1.0×", "$20/ft"], ["Standard", "1.2×", "$24/ft"], ["Deep Clean", "1.4×", "$28/ft"], ["Restoration", "1.6×", "$32/ft"]]}
                      />
                      <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "oklch(0.85 0.18 195 / 0.08)", border: "1px solid oklch(0.85 0.18 195 / 0.2)" }}>
                        <p className="text-[#00e5ff] font-mono">Formula: Length × $20 × Tier Multiplier</p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={100}>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne']">Exterior Add-Ons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Service", "Price"]}
                        rows={[["Teak Cleaning", "$225"], ["Canvas Cleaning", "$150"], ["Fender Cleaning", "$60"], ["Exterior Ozone Treatment", "$100"]]}
                      />
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            {/* Interior */}
            <TabsContent value="interior">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.interior}</span>
                        Interior Detailing Tiers
                      </CardTitle>
                      <p className="text-sm text-white/50">Base Rate: $18 / foot · Condition by photo verification</p>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Tier", "Multiplier", "Effective Rate"]}
                        rows={[["Refresh", "1.0×", "$18/ft"], ["Standard", "1.2×", "$21.60/ft"], ["Deep Clean", "1.4×", "$25.20/ft"], ["Restoration", "1.6×", "$28.80/ft"]]}
                      />
                      <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "oklch(0.85 0.18 195 / 0.08)", border: "1px solid oklch(0.85 0.18 195 / 0.2)" }}>
                        <p className="text-[#00e5ff] font-mono">Formula: Length × $18 × Tier Multiplier</p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={100}>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne']">Interior Add-Ons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Service", "Price"]}
                        rows={[["Interior Ozone Treatment", "$150"], ["Carpet Shampoo", "$120"], ["Mold Treatment", "$175"], ["Cabin Appliance Cleaning", "$95"], ["Interior Protectant", "$85"]]}
                      />
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            {/* Ceramic */}
            <TabsContent value="ceramic">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.ceramic}</span>
                        Ceramic Coating
                      </CardTitle>
                      <div className="text-3xl font-bold font-['Syne'] mt-2" style={{ color: "#00e5ff" }}>$55 <span className="text-base text-white/50 font-normal">/ ft</span></div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/60 mb-4">Professional-grade ceramic coating for long-lasting protection and hydrophobic performance.</p>
                      <IncludeList items={["Surface prep", "Polish", "Ceramic coating application"]} />
                      <Separator className="my-4 opacity-20" />
                      <p className="text-xs text-white/50 mb-2 font-['Syne'] uppercase tracking-wider">Add-Ons</p>
                      <AddOnList items={[{ label: "Glass Coating", price: "$120" }, { label: "Metal Coating", price: "$95" }]} />
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={100}>
                  <div className="rounded-xl overflow-hidden h-64 md:h-auto">
                    <img src={COATING_IMG} alt="Ceramic coating" className="w-full h-full object-cover" />
                  </div>
                </Reveal>
              </div>
            </TabsContent>

            {/* Graphene */}
            <TabsContent value="graphene">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.graphene}</span>
                        Graphene Nano Coating
                      </CardTitle>
                      <div className="text-3xl font-bold font-['Syne'] mt-2" style={{ color: "#00e5ff" }}>$70 <span className="text-base text-white/50 font-normal">/ ft</span></div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/60 mb-4">Advanced graphene nano coating — the pinnacle of marine surface protection with superior durability.</p>
                      <IncludeList items={["Paint prep", "Polish", "Graphene coating"]} />
                      <Separator className="my-4 opacity-20" />
                      <p className="text-xs text-white/50 mb-2 font-['Syne'] uppercase tracking-wider">Add-Ons</p>
                      <AddOnList items={[{ label: "Glass Coating", price: "$120" }, { label: "Metal Coating", price: "$95" }]} />
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={100}>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne']">Ceramic vs Graphene</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Feature", "Ceramic", "Graphene"]}
                        rows={[["Rate", "$55/ft", "$70/ft"], ["Protection Level", "High", "Superior"], ["Durability", "2–3 years", "3–5 years"], ["Hydrophobic", "Yes", "Yes+"], ["Glass Add-On", "$120", "$120"], ["Metal Add-On", "$95", "$95"]]}
                      />
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            {/* Wet Sand */}
            <TabsContent value="wetsand">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.wetsand}</span>
                        Wet Sanding / Paint Correction
                      </CardTitle>
                      <p className="text-sm text-white/50">Base Rate: $65 / foot</p>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Level", "Multiplier", "Effective Rate"]}
                        rows={[["Moderate", "1.2×", "$78/ft"], ["Heavy", "1.5×", "$97.50/ft"], ["Extreme", "1.8×", "$117/ft"]]}
                      />
                      <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "oklch(0.85 0.18 195 / 0.08)", border: "1px solid oklch(0.85 0.18 195 / 0.2)" }}>
                        <p className="text-[#00e5ff] font-mono">Formula: Length × $65 × Correction Multiplier</p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            {/* Bottom */}
            <TabsContent value="bottom">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.bottom}</span>
                        Bottom Painting
                      </CardTitle>
                      <div className="text-3xl font-bold font-['Syne'] mt-2" style={{ color: "#00e5ff" }}>$40 <span className="text-base text-white/50 font-normal">/ ft</span></div>
                    </CardHeader>
                    <CardContent>
                      <IncludeList items={["Surface prep", "Sanding", "Antifouling paint application"]} />
                      <Separator className="my-4 opacity-20" />
                      <p className="text-xs text-white/50 mb-2 font-['Syne'] uppercase tracking-wider">Add-Ons</p>
                      <AddOnList items={[{ label: "Prop & Running Gear Paint", price: "$125" }, { label: "Heavy Prep", price: "$150" }]} />
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            {/* Vinyl */}
            <TabsContent value="vinyl">
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                    <CardHeader>
                      <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                        <span style={{ color: "#00e5ff" }}>{serviceIcons.vinyl}</span>
                        Vinyl Removal & Installation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PricingTable
                        headers={["Service", "Price"]}
                        rows={[["Vinyl Removal", "$12/ft"], ["Vinyl Installation", "$18/ft"], ["Custom Vinyl Design", "$250 flat"]]}
                      />
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ── Quote Calculator ── */}
      <section id="calculator" className="py-24" style={{ background: "oklch(0.11 0.006 240)" }}>
        <div className="container">
          <Reveal>
            <div className="mb-10">
              <p className="text-[#00e5ff] text-sm tracking-widest uppercase font-['DM_Sans'] mb-2">Instant Estimate</p>
              <h2 className="text-4xl font-bold text-white font-['Syne']">Quote Calculator</h2>
              <div className="cyan-rule w-24 mt-4" />
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Reveal>
                <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                  <CardContent className="pt-6 space-y-6">
                    {/* Boat Length */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-white/80 font-['DM_Sans']">Boat Length</label>
                        <span className="text-[#00e5ff] font-bold font-['Syne'] text-lg">{boatLength} ft</span>
                      </div>
                      <Slider
                        min={15}
                        max={65}
                        step={1}
                        value={[boatLength]}
                        onValueChange={([v]) => { setBoatLength(v); setAddOns([]); }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-white/30 mt-1">
                        <span>15 ft</span><span>65 ft</span>
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <label className="text-sm font-medium text-white/80 mb-2 block font-['DM_Sans']">Service</label>
                      <Select value={calcService} onValueChange={(v) => { setCalcService(v); setAddOns([]); }}>
                        <SelectTrigger style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(1 0 0 / 12%)", color: "white" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(1 0 0 / 12%)" }}>
                          <SelectItem value="gelcoat-hull">Gelcoat — Hull Only</SelectItem>
                          <SelectItem value="gelcoat-topsides">Gelcoat — Topsides Only</SelectItem>
                          <SelectItem value="gelcoat-full">Gelcoat — Full Boat</SelectItem>
                          <SelectItem value="bowrider">Gelcoat — Bowrider Special</SelectItem>
                          <SelectItem value="exterior">Exterior Detailing</SelectItem>
                          <SelectItem value="interior">Interior Detailing</SelectItem>
                          <SelectItem value="ceramic">Ceramic Coating</SelectItem>
                          <SelectItem value="graphene">Graphene Nano Coating</SelectItem>
                          <SelectItem value="wetsand">Wet Sanding / Paint Correction</SelectItem>
                          <SelectItem value="bottom">Bottom Painting</SelectItem>
                          <SelectItem value="vinyl-removal">Vinyl Removal</SelectItem>
                          <SelectItem value="vinyl-install">Vinyl Installation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tier (for detailing) */}
                    {(calcService === "exterior" || calcService === "interior") && (
                      <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block font-['DM_Sans']">Condition Tier</label>
                        <Select value={detailTier} onValueChange={setDetailTier}>
                          <SelectTrigger style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(1 0 0 / 12%)", color: "white" }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(1 0 0 / 12%)" }}>
                            <SelectItem value="refresh">Refresh (1.0×)</SelectItem>
                            <SelectItem value="standard">Standard (1.2×)</SelectItem>
                            <SelectItem value="deep-clean">Deep Clean (1.4×)</SelectItem>
                            <SelectItem value="restoration">Restoration (1.6×)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Correction level (for wetsand) */}
                    {calcService === "wetsand" && (
                      <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block font-['DM_Sans']">Correction Level</label>
                        <Select value={correctionLevel} onValueChange={setCorrectionLevel}>
                          <SelectTrigger style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(1 0 0 / 12%)", color: "white" }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(1 0 0 / 12%)" }}>
                            <SelectItem value="moderate">Moderate (1.2×)</SelectItem>
                            <SelectItem value="heavy">Heavy (1.5×)</SelectItem>
                            <SelectItem value="extreme">Extreme (1.8×)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Heavy oxidation toggle */}
                    {calcService.startsWith("gelcoat") && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setHeavyOxidation(p => !p)}
                          className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0"
                          style={{ background: heavyOxidation ? "#00e5ff" : "oklch(1 0 0 / 15%)" }}
                        >
                          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: heavyOxidation ? "calc(100% - 18px)" : "2px" }} />
                        </button>
                        <span className="text-sm text-white/70">Heavy Oxidation Treatment (+20% avg)</span>
                      </div>
                    )}

                    {/* Add-ons */}
                    {calcAddOnOptions.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block font-['DM_Sans']">Add-Ons</label>
                        <div className="flex flex-wrap gap-2">
                          {calcAddOnOptions.map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => toggleAddOn(opt.key)}
                              className="px-3 py-1.5 rounded-full text-xs transition-all"
                              style={{
                                background: addOns.includes(opt.key) ? "oklch(0.85 0.18 195 / 0.2)" : "oklch(1 0 0 / 5%)",
                                border: addOns.includes(opt.key) ? "1px solid oklch(0.85 0.18 195 / 0.5)" : "1px solid oklch(1 0 0 / 10%)",
                                color: addOns.includes(opt.key) ? "#00e5ff" : "oklch(1 0 0 / 60%)"
                              }}
                            >
                              {opt.label} {opt.price}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {/* Quote Result */}
            <Reveal delay={150}>
              <div className="sticky top-20">
                <Card className="cyan-glow" style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(0.85 0.18 195 / 0.3)" }}>
                  <CardHeader>
                    <CardTitle className="text-white font-['Syne'] flex items-center gap-2">
                      <Calculator className="w-5 h-5" style={{ color: "#00e5ff" }} />
                      Estimated Quote
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/60">
                        <span>Boat Length</span>
                        <span className="text-white">{boatLength} ft</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Base Service</span>
                        <span className="text-white"><AnimatedNumber value={quote.base} /></span>
                      </div>
                      {quote.addOnsTotal > 0 && (
                        <div className="flex justify-between text-white/60">
                          <span>Add-Ons</span>
                          <span className="text-white"><AnimatedNumber value={quote.addOnsTotal} /></span>
                        </div>
                      )}
                    </div>
                    <Separator className="opacity-20" />
                    <div className="flex justify-between items-end">
                      <span className="text-white/60 text-sm">Estimated Total</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold font-['Syne']" style={{ color: "#00e5ff" }}>
                          <AnimatedNumber value={quote.total} />
                        </div>
                        <p className="text-xs text-white/30 mt-0.5">Before tax · Subject to inspection</p>
                      </div>
                    </div>
                    <Button
                      className="w-full font-semibold mt-2"
                      style={{ background: "#00e5ff", color: "oklch(0.09 0.005 240)" }}
                      onClick={() => window.open("https://quote.a1marinecare.ca", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get Official Quote
                    </Button>
                    <p className="text-xs text-white/30 text-center">
                      Visit quote.a1marinecare.ca for a precise estimate
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Charts / Analytics ── */}
      <section id="charts" className="py-24">
        <div className="container">
          <Reveal>
            <div className="mb-10">
              <p className="text-[#00e5ff] text-sm tracking-widest uppercase font-['DM_Sans'] mb-2">Data Visualization</p>
              <h2 className="text-4xl font-bold text-white font-['Syne']">Pricing Analytics</h2>
              <div className="cyan-rule w-24 mt-4" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            <Reveal>
              <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                <CardHeader>
                  <CardTitle className="text-white font-['Syne'] text-base">Base Rate by Service ($/ft)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={priceComparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                      <XAxis dataKey="service" tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 10 }} interval={0} />
                      <YAxis tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(0.85 0.18 195 / 0.3)", borderRadius: "8px", color: "white" }}
                        formatter={(v: number) => [`$${v}/ft`, "Base Rate"]}
                        labelStyle={{ color: "#00e5ff" }}
                      />
                      <Bar dataKey="rate" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={100}>
              <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                <CardHeader>
                  <CardTitle className="text-white font-['Syne'] text-base">Detailing Tier Rates ($/ft)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={tierData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                      <XAxis dataKey="tier" tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(0.85 0.18 195 / 0.3)", borderRadius: "8px", color: "white" }}
                        formatter={(v: number) => [`$${v}/ft`]}
                        labelStyle={{ color: "#00e5ff" }}
                      />
                      <Bar dataKey="exterior" name="Exterior" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="interior" name="Interior" fill="oklch(0.6 0.12 205)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={150}>
              <Card className="md:col-span-2" style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                <CardHeader>
                  <CardTitle className="text-white font-['Syne'] text-base">Gelcoat Rate Progression by Boat Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={[
                        { bracket: "≤20 ft", hull: 21, topsides: 24 },
                        { bracket: "21–24 ft", hull: 23, topsides: 26 },
                        { bracket: "25–30 ft", hull: 25, topsides: 28 },
                        { bracket: "31–35 ft", hull: 27, topsides: 30 },
                        { bracket: "36–40 ft", hull: 29, topsides: 32 },
                        { bracket: "41–45 ft", hull: 31, topsides: 34 },
                        { bracket: "46+ ft", hull: 33, topsides: 36 },
                      ]}
                      margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                      <XAxis dataKey="bracket" tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} domain={[18, 38]} />
                      <Tooltip
                        contentStyle={{ background: "oklch(0.14 0.006 240)", border: "1px solid oklch(0.85 0.18 195 / 0.3)", borderRadius: "8px", color: "white" }}
                        formatter={(v: number) => [`$${v}/ft`]}
                        labelStyle={{ color: "#00e5ff" }}
                      />
                      <Bar dataKey="hull" name="Hull Rate" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="topsides" name="Topsides Rate" fill="oklch(0.6 0.12 205)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Contact / Footer ── */}
      <section id="contact" className="py-24" style={{ background: "oklch(0.11 0.006 240)" }}>
        <div className="container">
          <Reveal>
            <div className="mb-12">
              <p className="text-[#00e5ff] text-sm tracking-widest uppercase font-['DM_Sans'] mb-2">Your Custom Service Plan</p>
              <h2 className="text-4xl font-bold text-white font-['Syne']">Request Your Tailored Quote</h2>
              <div className="cyan-rule w-24 mt-4" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            <Reveal delay={100}>
              <div className="md:col-span-2">
                <ContactForm />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <Card style={{ background: "oklch(0.12 0.006 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h3 className="text-white font-['Syne'] font-semibold mb-4">Quick Service Summary</h3>
                    <div className="space-y-2">
                      {[
                        ["Gelcoat Restoration", "$18–36/ft"],
                        ["Exterior Detailing", "$20–32/ft"],
                        ["Interior Detailing", "$18–28.80/ft"],
                        ["Ceramic Coating", "$55/ft"],
                        ["Graphene Nano Coating", "$70/ft"],
                        ["Wet Sanding / Correction", "$78–117/ft"],
                        ["Bottom Painting", "$40/ft"],
                        ["Vinyl Removal", "$12/ft"],
                        ["Vinyl Installation", "$18/ft"],
                      ].map(([svc, price], i) => (
                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-sm text-white/60">{svc}</span>
                          <span className="text-sm font-medium" style={{ color: "#00e5ff" }}>{price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator className="opacity-20" />
                  <div>
                    <p className="text-sm text-white/60 mb-3">Or reach out directly:</p>
                    <a href="https://quote.a1marinecare.ca" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#00e5ff] hover:opacity-80 transition-opacity text-sm">
                      <ExternalLink className="w-4 h-4" />
                      quote.a1marinecare.ca
                    </a>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-white/8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={LOGO_URL} alt="A1 Marine Care" className="h-6 object-contain opacity-60" />
          <p className="text-xs text-white/30 text-center">
            © 2026 A1 Marine Care · Wye Heritage Marine Resort 2026 Season Proposal · All prices subject to on-site inspection
          </p>
        </div>
      </footer>
    </div>
  );
}
