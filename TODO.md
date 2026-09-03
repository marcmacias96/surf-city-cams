# TODO — SurfCity Cams

Estado al último push: fase 5 completada — fix de layout (sticky footer + estados cortos), secciones de cuenta funcionales (spots guardados, alertas, pagos, perfil), "Cómo llegar" real y página de términos. Verificación E2E completa en desktop (1440×900) y móvil (375×812). Producción en Vercel (https://surfcity-cams.vercel.app) sigue pendiente de redesplegar: la CLI de Vercel en esta máquina devuelve 403 "Not authorized" hasta correr `vercel login` con la cuenta personal.

## Hecho en la fase 5

- [x] **Fix de layout (sticky footer)**: `Layout.astro` con `flex min-h-screen flex-col` + slot envuelto en `flex-1`; aplicado consistentemente en las 7 páginas (`index`, `login`, `app`, `planes`, `spots/[slug]`, `cuenta`, `comprar`). Bug real corregido en `planes.astro` (contenedor sin `flex flex-col` dejaba hueco entre el contenido corto y el footer).
- [x] **Spots guardados**: `toggleSavedSpot` en `session.ts`, botón "Guardar spot" en la ficha de cada cámara, tab "Spots guardados" en `/cuenta` con grid de tarjetas (foto real + badge de acceso + "Quitar") y estado vacío con CTA a `/app` — este es el estado vacío que el cliente reportó roto; verificado en pantalla que ahora se ve completo y el footer no queda pegado ni con hueco.
- [x] **Alertas**: tab con los 9 spots, switch accesible (`role="switch"`) para "avisarme cuando mejoren las condiciones", persistido en `alertPrefs` (demo: no envía notificaciones reales).
- [x] **Pagos**: método de pago mock (tarjeta/transferencia/pago móvil) guardable y removible desde `/cuenta`, más historial de pases (movido aquí desde "Mis accesos").
- [x] **Perfil**: formulario controlado nombre/email prellenado desde la sesión, "Guardar cambios" reutiliza `login()`, botón "Cerrar sesión" propio del tab.
- [x] **Cómo llegar**: enlace real a Google Maps (`maps/dir/?api=1&destination=lat,lon`) con las coordenadas de cada spot, verificado en `spots.ts`.
- [x] **Página de términos**: `/terminos` nueva, enlazada desde el footer en todas las páginas (antes era texto sin link).
- [x] **E2E completo** (desktop y móvil, partiendo de `localStorage.clear()`): landing → login "Marco" → `/app` → guardar spot → las 5 tabs de `/cuenta` (persisten tras F5 y con deep-link `?tab=`) → comprar pase de 2 spots → aparece en Pagos > historial y en Mis accesos → "Cómo llegar" → `/terminos` desde el footer en 3 páginas distintas → "Salir" limpia `localStorage` y `/cuenta` vuelve a pedir login. Sin errores de consola nuevos en ningún paso. Único incidente: el dev server cayó en "504 Outdated Optimize Dep" a mitad de la pasada móvil (dependencia de Vite desincronizada tras cambios previos) — resuelto con `astro dev stop` + `astro dev --background`, no es un bug de la app.

## Pendiente

- [ ] **Deploy a Vercel**: la CLI en esta máquina sigue devolviendo 403 "Not authorized". Hace falta correr `vercel login` con la cuenta personal (marcmacias97) antes de que un agente pueda `cd app && vercel deploy --prod --yes` (proyecto vinculado marco-macias-projects/surfcity-cams). Verificar después https://surfcity-cams.vercel.app (landing, `/login`, `/app`, `/cuenta`, `/terminos`).
- [ ] Página de soporte / FAQ real: el enlace "Soporte" del footer sigue apuntando a la sección "¿Cómo funciona el pase?" de `/planes`.
- [ ] Player real: `CamSurface.astro` usa foto + controles mock; falta integrar streaming (HLS) cuando existan las cámaras.
- [ ] Pago real: `PassBuilder.tsx` y el formulario de método de pago en `/cuenta` persisten todo en localStorage; falta pasarela y backend de sesión.
- [ ] Notificaciones reales para las alertas de condiciones (hoy solo se guarda la preferencia, no se envía nada).
- [ ] Fuente corporativa Metropolis (solo impresos/logo); en web se mantiene Josefin Sans + Open Sans según `docs/BRAND.md`.

## Contexto rápido

- Guía de marca: `docs/BRAND.md`; assets oficiales: `app/public/brand/` (+ `README.md`).
- Datos y precios mock: `app/src/data/spots.ts` (9 spots reales con coordenadas del cliente; tarifas de pases y planes).
- Sesión de la demo (pases, suscripción, usuario, spots guardados, alertas, método de pago): `app/src/lib/session.ts` (localStorage, clave `surfcity:session:v1`).
- Panel de cuenta (tabs Mis accesos/Spots guardados/Alertas/Pagos/Perfil, sincronizado con `?tab=`): `app/src/components/cuenta/CuentaPanel.tsx`.
- Mapa Leaflet embebido: `app/public/mapa.html` (postMessage `surfcity-app`/`surfcity-map`, tarjetas con re-layout por zoom/paneo, marcadores que se separan al hacer zoom, controles nativos).
- Fotos de spots con licencia libre: `app/public/spots/` + `CREDITS.md`.
- Página de términos: `app/src/pages/terminos.astro`.
- Capturas de la auditoría: `docs/audit-ia/`.
- Diseño original (lienzo Claude Design): `*.dc.html` + `canvas.json` en la raíz.
