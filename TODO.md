# TODO — SurfCity Cams

Estado al último push: fase 4 completada — marca oficial aplicada (guía `docs/BRAND.md`, logos SVG en `app/public/brand/`), limpieza de patrones "IA" (`docs/AUDIT-IA.md`), pasada móvil (375/390/414) y verificación E2E completa en desktop y móvil. Producción en Vercel (https://surfcity-cams.vercel.app) pendiente de redesplegar: el token de la CLI de Vercel en esta máquina devuelve 403 "Not authorized".

## Hecho en la fase 4

- [x] Logo oficial de SurfCity: SVG extraídos del kit vectorial (`logo-horizontal`, `logo-stacked`, `mark` + variantes `-white`), `Logo.astro` reescrito, créditos en `app/public/brand/README.md`.
- [x] Badges "eyebrow" decorativos eliminados (hero y chip de `/planes`); indicadores funcionales (EN VIVO, PASE ACTIVO, badges de acceso, chips de forecast) conservados. Informe en `docs/AUDIT-IA.md`.
- [x] Verificación E2E de la fase 3: landing sin mapa → `/app` redirige a `/login?next=/app` → login → dashboard con mapa+lista sincronizados (clic fila → flyTo, filtro por nivel) → `/spots/faro-1` (player) y `/spots/el-sombrero` (paywall) → compra mock de 2 spots → `/cuenta` con pase, fotos y chip "Pase activo" → spot desbloqueado → "Salir" → landing anónima y `/cuenta` vuelve a `/login`. Menús móviles de ambos navbars OK. Sin errores de consola. Enlace roto del footer (`/planes#faq`) corregido → `/planes#como-funciona`.

## Pendiente

- [ ] **Deploy a Vercel**: `vercel login` con la cuenta personal (marcmacias97) y luego `cd app && vercel deploy --prod --yes` (proyecto vinculado marco-macias-projects/surfcity-cams). Verificar https://surfcity-cams.vercel.app (landing con "Probar la demo", `/login`, `/app`, `/brand/logo-horizontal-white.svg`).
- [ ] Página de soporte / FAQ real: el enlace "Soporte" del footer apunta por ahora a la sección "¿Cómo funciona el pase?" de `/planes`. "Términos" sigue siendo texto sin enlace.
- [ ] Player real: `CamSurface.astro` usa foto + controles mock; falta integrar streaming (HLS) cuando existan las cámaras.
- [ ] Pago real: `PassBuilder.tsx` persiste el pase en localStorage; falta pasarela y backend de sesión.
- [ ] Fuente corporativa Metropolis (solo impresos/logo); en web se mantiene Josefin Sans + Open Sans según `docs/BRAND.md`.

## Contexto rápido

- Guía de marca: `docs/BRAND.md`; assets oficiales: `app/public/brand/` (+ `README.md`).
- Datos y precios mock: `app/src/data/spots.ts` (9 spots reales con coordenadas del cliente; tarifas de pases y planes).
- Sesión de la demo (pases, suscripción, usuario del login mock): `app/src/lib/session.ts` (localStorage, clave `surfcity:session:v1`).
- Mapa Leaflet embebido: `app/public/mapa.html` (postMessage `surfcity-app`/`surfcity-map`, tarjetas con re-layout por zoom/paneo, marcadores que se separan al hacer zoom, controles nativos).
- Fotos de spots con licencia libre: `app/public/spots/` + `CREDITS.md`.
- Capturas de la auditoría: `docs/audit-ia/`.
- Diseño original (lienzo Claude Design): `*.dc.html` + `canvas.json` en la raíz.
