import { useEffect, useState, type FormEvent } from "react";
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
  toggleSavedSpot,
  setAlertPref,
  setPaymentMethod,
  mockPaymentMethod,
  login,
  type Session,
  type StoredPass,
  type StoredPaymentMethod,
} from "@/lib/session";

const localPlan = plans.find((p) => p.id === "local")!;

const TABS = ["accesos", "guardados", "alertas", "pagos", "perfil"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  accesos: "Mis accesos",
  guardados: "Spots guardados",
  alertas: "Alertas",
  pagos: "Pagos",
  perfil: "Perfil",
};

function spotOf(slug: string) {
  return spots.find((s) => s.slug === slug);
}

function passLabel(p: StoredPass): string {
  const n = p.spots.length;
  const who = n === spots.length ? "todos los spots" : `${n} ${n === 1 ? "spot" : "spots"}`;
  return `Pase ${who} · ${p.durationLabel}`;
}

function readTabFromUrl(): Tab {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && (TABS as readonly string[]).includes(t)) return t as Tab;
  } catch {
    /* SSR o URL no disponible: cae al tab por defecto */
  }
  return "accesos";
}

function writeTabToUrl(tab: Tab) {
  try {
    const url = new URL(window.location.href);
    if (tab === "accesos") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch {
    /* nada que actualizar */
  }
}

/** Switch accesible mínimo: sin librería, sin gradiente ni glass, solo color funcional. */
function AlertToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={
        "relative inline-flex h-7 w-[46px] shrink-0 items-center rounded-full transition-colors " +
        (checked ? "bg-success" : "bg-navy/15")
      }
    >
      <span
        className={
          "inline-block size-5 rounded-full bg-white transition-transform " +
          (checked ? "translate-x-[23px]" : "translate-x-1")
        }
      />
    </button>
  );
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

const accessBadge: Record<string, { label: string; className: string }> = {
  gratis: { label: "GRATIS", className: "bg-success/12 text-success-ink" },
  premium: { label: "PREMIUM", className: "bg-navy/10 text-navy" },
  bloqueado: { label: "REQUIERE PASE", className: "bg-sand text-sand-dark" },
};

