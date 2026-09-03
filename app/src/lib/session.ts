// Sesión de la demo en localStorage: pases y suscripción comprados en /comprar.
// Solo se usa en cliente (islas React y <script> de Astro); no hay backend.

export interface StoredPass {
  code: string;
  spots: string[];
  durationId: string;
  durationLabel: string;
  total: number;
  activatedAt: number;
  expiresAt: number;
}

export interface StoredSubscription {
  planId: string;
  name: string;
  monthly: number;
  since: number;
}

export interface StoredUser {
  name: string;
  email: string;
}

export interface StoredPaymentMethod {
  type: "tarjeta" | "transferencia" | "movil";
  label: string;
}

export interface Session {
  passes: StoredPass[];
  subscription: StoredSubscription | null;
  /** Usuario mock de la demo; null = sin iniciar sesión */
  user: StoredUser | null;
  /** Slugs de spots guardados desde la ficha de cada cámara */
  savedSpots: string[];
  /** Alerta de "avisarme cuando mejoren las condiciones", una por spot (demo: no envía nada real) */
  alertPrefs: Record<string, boolean>;
  /** Método de pago mock guardado en /cuenta; null = sin método guardado */
  paymentMethod: StoredPaymentMethod | null;
}

const KEY = "surfcity:session:v1";

export const DURATION_MS: Record<string, number> = {
  "24h": 24 * 3600_000,
  "48h": 48 * 3600_000,
  "7d": 7 * 86400_000,
  "15d": 15 * 86400_000,
};

export function getSession(): Session {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      // Retrocompatible: sesiones guardadas antes de estos campos no los traen.
      if (Array.isArray(s.passes)) {
        return {
          passes: s.passes,
          subscription: s.subscription ?? null,
          user: s.user ?? null,
          savedSpots: Array.isArray(s.savedSpots) ? s.savedSpots : [],
          alertPrefs: s.alertPrefs && typeof s.alertPrefs === "object" ? s.alertPrefs : {},
          paymentMethod: s.paymentMethod ?? null,
        };
      }
    }
  } catch {
    /* almacenamiento no disponible: sesión vacía */
  }
  return { passes: [], subscription: null, user: null, savedSpots: [], alertPrefs: {}, paymentMethod: null };
}

function write(s: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* modo privado o sin permiso: la demo sigue sin persistir */
  }
}

export function addPass(input: {
  spots: string[];
  durationId: string;
  durationLabel: string;
  total: number;
}): StoredPass {
  const now = Date.now();
  const pass: StoredPass = {
    code: `SC-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    spots: input.spots,
    durationId: input.durationId,
    durationLabel: input.durationLabel,
    total: input.total,
    activatedAt: now,
    expiresAt: now + (DURATION_MS[input.durationId] ?? DURATION_MS["24h"]),
  };
  const s = getSession();
  s.passes.push(pass);
  write(s);
  return pass;
}

export function confirmSubscription(plan: { id: string; name: string; monthly: number }): StoredSubscription {
  const sub: StoredSubscription = { planId: plan.id, name: plan.name, monthly: plan.monthly, since: Date.now() };
  const s = getSession();
  s.subscription = sub;
  write(s);
  return sub;
}

export function cancelSubscription() {
  const s = getSession();
  s.subscription = null;
  write(s);
}

/** Login mock de la demo: guarda el usuario sin tocar pases ni suscripción. */
export function login(name: string, email: string): StoredUser {
  const user: StoredUser = { name, email };
  const s = getSession();
  s.user = user;
  write(s);
  return user;
}

/** Usuario de la sesión actual, o null si no ha iniciado sesión. */
export function getUser(): StoredUser | null {
  return getSession().user;
}

/** ¿Este spot está guardado por el usuario? */
export function isSpotSaved(slug: string, s = getSession()): boolean {
  return s.savedSpots.includes(slug);
}

/** Guarda o quita un spot de favoritos. Devuelve el nuevo estado (true = guardado). */
export function toggleSavedSpot(slug: string): boolean {
  const s = getSession();
  const saved = s.savedSpots.includes(slug);
  s.savedSpots = saved ? s.savedSpots.filter((x) => x !== slug) : [...s.savedSpots, slug];
  write(s);
  return !saved;
}

/** Activa o desactiva la alerta de condiciones de un spot (demo: no envía notificaciones). */
export function setAlertPref(slug: string, on: boolean) {
  const s = getSession();
  s.alertPrefs = { ...s.alertPrefs, [slug]: on };
  write(s);
}

/** Guarda (o quita, pasando null) el método de pago mock de la cuenta. */
export function setPaymentMethod(method: StoredPaymentMethod | null) {
  const s = getSession();
  s.paymentMethod = method;
  write(s);
}

/** Genera un método de pago mock plausible para el tipo elegido en el formulario de /cuenta. */
export function mockPaymentMethod(type: StoredPaymentMethod["type"]): StoredPaymentMethod {
  if (type === "tarjeta") {
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    return { type, label: `Visa •••• ${digits}` };
  }
  if (type === "transferencia") return { type, label: "Transferencia bancaria" };
  return { type, label: "Pago móvil" };
}

/** Logout de la demo: borra usuario, pases y suscripción para empezar de cero. */
export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada que borrar */
  }
}

export const isPassActive = (p: StoredPass, now = Date.now()) => p.expiresAt > now;

export function activePasses(s = getSession(), now = Date.now()): StoredPass[] {
  return s.passes.filter((p) => isPassActive(p, now));
}

export function expiredPasses(s = getSession(), now = Date.now()): StoredPass[] {
  return s.passes.filter((p) => !isPassActive(p, now));
}

export type Unlock =
  | { type: "sub"; name: string }
  | { type: "pase"; pass: StoredPass }
  | null;

/** ¿Este spot está desbloqueado por la sesión? (los "gratis" no la necesitan) */
export function unlockInfo(slug: string, s = getSession()): Unlock {
  if (s.subscription) return { type: "sub", name: s.subscription.name };
  const pass = activePasses(s).find((p) => p.spots.includes(slug));
  return pass ? { type: "pase", pass } : null;
}

export const isSpotUnlocked = (slug: string, s = getSession()) => unlockInfo(slug, s) !== null;

export function remainingMs(p: StoredPass, now = Date.now()): number {
  return Math.max(0, p.expiresAt - now);
}

/** "31 h 24 min" / "5 d 3 h" */
export function fmtRemaining(ms: number): string {
  const min = Math.floor(ms / 60_000);
  const h = Math.floor(min / 60);
  if (h >= 72) return `${Math.floor(h / 24)} d ${h % 24} h`;
  if (h >= 1) return `${h} h ${min % 60} min`;
  return `${min} min`;
}

export function fmtFecha(ts: number): string {
  return new Date(ts).toLocaleString("es-EC", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
