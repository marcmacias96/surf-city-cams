import { useEffect, useState } from "react";
import { spots, plans } from "@/data/spots";
import {
  getSession,
  activePasses,
  expiredPasses,
  clearSession,
  cancelSubscription,
  remainingMs,
  fmtRemaining,
  fmtFecha,
  DURATION_MS,
  type Session,
  type StoredPass,
} from "@/lib/session";

const localPlan = plans.find((p) => p.id === "local")!;

function spotOf(slug: string) {
  return spots.find((s) => s.slug === slug);
}

function passLabel(p: StoredPass): string {
  const n = p.spots.length;
  const who = n === spots.length ? "todos los spots" : `${n} ${n === 1 ? "spot" : "spots"}`;
  return `Pase ${who} · ${p.durationLabel}`;
}

function PassCard({ pass, now }: { pass: StoredPass; now: number }) {
  const total = DURATION_MS[pass.durationId] ?? 1;
  const restante = remainingMs(pass, now);
  const pct = Math.min(100, Math.max(0, ((total - restante) / total) * 100));
  return (
    <section className="relative flex flex-col gap-8 overflow-hidden rounded-2xl bg-ocean-deep p-7 shadow-[0_16px_40px_rgba(0,58,87,0.25)] md:flex-row md:items-center">
      <svg width="1000" height="120" viewBox="0 0 1000 120" className="pointer-events-none absolute -bottom-8 left-0 opacity-10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M0 60c120-40 240-36 360-8s240 36 360 6 200-44 280-32v94H0z" fill="#7FD8F0"></path>
      </svg>

      <div className="relative flex flex-1 flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-success/50 bg-success/20 px-3.5 py-1.5">
            <span className="live-dot inline-block size-[7px] rounded-full bg-success"></span>
            <span className="font-heading text-xs font-bold tracking-widest text-success-light">PASE ACTIVO</span>
          </div>
          <div className="text-[13px] text-white/60">Código {pass.code}</div>
        </div>
        <div className="font-heading text-[26px] font-bold text-white">{passLabel(pass)}</div>
        <div className="flex flex-wrap gap-2.5">
          {pass.spots.map((slug) => {
            const spot = spotOf(slug);
            if (!spot) return null;
            return (
              <a key={slug} href={`/spots/${slug}`} className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 transition-colors hover:bg-white/20">
                <div className={`relative h-6 w-[34px] overflow-hidden rounded-[5px] bg-gradient-to-br ${spot.gradient}`}>
                  <img src={spot.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </div>
                <span className="text-[13px] font-semibold text-white">{spot.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="relative flex w-full shrink-0 flex-col gap-2.5 md:w-[300px]">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-white/60">Tiempo restante</span>
          <span className="font-heading text-[22px] font-bold text-white">{fmtRemaining(restante)}</span>
        </div>
        <div className="relative h-2.5 rounded-full bg-white/15">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-success to-seafoam" style={{ width: `${100 - pct}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-white/50">
          <span>Activado {fmtFecha(pass.activatedAt)}</span>
          <span>Expira {fmtFecha(pass.expiresAt)}</span>
        </div>
        <a href="/comprar" className="mt-1.5 rounded-full bg-terracotta-dark py-2.5 text-center font-heading text-sm font-bold text-white transition-colors hover:bg-terracotta">
          Extender pase
        </a>
      </div>
    </section>
  );
}

export default function CuentaPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setSession(getSession());
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  if (!session) return <div className="min-h-[300px]" aria-hidden="true"></div>;

  const activos = activePasses(session, now);
  const expirados = expiredPasses(session, now);
  const sub = session.subscription;
  const vacia = activos.length === 0 && expirados.length === 0 && !sub;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const gastoMes = session.passes
    .filter((p) => p.activatedAt >= inicioMes.getTime())
    .reduce((sum, p) => sum + p.total, 0);

  function logout() {
    clearSession();
    window.location.href = "/";
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[26px] font-bold text-ocean-deep md:text-[32px]">Mis accesos</h1>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-full border border-ocean/25 px-4 py-2 font-heading text-[13px] font-bold text-ocean transition-colors hover:border-destructive hover:text-destructive"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          Cerrar sesión
        </button>
      </div>

      {/* Suscripción activa */}
      {sub && (
        <section className="flex flex-col gap-5 rounded-2xl bg-ocean-deep p-7 shadow-[0_16px_40px_rgba(0,58,87,0.25)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.5 6.8L12 16.8 5.9 20.3l1.5-6.8L2.2 8.9l6.9-.6z" fill="#6E5528"></path></svg>
                <span className="font-heading text-xs font-bold tracking-widest text-sand-dark">SUSCRIPCIÓN ACTIVA</span>
              </div>
              <span className="text-[13px] text-white/60">Desde {fmtFecha(sub.since)}</span>
            </div>
            <div className="font-heading text-[26px] font-bold text-white">Plan {sub.name} · ${sub.monthly.toFixed(2)}/mes</div>
            <p className="text-sm text-white/70">Todas las cámaras y el forecast completo, sin límite. Renovación automática.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2.5 md:w-[220px]">
            <a href="/app" className="rounded-full bg-terracotta-dark py-2.5 text-center font-heading text-sm font-bold text-white transition-colors hover:bg-terracotta">Ver cámaras</a>
            <button
              type="button"
              onClick={() => { cancelSubscription(); setSession(getSession()); }}
              className="rounded-full border border-white/30 py-2.5 text-center font-heading text-sm font-bold text-white/85 transition-colors hover:border-white/60"
            >
              Cancelar suscripción
            </button>
          </div>
        </section>
      )}

      {/* Pases activos */}
      {activos.map((p) => (
        <PassCard key={p.code} pass={p} now={now} />
      ))}

      {/* Estado vacío */}
      {vacia && (
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ocean/25 bg-white px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-ocean/8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="3" y="7" width="18" height="12" rx="2.5" stroke="#00527A" strokeWidth="2"></rect><path d="M12 11v4M10 13h4" stroke="#00527A" strokeWidth="2" strokeLinecap="round"></path></svg>
          </div>
          <div className="font-heading text-xl font-bold text-ocean-deep">Aún no tienes accesos</div>
          <p className="max-w-[380px] text-sm leading-relaxed text-muted-foreground">
            Compra un pase por spot y por tiempo, o suscríbete y mira toda la costa. Todo lo que compres aparecerá aquí.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/comprar" className="rounded-full bg-terracotta-dark px-6 py-2.5 font-heading text-sm font-bold text-white transition-colors hover:bg-terracotta">Comprar un pase</a>
            <a href="/planes" className="rounded-full border-2 border-ocean px-6 py-2.5 font-heading text-sm font-bold text-ocean transition-colors hover:bg-ocean/5">Ver planes</a>
          </div>
        </section>
      )}

      {/* Historial + upsell */}
      {!vacia && (
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <section className="flex w-full flex-1 flex-col gap-4 rounded-2xl border border-ocean/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-ocean-deep">Historial</h2>
            {session.passes.length === 0 && !sub ? (
              <p className="text-sm text-muted-foreground">Sin compras todavía.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {[...session.passes].reverse().map((p) => {
                  const activo = p.expiresAt > now;
                  return (
                    <div key={p.code} className="flex items-center gap-3.5 rounded-xl px-2.5 py-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ocean/8">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="3" y="7" width="18" height="12" rx="2.5" stroke="#00527A" strokeWidth="2"></rect><path d="M12 11v4M10 13h4" stroke="#00527A" strokeWidth="2" strokeLinecap="round"></path></svg>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="truncate text-sm font-semibold text-ocean-deep">{passLabel(p)}</div>
                        <div className="text-xs text-muted-foreground">{fmtFecha(p.activatedAt)} · ${p.total.toFixed(2)} · código {p.code}</div>
                      </div>
                      <div className={"rounded-full px-3 py-1 font-heading text-[11px] font-bold " + (activo ? "bg-success/12 text-success-ink" : "bg-muted-foreground/12 text-muted-foreground")}>
                        {activo ? "ACTIVO" : "EXPIRADO"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {!sub && (
            <section className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl bg-gradient-to-br from-sand to-[#F5EAC9] p-6.5 lg:w-[340px]">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.5 6.8L12 16.8 5.9 20.3l1.5-6.8L2.2 8.9l6.9-.6z" fill="#6E5528"></path></svg>
                <h2 className="font-heading text-[17px] font-bold text-sand-dark">¿Vienes seguido?</h2>
              </div>
              <p className="text-sm leading-relaxed text-sand-dark">
                Este mes llevas <strong>${gastoMes.toFixed(2)} en pases</strong>. Con el plan {localPlan.name} tendrías todas las cámaras y el forecast completo por <strong>${localPlan.monthly.toFixed(2)}/mes</strong>.
              </p>
              <a href="/comprar?plan=local" className="rounded-full bg-ocean-deep py-3 text-center font-heading text-[15px] font-bold text-white transition-colors hover:bg-ocean">
                Cambiar a Local
              </a>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