function HistorialSection({ session, now }: { session: Session; now: number }) {
  return (
    <section className="flex w-full flex-1 flex-col gap-4 rounded-2xl border border-divider bg-white p-5 sm:p-6">
      <h2 className="font-heading text-lg font-bold text-navy">Historial de pases</h2>
      {session.passes.length === 0 ? (
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
  );
}

const tipoPagoLabel: Record<StoredPaymentMethod["type"], string> = {
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  movil: "Pago móvil",
};

export default function CuentaPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<Tab>("accesos");
  const [perfilNombre, setPerfilNombre] = useState("");
  const [perfilEmail, setPerfilEmail] = useState("");
  const [perfilGuardado, setPerfilGuardado] = useState(false);
  const [pagoTipo, setPagoTipo] = useState<StoredPaymentMethod["type"]>("tarjeta");

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setTab(readTabFromUrl());
    setPerfilNombre(s.user?.name ?? "");
    setPerfilEmail(s.user?.email ?? "");
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  function refresh() {
    setSession(getSession());
  }

  function goTab(next: Tab) {
    setTab(next);
    writeTabToUrl(next);
  }

  function logout() {
    clearSession();
    window.location.href = "/";
  }

  if (!session) {
    return (
      <>
        <aside className="flex w-full shrink-0 flex-row gap-1.5 overflow-x-auto rounded-2xl border border-divider bg-white p-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:p-3.5 lg:w-60 lg:flex-col lg:gap-1 lg:overflow-visible" aria-label="Secciones de la cuenta">
          {TABS.map((t) => (
            <span key={t} className="min-h-11 shrink-0 rounded-full px-3.5 py-2.5 font-heading text-[15px] font-semibold text-muted-foreground lg:rounded-xl lg:py-3">
              {TAB_LABELS[t]}
            </span>
          ))}
        </aside>
        <div className="min-h-[300px] flex-1" aria-hidden="true"></div>
      </>
    );
  }

  const activos = activePasses(session, now);
  const expirados = expiredPasses(session, now);
  const sub = session.subscription;
  const sinAccesoActivo = activos.length === 0 && !sub;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const gastoMes = session.passes
    .filter((p) => p.activatedAt >= inicioMes.getTime())
    .reduce((sum, p) => sum + p.total, 0);

  const savedSpotObjs = session.savedSpots.map((slug) => spotOf(slug)).filter((s): s is NonNullable<typeof s> => !!s);

  function quitarSpot(slug: string) {
    toggleSavedSpot(slug);
    refresh();
  }

  function guardarMetodoPago(ev: FormEvent) {
    ev.preventDefault();
    setPaymentMethod(mockPaymentMethod(pagoTipo));
    refresh();
  }

  function quitarMetodoPago() {
    setPaymentMethod(null);
    refresh();
  }

  function guardarPerfil(ev: FormEvent) {
    ev.preventDefault();
    login(perfilNombre.trim() || "Invitado", perfilEmail.trim());
    refresh();
    setPerfilGuardado(true);
    window.setTimeout(() => setPerfilGuardado(false), 2500);
  }

  return (
    <>
      {/* Navegación de cuenta: tabs reales sincronizados con ?tab= en la URL */}
      <aside className="flex w-full shrink-0 flex-row gap-1.5 overflow-x-auto rounded-2xl border border-divider bg-white p-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:p-3.5 lg:w-60 lg:flex-col lg:gap-1 lg:overflow-visible" aria-label="Secciones de la cuenta">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => goTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={
              "flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 py-2.5 text-left font-heading text-[15px] transition-colors lg:rounded-xl lg:py-3 " +
              (tab === t ? "bg-navy/8 font-bold text-navy" : "font-semibold text-muted-foreground hover:text-navy")
            }
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-[26px] font-bold text-navy md:text-[32px]">{TAB_LABELS[tab]}</h1>
          <button type="button" onClick={logout} className="btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            Cerrar sesión
          </button>
        </div>

        {tab === "accesos" && (
          <>
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
                    onClick={() => { cancelSubscription(); refresh(); }}
                    className="btn-secondary-light btn-sm btn-block"
                  >
                    Cancelar suscripción
                  </button>
                </div>
              </section>
            )}

            {activos.map((p) => (
              <PassCard key={p.code} pass={p} now={now} />
            ))}

            {sinAccesoActivo && (
              <section className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-divider bg-white px-5 py-10 text-center sm:px-6 sm:py-14">
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

            {!sinAccesoActivo && !sub && (
              <section className="flex w-full flex-col gap-3.5 rounded-2xl bg-sand p-5 sm:p-6.5">
                <h2 className="font-heading text-[17px] font-bold text-sand-dark">Plan {localPlan.name}</h2>
                <p className="text-[15px] leading-relaxed text-sand-dark sm:text-sm">
                  Este mes llevas <strong>${gastoMes.toFixed(2)} en pases</strong>. El plan {localPlan.name} incluye las nueve cámaras y el forecast a 7 días por <strong>${localPlan.monthly.toFixed(2)}/mes</strong>.
                </p>
                <a href="/comprar?plan=local" className="btn-primary btn-block sm:w-auto sm:self-start">
                  Cambiar a Local
                </a>
              </section>
            )}
          </>
        )}

        {tab === "guardados" && (
          savedSpotObjs.length === 0 ? (
            <section className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-divider bg-white px-5 py-10 text-center sm:px-6 sm:py-14">
              <div className="font-heading text-xl font-bold text-navy">Aún no guardas spots</div>
              <p className="max-w-[380px] text-[15px] leading-relaxed text-muted-foreground sm:text-sm">
                Guarda tus spots favoritos desde la ficha de cada cámara para encontrarlos rápido aquí.
              </p>
              <a href="/app" className="btn-primary btn-sm">Explorar spots</a>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedSpotObjs.map((spot) => {
                const badge = accessBadge[spot.access];
                return (
                  <div key={spot.slug} className="flex flex-col overflow-hidden rounded-2xl border border-divider bg-white">
                    <a href={`/spots/${spot.slug}`} className={`relative block h-32 w-full overflow-hidden bg-gradient-to-br ${spot.gradient}`}>
                      <img src={spot.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    </a>
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <a href={`/spots/${spot.slug}`} className="font-heading text-[15px] font-bold text-navy hover:text-navy-dark">{spot.name}</a>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 font-heading text-[11px] font-bold ${badge.className}`}>{badge.label}</span>
                      </div>
                      <button type="button" onClick={() => quitarSpot(spot.slug)} className="btn-secondary btn-sm self-start">
                        Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === "alertas" && (
          <section className="flex flex-col gap-1 rounded-2xl border border-divider bg-white p-5 sm:p-6">
            <p className="pb-3 text-sm text-muted-foreground">Es una demo: activar la alerta no envía notificaciones reales, solo queda guardada en tu cuenta.</p>
            <div className="flex flex-col divide-y divide-divider">
              {spots.map((spot) => (
                <div key={spot.slug} className="flex items-center gap-3.5 py-3.5">
                  <div className={`h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${spot.gradient}`}>
                    <img src={spot.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-heading text-sm font-bold text-navy">{spot.name}</span>
                    <span className="text-xs text-muted-foreground">Avisarme cuando mejoren las condiciones</span>
                  </div>
                  <AlertToggle
                    checked={!!session.alertPrefs[spot.slug]}
                    label={`Alerta de condiciones para ${spot.name}`}
                    onChange={(next) => { setAlertPref(spot.slug, next); refresh(); }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "pagos" && (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4 rounded-2xl border border-divider bg-white p-5 sm:p-6">
              <h2 className="font-heading text-lg font-bold text-navy">Método de pago</h2>
              {session.paymentMethod ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-foam p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-heading text-sm font-bold text-navy">{session.paymentMethod.label}</span>
                    <span className="text-xs text-muted-foreground">{tipoPagoLabel[session.paymentMethod.type]} · guardado en esta demo</span>
                  </div>
                  <button type="button" onClick={quitarMetodoPago} className="btn-secondary btn-sm">Quitar</button>
                </div>
              ) : (
                <form onSubmit={guardarMetodoPago} className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">Elige un método. Es una demo: no se procesa ningún cobro real.</p>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    {(["tarjeta", "transferencia", "movil"] as const).map((t) => (
                      <label
                        key={t}
                        className={
                          "flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 transition-colors " +
                          (pagoTipo === t ? "border-navy bg-navy/[0.04]" : "border-navy/20")
                        }
                      >
                        <input
                          type="radio"
                          name="tipo-pago"
                          value={t}
                          checked={pagoTipo === t}
                          onChange={() => setPagoTipo(t)}
                          className="accent-navy"
                        />
                        <span className="text-sm font-semibold text-ink">{tipoPagoLabel[t]}</span>
                      </label>
                    ))}
                  </div>
                  <button type="submit" className="btn-primary btn-sm self-start">Guardar método</button>
                </form>
              )}
            </section>

            <HistorialSection session={session} now={now} />
          </div>
        )}

        {tab === "perfil" && (
          <section className="flex w-full max-w-[480px] flex-col gap-5 rounded-2xl border border-divider bg-white p-5 sm:p-6">
            <form onSubmit={guardarPerfil} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-heading text-sm font-semibold text-navy">Nombre</span>
                <input
                  type="text"
                  value={perfilNombre}
                  onChange={(e) => setPerfilNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-full border border-navy/20 bg-white px-5 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-navy"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-heading text-sm font-semibold text-navy">Email</span>
                <input
                  type="email"
                  value={perfilEmail}
                  onChange={(e) => setPerfilEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full rounded-full border border-navy/20 bg-white px-5 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-navy"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="btn-primary btn-sm">Guardar cambios</button>
                {perfilGuardado && <span className="text-sm font-semibold text-success-ink">Cambios guardados.</span>}
              </div>
            </form>
            <div className="flex flex-col gap-2 border-t border-divider pt-5">
              <p className="text-sm text-muted-foreground">¿Terminaste tu sesión?</p>
              <button type="button" onClick={logout} className="btn-secondary btn-sm self-start">Cerrar sesión</button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
