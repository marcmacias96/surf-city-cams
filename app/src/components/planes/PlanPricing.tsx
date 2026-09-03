import { useState } from "react";
import { plans, type Plan } from "@/data/spots";
import { cn } from "@/lib/utils";

type Billing = "mensual" | "anual";

function CheckIcon({ featured }: { featured: boolean }) {
  const color = featured ? "#7FD8F0" : "#2EAA6B";
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="12" cy="12" r="10" fill={color} fillOpacity={featured ? 0.18 : 0.14} />
      <path d="M7.5 12.5l3 3 6-6.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="12" cy="12" r="10" stroke="#6B7B85" strokeWidth="2" />
      <path d="M8 12h8" stroke="#6B7B85" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const featured = plan.featured;
  const isPase = plan.id === "pase";
  const price = isPase ? plan.monthly : billing === "anual" ? plan.yearlyMonthly : plan.monthly;
  const suffix = isPase
    ? "desde · pago único"
    : billing === "anual"
      ? "/mes facturado anual"
      : "/ mes";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-5 rounded-2xl p-6 sm:p-8",
        // En una columna (móvil) el plan recomendado abre la lista.
        featured
          ? "order-first bg-navy-dark md:order-none"
          : "border border-divider bg-white"
      )}
    >
      {featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-terracotta px-4.5 pt-1.5 pb-1 font-heading text-xs font-bold tracking-[0.1em] text-white">
          RECOMENDADO
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className={cn("font-heading text-[21px] font-bold", featured ? "text-white" : "text-navy")}>
          {plan.name}
        </h3>
        <p className={cn("text-[15px] leading-relaxed sm:text-sm", featured ? "text-white/70" : "text-muted-foreground")}>
          {plan.tagline}
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <div className={cn("font-heading text-[38px] font-bold sm:text-[42px]", featured ? "text-white" : "text-navy")}>
          ${price.toFixed(2)}
        </div>
        <div className={cn("text-sm", featured ? "text-white/60" : "text-muted-foreground")}>{suffix}</div>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-2.5">
            {feature.included ? <CheckIcon featured={featured} /> : <DashIcon />}
            <span className={cn("text-sm", featured ? "text-white" : feature.included ? "text-ink" : "text-muted-foreground")}>
              {!feature.included && <span className="sr-only">No incluido: </span>}
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={plan.id === "pase" ? "/comprar" : `/comprar?plan=${plan.id}`}
        className={cn(
          "btn-block",
          featured ? "btn-primary" : "btn-secondary"
        )}
      >
        {plan.cta}
      </a>
    </div>
  );
}

export default function PlanPricing() {
  const [billing, setBilling] = useState<Billing>("mensual");

  return (
    <div className="flex flex-col items-center gap-9">
      <div className="flex rounded-full border border-navy/15 bg-white p-1.5" role="group" aria-label="Periodo de facturación">
        <button
          type="button"
          onClick={() => setBilling("mensual")}
          aria-pressed={billing === "mensual"}
          className={cn(
            "min-h-11 rounded-full px-6 pt-2.5 pb-2 font-heading text-[15px] font-bold transition-colors",
            billing === "mensual" ? "bg-navy text-white" : "text-navy hover:bg-navy/5"
          )}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => setBilling("anual")}
          aria-pressed={billing === "anual"}
          className={cn(
            "min-h-11 rounded-full px-6 pt-2.5 pb-2 font-heading text-[15px] font-bold transition-colors",
            billing === "anual" ? "bg-navy text-white" : "text-navy hover:bg-navy/5"
          )}
        >
          Anual <span className={billing === "anual" ? "text-sand" : "text-terracotta"}>−25%</span>
        </button>
      </div>

      <div className="grid w-full items-stretch gap-6 pt-2 md:grid-cols-3 sm:max-w-[440px] sm:mx-auto md:max-w-none" aria-live="polite">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} billing={billing} />
        ))}
      </div>
    </div>
  );
}
