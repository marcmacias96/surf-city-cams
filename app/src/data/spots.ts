// Datos 100% mock — no hay backend, cámaras ni pagos reales.
// Modelo de precios de ejemplo para la demo de venta.

export type AccessLevel = "gratis" | "premium" | "bloqueado";

export interface Spot {
  slug: string;
  name: string;
  breakType: string;
  region: "Manta" | "Montecristi";
  /** Zona o pueblo costero del spot (San Mateo, Santa Marianita…) */
  localidad: string;
  /** Nivel de surf recomendado según el cliente */
  nivel: "principiante" | "intermedio" | "avanzado";
  access: AccessLevel;
  waveM: number;
  windKn: number;
  windDir: string;
  offshore: boolean;
  tide: string;
  waterC: number;
  periodS: number;
  swellDir: string;
  distanceKm: number;
  viewers: number;
  /** Coordenadas exactas del cliente */
  lat: number;
  lon: number;
  /** Tailwind gradient classes: fallback mientras carga la foto */
  gradient: string;
  /** Foto del spot (autohospedada en public/spots) */
  image: string;
  description: string;
  conditions: "Épicas" | "Buenas" | "Regular" | "Pobres";
}

export const spots: Spot[] = [
  {
    slug: "faro-1",
    name: "Faro 1",
    breakType: "Beach break",
    region: "Manta",
    localidad: "San Mateo",
    nivel: "principiante",
    access: "gratis",
    waveM: 0.8,
    windKn: 12,
    windDir: "SO",
    offshore: false,
    tide: "Subiendo",
    waterC: 24,
    periodS: 11,
    swellDir: "SO",
    distanceKm: 10,
    viewers: 94,
    lat: -0.959049,
    lon: -80.806965,
    gradient: "from-[#8FBFD6] via-[#3E88AB] to-[#0A4B6E]",
    image: "/spots/faro-1.jpg",
    description: "Ideal para principiantes. Beach break de fondo de arena junto al faro de San Mateo, con espumas suaves para las primeras olas.",
    conditions: "Regular",
  },
  {
    slug: "faro-2",
    name: "Faro 2",
    breakType: "Reef break",
    region: "Manta",
    localidad: "San Mateo",
    nivel: "intermedio",
    access: "premium",
    waveM: 1.5,
    windKn: 8,
    windDir: "E",
    offshore: true,
    tide: "Alta 14:20",
    waterC: 24,
    periodS: 14,
    swellDir: "SO",
    distanceKm: 10,
    viewers: 128,
    lat: -0.954565,
    lon: -80.807855,
    gradient: "from-[#63879B] via-[#3E687C] to-[#274C60]",
    image: "/spots/faro-2.jpg",
    description: "Ideal para intermedio. Arrecife contiguo al faro que forma paredes más definidas y rápidas que su vecino de arena.",
    conditions: "Buenas",
  },
  {
    slug: "el-sombrero",
    name: "El Sombrero",
    breakType: "Point break",
    region: "Manta",
    localidad: "San Mateo",
    nivel: "avanzado",
    access: "premium",
    waveM: 1.8,
    windKn: 9,
    windDir: "E",
    offshore: true,
    tide: "Subiendo",
    waterC: 24,
    periodS: 15,
    swellDir: "SO",
    distanceKm: 10,
    viewers: 147,
    lat: -0.954357,
    lon: -80.812848,
    gradient: "from-[#A8CBDC] via-[#4E93B4] to-[#0B4462]",
    image: "/spots/el-sombrero.jpg",
    description: "Ideal para experimentados e intermedios. Point break izquierdo de recorrido largo sobre roca, la ola más codiciada de San Mateo.",
    conditions: "Épicas",
  },
  {
    slug: "mucha-hembra",
    name: "Mucha Hembra",
    breakType: "Reef break",
    region: "Manta",
    localidad: "San Mateo",
    nivel: "intermedio",
    access: "bloqueado",
    waveM: 1.3,
    windKn: 14,
    windDir: "O",
    offshore: false,
    tide: "Bajando",
    waterC: 24,
    periodS: 12,
    swellDir: "SO",
    distanceKm: 11,
    viewers: 36,
    lat: -0.953866,
    lon: -80.81679,
    gradient: "from-[#94BCCE] via-[#437FA0] to-[#0E4560]",
    image: "/spots/mucha-hembra.jpg",
    description: "Ideal para intermedio. Reef de fondo de roca que ordena el swell del sur en picos constantes y manejables.",
    conditions: "Regular",
  },
  {
    slug: "tinosa",
    name: "Tiñosa",
    breakType: "Point break",
    region: "Manta",
    localidad: "Manta",
    nivel: "intermedio",
    access: "premium",
    waveM: 1.2,
    windKn: 13,
    windDir: "O",
    offshore: false,
    tide: "Baja 09:50",
    waterC: 24,
    periodS: 13,
    swellDir: "SO",
    distanceKm: 12,
    viewers: 79,
    lat: -0.957036,
    lon: -80.82898,
    gradient: "from-[#9CC7DA] via-[#4890B2] to-[#0A4262]",
    image: "/spots/tinosa.jpg",
    description: "Ideal para intermedio. Point sobre punta rocosa a las afueras de Manta, con paredes que aguantan bien el tamaño.",
    conditions: "Buenas",
  },
  {
    slug: "marianita",
    name: "Marianita",
    breakType: "Beach break",
    region: "Manta",
    localidad: "Santa Marianita",
    nivel: "intermedio",
    access: "premium",
    waveM: 1.0,
    windKn: 16,
    windDir: "O",
    offshore: false,
    tide: "Bajando",
    waterC: 24,
    periodS: 11,
    swellDir: "SO",
    distanceKm: 15,
    viewers: 57,
    lat: -0.986264,
    lon: -80.848897,
    gradient: "from-[#B7D6E3] via-[#5EA0BE] to-[#0D5072]",
    image: "/spots/marianita.jpg",
    description: "Ideal para intermedio. Beach break abierto de picos cambiantes; por la mañana el viento suele estar más limpio.",
    conditions: "Regular",
  },
  {
    slug: "liguiqui",
    name: "Liguiqui",
    breakType: "Reef break",
    region: "Manta",
    localidad: "Liguiquí",
    nivel: "intermedio",
    access: "bloqueado",
    waveM: 1.6,
    windKn: 10,
    windDir: "E",
    offshore: true,
    tide: "Subiendo",
    waterC: 23,
    periodS: 14,
    swellDir: "S",
    distanceKm: 20,
    viewers: 41,
    lat: -1.023972,
    lon: -80.881401,
    gradient: "from-[#7FA9BD] via-[#4A7E97] to-[#1C4E66]",
    image: "/spots/liguiqui.jpg",
    description: "Ideal para intermedio. Reef break rural sobre losa de roca, con olas nobles cuando entra swell del suroeste.",
    conditions: "Buenas",
  },
  {
    slug: "san-lorenzo",
    name: "San Lorenzo",
    breakType: "Point break",
    region: "Manta",
    localidad: "San Lorenzo",
    nivel: "avanzado",
    access: "bloqueado",
    waveM: 2.0,
    windKn: 11,
    windDir: "SE",
    offshore: true,
    tide: "Alta 15:05",
    waterC: 23,
    periodS: 15,
    swellDir: "S",
    distanceKm: 25,
    viewers: 63,
    lat: -1.072542,
    lon: -80.90591,
    gradient: "from-[#5E8296] via-[#3A6478] to-[#23485C]",
    image: "/spots/san-lorenzo.jpg",
    description: "Ideal para experimentados. Point junto al faro de San Lorenzo que recibe el swell del sur con fuerza y recorrido.",
    conditions: "Buenas",
  },
  {
    slug: "san-jose",
    name: "San José",
    breakType: "Point break",
    region: "Montecristi",
    localidad: "Montecristi",
    nivel: "avanzado",
    access: "premium",
    waveM: 2.2,
    windKn: 7,
    windDir: "E",
    offshore: true,
    tide: "Alta 14:35",
    waterC: 23,
    periodS: 16,
    swellDir: "S",
    distanceKm: 34,
    viewers: 122,
    lat: -1.233902,
    lon: -80.825726,
    gradient: "from-[#AACFE0] via-[#5599B9] to-[#0C4A6B]",
    image: "/spots/san-jose.jpg",
    description: "Ideal para experimentados. Point break largo y noble que sostiene el tamaño; la ola más consistente de la zona.",
    conditions: "Épicas",
  },
];

