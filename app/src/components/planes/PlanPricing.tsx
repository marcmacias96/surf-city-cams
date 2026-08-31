import { useState } from "react";
import { plans, type Plan } from "@/data/spots";
import { cn } from "@/lib/utils";

type Billing = "mensual" | "anual";

function PlanIcon({ id }: { id: string }) {
  if (id === "pase") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="7" width="18" height="12" rx="2.5" stroke="#00527A" strokeWidth="2" />
        <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M12 11v4M10 13h4" stroke="#00527A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "local") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 18c3-5 6-5 9-2.5S18 18 22 14" stroke="#7FD8F0" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 9c2.5-4 6-4.5 9-2" stroke="#7FD8F0" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.5 6.8L12 16.8 5.9 20.3l1.5-6.8L2.2 8.9l6.9-.6z" stroke="#DC8158" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

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
      <circle cx="12" cy="12" r="10" stroke="#5C6B75" strokeWidth="2" />
      <path d="M8 12h8" stroke="#5C6B75" strokeWidth="2" strokeLinecap="round" />
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
        "relative flex flex-col gap-5 rounded-2xl p-8",
        featured
          ? "bg-ocean-deep shadow-[0_20px_50px_rgba(0,58,87,0.30)]"
          : "border border-ocean/10 bg-white"
      )}
    >
      {featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-2xl bg-terracotta px-4.5 pt-1.5 pb-1 font-heading text-xs font-bold tracking-[1px] text-white">
          MÁS POPULAR
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <PlanIcon id={plan.id} />
          <h3 className={cn("font-heading text-[21px] font-bold", featured ? "text-white" : "text-ocean-deep")}>
            {plan.name}
          </h3>
        </div>
        <p className={cn("text-sm leading-relaxed", featured ? "text-white/70" : "text-muted-foreground")}>
          {plan.tagline}
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <div className={cn("font-heading text-[42px] font-bold", featured ? "text-white" : "text-ocean-deep")}>
          ${price.toFixed(2)}
        </div>
        <div className={cn("text-sm", featured ? "text-white/60" : "text-muted-foreground")}>{suffix}</div>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-2.5">
            {feature.included ? <CheckIcon featured={featured} /> : <DashIcon />}
            <span className={cn("text-sm", featured ? "text-white" : feature.included ? "text-ocean-deep" : "text-muted-foreground")}>
              {!feature.included && <span className="sr-only">No incluido: </span>}
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={plan.id === "pase" ? "/comprar" : `/comprar?plan=${plan.id}`}
        className={cn(
          "rounded-full py-3 text-center font-heading text-base font-bold transition-colors",
          featured
            ? "bg-terracotta-dark text-white hover:bg-terracotta"
            : "border-2 border-ocean text-ocean hover:bg-ocean/5"
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
      <div className="flex rounded-full border border-ocean/15 bg-white p-1.5" role="group" aria-label="Periodo de facturación">
        <button
          type="button"
          onClick={() => setBilling("mensual")}
          aria-pressed={billing === "mensual"}
          className={cn(
            "rounded-full px-6 pt-2.5 pb-2 font-heading text-[15px] font-bold transition-colors",
            billing === "mensual" ? "bg-ocean text-white" : "text-ocean hover:bg-ocean/5"
          )}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => setBilling("anual")}
          aria-pressed={billing === "anual"}
          className={cn(
            "rounded-full px-6 pt-2.5 pb-2 font-heading text-[15px] font-bold transition-colors",
            billing === "anual" ? "bg-ocean text-white" : "text-ocean hover:bg-ocean/5"
          )}
        >
          Anual <span className={billing === "anual" ? "text-sand" : "text-terracotta"}>−25%</span>
        </button>
      </div>

      <div className="grid w-full items-stretch gap-6 pt-2 md:grid-cols-3" aria-live="polite">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} billing={billing} />
        ))}
      </div>
    </div>
  );
}
