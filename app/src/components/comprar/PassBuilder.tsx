import { useEffect, useMemo, useState } from "react";
import {
  spots,
  passDurations,
  passPrice,
  PASS_PRICE_PER_SPOT,
  plans,
  type PassDuration,
} from "@/data/spots";
import { addPass, confirmSubscription } from "@/lib/session";

/** Orden de spots del artboard: seleccionados primero */
const SPOT_ORDER = [
  "faro-1",
  "faro-2",
  "el-sombrero",
  "mucha-hembra",
  "tinosa",
  "marianita",
  "liguiqui",
  "san-lorenzo",
  "san-jose",
];

const orderedSpots = SPOT_ORDER.map(
  (slug) => spots.find((s) => s.slug === slug)!,
).filter(Boolean);

type PayMethod = "tarjeta" | "transferencia" | "movil";

const PAY_METHODS: { id: PayMethod; label: string }[] = [
  { id: "tarjeta", label: "Tarjeta" },
  { id: "transferencia", label: "Transferencia" },
  { id: "movil", label: "Pago móvil" },
];

function durationLong(d: PassDuration): string {
  return d.id.endsWith("h") ? d.label.replace(" h", " horas") : d.label;
}

/** Iconos funcionales inline (check / candado), sin dependencia de lucide. */
function Check({ className = "", strokeWidth = 2.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M6 12.5l4 4 8-9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lock({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckBadge() {
  return (
    <div className="absolute -right-2 -top-2 flex size-[26px] items-center justify-center rounded-full border-[2.5px] border-foam bg-success">
      <Check className="size-3 text-white" strokeWidth={3} />
    </div>
  );
}

/** Patrón de selección sin salto de layout: borde fijo + ring interior. */
function cardSelectClass(isSelected: boolean): string {
  return isSelected
    ? "border border-transparent ring-2 ring-navy ring-inset"
    : "border border-divider hover:border-navy/40";
}

export default function PassBuilder() {
  const [selected, setSelected] = useState<string[]>([
    "el-sombrero",
    "faro-2",
  ]);
  const [durationId, setDurationId] = useState<PassDuration["id"]>("48h");
  const [step, setStep] = useState<"armar" | "pago">("armar");
  const [payMethod, setPayMethod] = useState<PayMethod>("tarjeta");
  const [confirmed, setConfirmed] = useState<string | null>(null);

  // Modo suscripción mock: llega desde /planes con ?plan=local|pro
  const [planId, setPlanId] = useState<"local" | "pro" | null>(null);
  const [subConfirmed, setSubConfirmed] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p === "local" || p === "pro") setPlanId(p);
  }, []);

  const duration = passDurations.find((d) => d.id === durationId)!;
  const localPlan = plans.find((p) => p.id === "local")!;
  const subPlan = planId ? plans.find((p) => p.id === planId) ?? null : null;
  const n = selected.length;
  const price = useMemo(() => passPrice(n, durationId), [n, durationId]);
  const unit = PASS_PRICE_PER_SPOT[durationId];
  const selectedNames = SPOT_ORDER.filter((slug) => selected.includes(slug))
    .map((slug) => spots.find((s) => s.slug === slug)!.name)
    .join(" + ");

  const done = confirmed !== null || subConfirmed;

  // Refleja el avance en el stepper de comprar.astro
  useEffect(() => {
    const paso = done ? "listo" : step === "pago" ? "pago" : "armar";
    window.dispatchEvent(new CustomEvent("sc-paso", { detail: paso }));
  }, [step, done]);

  function toggleSpot(slug: string) {
    setConfirmed(null);
    setStep("armar");
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function selectDuration(id: PassDuration["id"]) {
    setConfirmed(null);
    setStep("armar");
    setDurationId(id);
  }

  function goToPay() {
    if (n === 0) return;
    setStep("pago");
  }

  function pay() {
    if (n === 0) return;
    // Persiste el pase en la sesión local: perfil y spots lo leerán de ahí.
    const pass = addPass({
      spots: SPOT_ORDER.filter((slug) => selected.includes(slug)),
      durationId,
      durationLabel: durationLong(duration),
      total: price.total,
    });
    setConfirmed(pass.code);
  }

  function confirmSub() {
    if (!subPlan) return;
    confirmSubscription({ id: subPlan.id, name: subPlan.name, monthly: subPlan.monthly });
    setSubConfirmed(true);
  }

  // CTA de la barra fija móvil: espeja la acción principal del panel
  const mobileAction = subPlan
    ? { label: "Confirmar suscripción", run: confirmSub, total: `$${(subPlan.monthly).toFixed(2)}/mes` }
    : step === "armar"
      ? { label: "Continuar al pago", run: goToPay, total: `$${price.total.toFixed(2)}` }
      : { label: `Pagar $${price.total.toFixed(2)}`, run: pay, total: `$${price.total.toFixed(2)}` };

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      {/* Selección */}
      <div className="flex w-full flex-1 flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[26px] font-bold text-navy md:text-[32px]">
            Arma tu pase
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Elige los spots que quieres desbloquear y por cuánto tiempo.
          </p>
        </div>

        {/* Spots */}
        <div className="flex flex-col gap-3.5">
          <h2 className="font-heading text-[17px] font-bold text-navy">
            Spots{" "}
            <span className="text-sm font-normal text-muted-foreground">
              · {n} {n === 1 ? "seleccionado" : "seleccionados"}
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {orderedSpots.map((spot) => {
              const isSelected = selected.includes(spot.slug);
              return (
                <button
                  key={spot.slug}
                  type="button"
                  onClick={() => toggleSpot(spot.slug)}
                  aria-pressed={isSelected}
                  className={
                    "relative flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left transition-shadow " +
                    cardSelectClass(isSelected)
                  }
                >
                  <div
                    className={`relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${spot.gradient}`}
                  >
                    <img
                      src={spot.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="font-heading text-[15px] font-bold text-navy">
                      {spot.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {spot.breakType.replace(" break", "")} · {spot.localidad}
                    </div>
                  </div>
                  {isSelected && <CheckBadge />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duración */}
        <div className="flex flex-col gap-3.5">
          <h2 className="font-heading text-[17px] font-bold text-navy">
            Duración
          </h2>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {passDurations.map((d) => {
              const isSelected = d.id === durationId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => selectDuration(d.id)}
                  aria-pressed={isSelected}
                  className={
                    "relative flex flex-col gap-1 rounded-2xl bg-white px-4 py-[18px] text-center transition-shadow " +
                    cardSelectClass(isSelected)
                  }
                >
                  <div
                    className={
                      "font-heading text-xl font-bold " +
                      (isSelected ? "text-navy" : "text-ink")
                    }
                  >
                    {d.label}
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {d.hint}
                  </div>
                  <div className="text-xs font-semibold text-navy">
                    ${PASS_PRICE_PER_SPOT[d.id].toFixed(2)} / spot
                  </div>
                  {isSelected && <CheckBadge />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-24 lg:w-[380px]">
        <div className="flex flex-col gap-[18px] rounded-2xl border border-divider bg-white p-5 shadow-sm sm:p-[26px]">
          {subConfirmed && subPlan ? (
            <>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-success">
                  <Check className="size-6 text-white" strokeWidth={3} />
                </div>
                <div className="font-heading text-[19px] font-bold text-navy">
                  Suscripción lista · Plan {subPlan.name}
                </div>
                <p className="text-sm text-muted-foreground">
                  ${subPlan.monthly.toFixed(2)}/mes · renovación automática ·
                  cancela cuando quieras
                </p>
              </div>
              <a
                href="/cuenta"
                className="btn-primary btn-block"
              >
                Ver mi cuenta
              </a>
            </>
          ) : subPlan ? (
            <>
              <h2 className="font-heading text-[19px] font-bold text-navy">
                Tu suscripción
              </h2>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-semibold text-ink">
                    {subPlan.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Incluye</span>
                  <span className="text-right text-sm font-semibold text-ink">
                    {subPlan.features[0].text}
                  </span>
                </div>
                <div className="my-1 h-px bg-navy/10"></div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="font-heading text-[17px] font-bold text-navy">
                    Total
                  </span>
                  <span className="font-heading text-3xl font-bold text-navy">
                    ${subPlan.monthly.toFixed(2)}
                    <span className="font-sans text-sm font-normal text-muted-foreground">
                      {" "}/mes
                    </span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Renovación automática · cancela cuando quieras
                </p>
              </div>
              <button
                type="button"
                onClick={confirmSub}
                className="btn-primary btn-block"
              >
                Confirmar suscripción
              </button>
              <button
                type="button"
                onClick={() => setPlanId(null)}
                className="min-h-11 text-center text-sm font-semibold text-navy transition-colors hover:text-navy-dark"
              >
                Prefiero un pase puntual
              </button>
            </>
          ) : confirmed ? (
            <>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-success">
                  <Check className="size-6 text-white" strokeWidth={3} />
                </div>
                <div className="font-heading text-[19px] font-bold text-navy">
                  Pase listo · código {confirmed}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedNames} · {durationLong(duration)} · $
                  {price.total.toFixed(2)} · se activa en tu primera vista
                </p>
              </div>
              <a
                href="/cuenta"
                className="btn-primary btn-block"
              >
                Ver mi cuenta
              </a>
            </>
          ) : (
            <>
              <h2 className="font-heading text-[19px] font-bold text-navy">
                {step === "pago" ? "Pago" : "Tu pase"}
              </h2>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Spots</span>
                  <span className="text-right text-sm font-semibold text-ink">
                    {n > 0 ? selectedNames : "Ninguno"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duración
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {durationLong(duration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Incluye</span>
                  <span className="text-sm font-semibold text-ink">
                    Cámara + forecast 4 días
                  </span>
                </div>
                <div className="my-1 h-px bg-navy/10"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {n} {n === 1 ? "spot" : "spots"} × {duration.label} ($
                    {unit.toFixed(2)} c/u)
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    ${price.base.toFixed(2)}
                  </span>
                </div>
                {price.allSpots ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-success">
                      Pack todos los spots
                    </span>
                    <span className="text-sm font-semibold text-success">
                      −${price.discount.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  price.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-success">
                        Precio de paquete −25%
                      </span>
                      <span className="text-sm font-semibold text-success">
                        −${price.discount.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="font-heading text-[17px] font-bold text-navy">
                    Total
                  </span>
                  <span className="font-heading text-3xl font-bold text-navy">
                    ${price.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {step === "pago" ? (
                <>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Método de pago"
                  >
                    {PAY_METHODS.map((m) => {
                      const on = payMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setPayMethod(m.id)}
                          className={
                            "min-h-11 rounded-full px-4 py-2 font-heading text-[13px] font-bold transition-colors sm:min-h-0 " +
                            (on
                              ? "border border-transparent bg-navy text-white ring-2 ring-navy ring-inset"
                              : "border border-navy/20 text-navy hover:border-navy/50")
                          }
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={pay}
                    className="btn-primary btn-block"
                  >
                    Pagar ${price.total.toFixed(2)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("armar")}
                    className="min-h-11 text-center text-sm font-semibold text-navy transition-colors hover:text-navy-dark"
                  >
                    Volver al resumen
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={goToPay}
                  disabled={n === 0}
                  className="btn-primary btn-block"
                >
                  Continuar al pago
                </button>
              )}
              <div className="flex items-center justify-center gap-[7px]">
                <Lock className="size-[13px] text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Pago seguro · Tarjeta, transferencia o pago móvil
                </span>
              </div>
            </>
          )}
        </div>

        {/* Card plan Local (solo en modo pase) */}
        {!subPlan && (
          <div className="rounded-2xl border border-divider bg-foam px-[18px] py-4">
            <div className="text-[15px] leading-relaxed text-ink sm:text-[13px]">
              Con el plan{" "}
              <strong>
                {localPlan.name} (${localPlan.monthly}/mes)
              </strong>{" "}
              tendrías las nueve cámaras todos los días del mes.{" "}
              <a
                href="/planes"
                className="inline-flex min-h-11 items-center font-semibold text-terracotta hover:text-terracotta-dark sm:min-h-0"
              >
                Comparar
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Barra fija inferior solo móvil: total + CTA. El espaciador reserva su
          alto para que no tape el final del contenido ni el pie. */}
      {!done && <div aria-hidden="true" className="h-[72px] w-full lg:hidden" />}
      {!done && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-heading text-xl font-bold text-navy">
                {mobileAction.total}
              </span>
            </div>
            <button
              type="button"
              onClick={mobileAction.run}
              disabled={!subPlan && n === 0}
              className="btn-primary shrink-0"
            >
              {mobileAction.label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
