import { useEffect, useMemo, useState } from "react";
import { Check, Lock } from "lucide-react";
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

function CheckBadge() {
  return (
    <div className="absolute -right-2 -top-2 flex size-[26px] items-center justify-center rounded-full border-[2.5px] border-mist bg-success">
      <Check className="size-3 text-white" strokeWidth={3} />
    </div>
  );
}

/** Patrón de selección sin salto de layout: borde fijo + ring interior. */
function cardSelectClass(isSelected: boolean): string {
  return isSelected
    ? "border border-transparent ring-2 ring-ocean ring-inset shadow-[0_6px_18px_rgba(0,82,122,0.12)]"
    : "border border-ocean/15 hover:border-ocean/40";
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
    <div className="flex flex-col items-start gap-8 pb-24 lg:flex-row lg:pb-0">
      {/* Selección */}
      <div className="flex w-full flex-1 flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[26px] font-bold text-ocean-deep md:text-[32px]">
            Arma tu pase
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Elige los spots que quieres desbloquear y por cuánto tiempo.
          </p>
        </div>

        {/* Spots */}
        <div className="flex flex-col gap-3.5">
          <h2 className="font-heading text-[17px] font-bold text-ocean-deep">
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
                    <div className="font-heading text-[15px] font-bold text-ocean-deep">
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
          <h2 className="font-heading text-[17px] font-bold text-ocean-deep">
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
                      (isSelected ? "text-ocean" : "text-ocean-deep")
                    }
                  >
                    {d.label}
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {d.hint}
                  </div>
                  <div className="text-xs font-semibold text-ocean">
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
        <div className="flex flex-col gap-[18px] rounded-[20px] border border-ocean/10 bg-white p-[26px] shadow-[0_12px_34px_rgba(0,58,87,0.10)]">
          {subConfirmed && subPlan ? (
            <>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-success">
                  <Check className="size-6 text-white" strokeWidth={3} />
                </div>
                <div className="font-heading text-[19px] font-bold text-ocean-deep">
                  Suscripción lista · Plan {subPlan.name}
                </div>
                <p className="text-sm text-muted-foreground">
                  ${subPlan.monthly.toFixed(2)}/mes · renovación automática ·
                  cancela cuando quieras
                </p>
              </div>
              <a
                href="/cuenta"
                className="rounded-full bg-terracotta-dark py-3.5 text-center font-heading text-base font-bold text-white transition-colors hover:bg-terracotta"
              >
                Ver mi cuenta
              </a>
            </>
          ) : subPlan ? (
            <>
              <h2 className="font-heading text-[19px] font-bold text-ocean-deep">
                Tu suscripción
              </h2>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-semibold text-ocean-deep">
                    {subPlan.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Incluye</span>
                  <span className="text-right text-sm font-semibold text-ocean-deep">
                    {subPlan.features[0].text}
                  </span>
                </div>
                <div className="my-1 h-px bg-ocean/10"></div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="font-heading text-[17px] font-bold text-ocean-deep">
                    Total
                  </span>
                  <span className="font-heading text-3xl font-bold text-ocean-deep">
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
                className="rounded-full bg-terracotta-dark py-3.5 font-heading text-base font-bold text-white transition-colors hover:bg-terracotta"
              >
                Confirmar suscripción
              </button>
              <button
                type="button"
                onClick={() => setPlanId(null)}
                className="text-center text-sm font-semibold text-ocean transition-colors hover:text-ocean-deep"
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
                <div className="font-heading text-[19px] font-bold text-ocean-deep">
                  Pase listo · código {confirmed}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedNames} · {durationLong(duration)} · $
                  {price.total.toFixed(2)} · se activa en tu primera vista
                </p>
              </div>
              <a
                href="/cuenta"
                className="rounded-full bg-terracotta-dark py-3.5 text-center font-heading text-base font-bold text-white transition-colors hover:bg-terracotta"
              >
                Ver mi cuenta
              </a>
            </>
          ) : (
            <>
              <h2 className="font-heading text-[19px] font-bold text-ocean-deep">
                {step === "pago" ? "Pago" : "Tu pase"}
              </h2>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Spots</span>
                  <span className="text-right text-sm font-semibold text-ocean-deep">
                    {n > 0 ? selectedNames : "Ninguno"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duración
                  </span>
                  <span className="text-sm font-semibold text-ocean-deep">
                    {durationLong(duration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Incluye</span>
                  <span className="text-sm font-semibold text-ocean-deep">
                    Cámara + forecast 4 días
                  </span>
                </div>
                <div className="my-1 h-px bg-ocean/10"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {n} {n === 1 ? "spot" : "spots"} × {duration.label} ($
                    {unit.toFixed(2)} c/u)
                  </span>
                  <span className="text-sm font-semibold text-ocean-deep">
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
                  <span className="font-heading text-[17px] font-bold text-ocean-deep">
                    Total
                  </span>
                  <span className="font-heading text-3xl font-bold text-ocean-deep">
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
                            "rounded-full px-4 py-2 font-heading text-[13px] font-bold transition-colors " +
                            (on
                              ? "border border-transparent bg-ocean text-white ring-2 ring-ocean ring-inset"
                              : "border border-ocean/20 text-ocean hover:border-ocean/50")
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
                    className="rounded-full bg-terracotta-dark py-3.5 font-heading text-base font-bold text-white transition-colors hover:bg-terracotta"
                  >
                    Pagar ${price.total.toFixed(2)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("armar")}
                    className="text-center text-sm font-semibold text-ocean transition-colors hover:text-ocean-deep"
                  >
                    Volver al resumen
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={goToPay}
                  disabled={n === 0}
                  className="rounded-full bg-terracotta-dark py-3.5 font-heading text-base font-bold text-white transition-colors hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ocean/30 bg-ocean/5 px-[18px] py-4">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M2 18c3-5 6-5 9-2.5S18 18 22 14"
                stroke="#00527A"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
              <path
                d="M13 9c2.5-4 6-4.5 9-2"
                stroke="#00527A"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
            </svg>
            <div className="text-[13px] leading-relaxed text-ocean-deep">
              Con el plan{" "}
              <strong>
                {localPlan.name} (${localPlan.monthly}/mes)
              </strong>{" "}
              tendrías todos los spots, siempre.{" "}
              <a
                href="/planes"
                className="font-semibold text-terracotta hover:text-terracotta-dark"
              >
                Comparar
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Barra fija inferior solo móvil: total + CTA */}
      {!done && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ocean/10 bg-white/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-heading text-xl font-bold text-ocean-deep">
                {mobileAction.total}
              </span>
            </div>
            <button
              type="button"
              onClick={mobileAction.run}
              disabled={!subPlan && n === 0}
              className="rounded-full bg-terracotta-dark px-6 py-3 font-heading text-[15px] font-bold text-white transition-colors hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mobileAction.label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