export interface ForecastDay {
  day: string;
  waveM: number | null;
  score: number; // 0-100 para la barra
  label: "Épicas" | "Buenas" | "Regular" | "Pobres" | null;
  locked: boolean;
}

/** Forecast a 7 días: los últimos 3 bloqueados para usuarios con pase (solo suscripción los ve). */
export const forecast7d: ForecastDay[] = [
  { day: "Hoy", waveM: 1.4, score: 55, label: "Buenas", locked: false },
  { day: "Mar", waveM: 1.8, score: 70, label: "Épicas", locked: false },
  { day: "Mié", waveM: 1.1, score: 45, label: "Regular", locked: false },
  { day: "Jue", waveM: 1.6, score: 62, label: "Buenas", locked: false },
  { day: "Vie", waveM: null, score: 0, label: null, locked: true },
  { day: "Sáb", waveM: null, score: 0, label: null, locked: true },
  { day: "Dom", waveM: null, score: 0, label: null, locked: true },
];

// ---------- Precios (mock, en USD) ----------

export const PASS_PRICE_PER_SPOT: Record<string, number> = {
  "24h": 1.49,
  "48h": 1.99,
  "7d": 3.49,
  "15d": 5.99,
};

/** Tarifa plana "todos los spots": el precio anunciado en /planes ($6.99 · 7 días). */
export const PASS_PRICE_ALL_SPOTS: Record<string, number> = {
  "24h": 3.99,
  "48h": 4.99,
  "7d": 6.99,
  "15d": 9.99,
};

