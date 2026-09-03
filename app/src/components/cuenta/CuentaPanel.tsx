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
    <section className="flex flex-col gap-6 rounded-2xl bg-navy-dark p-5 sm:gap-8 sm:p-7 md:flex-row md:items-center">
      <div className="flex flex-1 flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-success/20 px-3.5 py-1.5">
            <span className="live-dot inline-block size-[7px] rounded-full bg-success"></span>
            <span className="font-heading text-xs font-bold tracking-widest text-success-light">PASE ACTIVO</span>
          </div>
          <div className="text-[13px] text-white/60">Código {pass.code}</div>
        </div>
        <div className="font-heading text-[22px] font-bold leading-tight text-white sm:text-[26px]">{passLabel(pass)}</div>
        <div className="flex flex-wrap gap-2.5">
          {pass.spots.map((slug) => {
            const spot = spotOf(slug);
            if (!spot) return null;
            return (
              <a key={slug} href={`/spots/${slug}`} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/30 px-3.5 py-2 transition-colors hover:border-white">
                <div className={`relative h-6 w-[34px] overflow-hidden rounded-[5px] bg-gradient-to-br ${spot.gradient}`}>
                  <img src={spot.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </div>
                <span className="text-[13px] font-semibold text-white">{spot.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2.5 md:w-[300px]">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-white/60">Tiempo restante</span>
          <span className="font-heading text-[22px] font-bold text-white">{fmtRemaining(restante)}</span>
        </div>
        <div className="relative h-2.5 rounded-full bg-white/15">
          <div className="absolute inset-y-0 left-0 rounded-full bg-success" style={{ width: `${100 - pct}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-white/50">
          <span>Activado {fmtFecha(pass.activatedAt)}</span>
          <span>Expira {fmtFecha(pass.expiresAt)}</span>
        </div>
        <a href="/comprar" className="btn-primary btn-sm btn-block mt-1.5">
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
        <h1 className="font-heading text-[26px] font-bold text-navy md:text-[32px]">Mis accesos</h1>
        <button
          type="button"
          onClick={logout}
          className="btn-secondary btn-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          Cerrar sesión
        </button>
      </div>

      {/* Suscripción activa */}
      {sub && (
        <section className="flex flex-col gap-5 rounded-2xl bg-navy-dark p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.5 6.8L12 16.8 5.9 20.3l1.5-6.8L2.2 8.9l6.9-.6z" fill="#6E5528"></path></svg>
                <span className="font-heading text-xs font-bold tracking-widest text-sand-dark">SUSCRIPCIÓN ACTIVA</span>
              </div>
              <span className="text-[13px] text-white/60">Desde {fmtFecha(sub.since)}</span>
            </div>
            <div className="font-heading text-[22px] font-bold leading-tight text-white sm:text-[26px]">Plan {sub.name} · ${sub.monthly.toFixed(2)}/mes</div>
            <p className="text-[15px] text-white/70 sm:text-sm">Las nueve cámaras y el forecast a 7 días. Se renueva cada mes; puedes cancelar cuando quieras.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2.5 md:w-[220px]">
            <a href="/app" className="btn-primary btn-sm btn-block">Ver cámaras</a>
            <button
              type="button"
              onClick={() => { cancelSubscription(); setSession(getSession()); }}
              className="btn-secondary-light btn-sm btn-block"
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
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-divider bg-white px-5 py-10 text-center sm:px-6 sm:py-14">
          <div className="font-heading text-xl font-bold text-navy">Aún no tienes accesos</div>
          <p className="max-w-[380px] text-[15px] leading-relaxed text-muted-foreground sm:text-sm">
            Compra un pase por spot y por tiempo, o suscríbete al plan Local. Los pases y la suscripción quedan registrados aquí.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
            <a href="/comprar" className="btn-primary btn-sm btn-block sm:w-auto">Comprar un pase</a>
            <a href="/planes" className="btn-secondary btn-sm btn-block sm:w-auto">Ver planes</a>
          </div>
        </section>
      )}

      {/* Historial + upsell */}
      {!vacia && (
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <section className="flex w-full flex-1 flex-col gap-4 rounded-2xl border border-divider bg-white p-5 sm:p-6">
            <h2 className="font-heading text-lg font-bold text-navy">Historial</h2>
            {session.passes.length === 0 && !sub ? (
              <p className="text-sm text-muted-foreground">Sin compras todavía.</p>
            ) : (
              <div className="flex flex-col divide-y divide-divider">
                {[...session.passes].reverse().map((p) => {
                  const activo = p.expiresAt > now;
                  return (
                    <div key={p.code} className="flex items-center gap-3.5 py-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="truncate text-sm font-semibold text-ink">{passLabel(p)}</div>
                        <div className="text-xs text-muted-foreground">{fmtFecha(p.activatedAt)} · ${p.total.toFixed(2)} · <span className="whitespace-nowrap">código {p.code}</span></div>
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
            <section className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl bg-sand p-5 sm:p-6.5 lg:w-[340px]">
              <h2 className="font-heading text-[17px] font-bold text-sand-dark">Plan {localPlan.name}</h2>
              <p className="text-[15px] leading-relaxed text-sand-dark sm:text-sm">
                Este mes llevas <strong>${gastoMes.toFixed(2)} en pases</strong>. El plan {localPlan.name} incluye las nueve cámaras y el forecast a 7 días por <strong>${localPlan.monthly.toFixed(2)}/mes</strong>.
              </p>
              <a href="/comprar?plan=local" className="btn-primary btn-block">
                Cambiar a Local
              </a>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
