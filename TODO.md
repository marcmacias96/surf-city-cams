# TODO — SurfCity Cams

Estado al último push: fase 3 (separación landing/plataforma) aplicada en código y compilando, pero con verificación y remates pendientes. Producción en Vercel (https://surfcity-cams.vercel.app) quedó en la fase 2 verificada; el estado de este repo aún no se desplegó.

## Pendiente

- [ ] **Logo oficial de SurfCity**: descargar de surfcityecuador.com (`/_next/static/media/logo-surfcity.d68b4817.png`), recortar la marca (ola) a cuadrado para navbars, logo completo en /login, versión clara (invert) para AppNavbar oscuro y footer, créditos en `app/public/brand/README.md`. Reemplaza el SVG recreado de `src/components/Logo.astro`.
- [ ] **Quitar badges "eyebrow" decorativos** (feedback: se ven "muy IA"): eliminar la pastilla del hero "9 CÁMARAS EN VIVO · …" (integrar el dato en el párrafo si hace falta) y convertir el chip sand "¿CÓMO FUNCIONA EL PASE?" de `planes.astro` en etiqueta de texto plano (uppercase, tracking-wide, sin fondo ni puntito). NO tocar indicadores funcionales (EN VIVO, PASE ACTIVO, badges de acceso, chips de forecast).
- [ ] **Verificación E2E de la fase 3** (quedó a medias al detener el agente): landing sin mapa → /app redirige a /login sin sesión → login (nombre/invitado, `?next=` seguro) → dashboard /app con mapa+lista → /spots/faro-1 (gratis) y /spots/el-sombrero (paywall) → compra → /cuenta → "Salir" vuelve a landing y re-bloquea. Revisar enlaces viejos a `/#spots` y el menú móvil de ambos navbars (375px).
- [ ] **Deploy a Vercel** una vez verificado: `cd app && vercel deploy --prod --yes` (proyecto vinculado a marco-macias-projects/surfcity-cams, cuenta personal marcmacias97).

## Contexto rápido

- Datos y precios mock: `app/src/data/spots.ts` (9 spots reales con coordenadas del cliente; tarifas de pases y planes).
- Sesión de la demo (pases, suscripción, usuario del login mock): `app/src/lib/session.ts` (localStorage, clave `surfcity:session:v1`).
- Mapa Leaflet embebido: `app/public/mapa.html` (postMessage `surfcity-app`/`surfcity-map`, tarjetas con re-layout por zoom/paneo, marcadores que se separan al hacer zoom, controles nativos).
- Fotos de spots con licencia libre: `app/public/spots/` + `CREDITS.md`.
- Diseño original (lienzo Claude Design): `*.dc.html` + `canvas.json` en la raíz.