export const MULTI_SPOT_DISCOUNT = 0.25; // −25% sobre el total con 2+ spots

export interface PassDuration {
  id: "24h" | "48h" | "7d" | "15d";
  label: string;
  hint: string;
}

export const passDurations: PassDuration[] = [
  { id: "24h", label: "24 h", hint: "Sesión del día" },
  { id: "48h", label: "48 h", hint: "Fin de semana" },
  { id: "7d", label: "7 días", hint: "Viaje de surf" },
  { id: "15d", label: "15 días", hint: "Temporada" },
];

export function passPrice(spotCount: number, durationId: string): {
  base: number;
  discount: number;
  total: number;
  /** true si aplica la tarifa plana de costa completa */
  allSpots: boolean;
} {
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const unit = PASS_PRICE_PER_SPOT[durationId] ?? 1.49;
  const base = round2(unit * spotCount);

  // Pack costa completa: tarifa plana, siempre igual o mejor que el descuento.
  if (spotCount === spots.length) {
    const total = round2(PASS_PRICE_ALL_SPOTS[durationId] ?? base);
    return { base, discount: round2(base - total), total, allSpots: true };
  }

  // Se redondea el total una sola vez y el descuento es la diferencia exacta,
  // para que base − descuento = total también en pantalla.
  const total = spotCount > 1 ? round2(base * (1 - MULTI_SPOT_DISCOUNT)) : base;
  return { base, discount: round2(base - total), total, allSpots: false };
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearlyMonthly: number; // precio/mes pagando anual (−25%)
  featured: boolean;
  cta: string;
  features: { text: string; included: boolean }[];
}

export const plans: Plan[] = [
  {
    id: "pase",
    name: "Pase flexible",
    tagline: "Pago por uso. Ideal si surfeas un fin de semana o un solo spot.",
    monthly: 1.49,
    yearlyMonthly: 1.49,
    featured: false,
    cta: "Comprar un pase",
    features: [
      { text: "1 spot por 24 h — $1.49", included: true },
      { text: "2 spots por 48 h — $2.99", included: true },
      { text: "Todos los spots por 7 días — $6.99", included: true },
      { text: "Cámara en vivo + forecast 4 días", included: true },
      { text: "Sin repetición ni alertas", included: false },
    ],
  },
  {
    id: "local",
    name: "Local",
    tagline: "Para quien revisa el mar todos los días antes de remar.",
    monthly: 7.99,
    yearlyMonthly: 5.99,
    featured: true,
    cta: "Suscribirse a Local",
    features: [
      { text: "Las 9 cámaras, todos los días", included: true },
      { text: "Forecast completo a 7 días", included: true },
      { text: "Repetición de 24 h en cada cámara", included: true },
      { text: "Alertas de condiciones por spot", included: true },
      { text: "Guía digital de Manabí incluida", included: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para escuelas de surf, fotógrafos y organizadores de eventos.",
    monthly: 14.99,
    yearlyMonthly: 11.24,
    featured: false,
    cta: "Elegir plan Pro",
    features: [
      { text: "Todo lo del plan Local", included: true },
      { text: "Repetición de 7 días + clips descargables", included: true },
      { text: "Hasta 4 sesiones simultáneas", included: true },
      { text: "Guía Premium de Manabí incluida", included: true },
    ],
  },
];

// ---------- Cuenta mock ----------

export const mockUser = {
  name: "Marco",
  initial: "M",
  activePass: {
    token: "SC-4F8A-21",
    label: "Pase 2 spots · 48 horas",
    spots: ["san-mateo", "san-lorenzo"],
    remainingLabel: "31 h 24 min",
    progressPct: 65,
    activated: "Activado ayer 20:15",
    expires: "Expira mañana 20:15",
  },
  history: [
    { label: "Pase 2 spots · 48 h", date: "Ayer", price: 2.99, status: "ACTIVO" as const },
    { label: "Pase 1 spot · 24 h — El Faro II", date: "12 ago 2026", price: 1.49, status: "EXPIRADO" as const },
    { label: "Pase todos los spots · 7 días", date: "28 jul 2026", price: 6.99, status: "EXPIRADO" as const },
  ],
  monthSpent: 4.48,
};
