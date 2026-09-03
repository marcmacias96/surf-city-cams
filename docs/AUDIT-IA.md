# Auditoría de patrones "generados por IA" — SurfCity Cams

Fecha: 2026-09-02. Alcance: 7 páginas (`index`, `login`, `app`, `planes`, `comprar`, `cuenta`, `spots/[slug]`) + componentes. Referencia de tono: `docs/BRAND.md` → "Minimalista, confiable, editorial de viajes; sin gradientes llamativos ni iconografía genérica de stock".

Rutas relativas a `app/src/`. Verificado con `grep` y en pantalla (capturas en `docs/audit-ia/`).

## Patrones encontrados y qué se hizo

| # | Patrón | Dónde estaba | Acción |
| --- | --- | --- | --- |
| 1 | Pill "eyebrow" con borde translúcido + puntito sobre el h1 (`9 CÁMARAS EN VIVO · MANTA Y…`) | `pages/index.astro` hero | Eliminada. Queda una línea de texto plano `Manta y Montecristi, Manabí` (Josefin, 14px, blanco/70), sin fondo ni punto. |
| 2 | Chip sand `¿CÓMO FUNCIONA EL PASE?` sobre el h2 | `pages/planes.astro` | Sustituido por etiqueta de texto plano uppercase `tracking-[0.12em]` en grey, sin fondo. |
| 3 | Gradiente decorativo de fondo `linear-gradient(165deg, navy-dark → navy → #0F6A93)` | `pages/index.astro` hero | Fondo sólido `bg-navy-dark`. |
| 4 | Ola SVG decorativa al pie del hero (`#7FD8F0`, opacity .14) | `pages/index.astro` | Eliminada. |
| 5 | Onda SVG de fondo en la tarjeta de pase activo | `components/cuenta/CuentaPanel.tsx` `PassCard` | Eliminada; la tarjeta es navy-dark sólido. |
| 6 | Gradiente en tarjeta upsell (`from-sand to-#F5EAC9`) + icono estrella + título gancho `¿Vienes seguido?` | `CuentaPanel.tsx` | `bg-sand` sólido, sin icono, título `Plan Local`, copy con la cifra real del mes. |
| 7 | Barra de progreso con gradiente `from-success to-seafoam` | `CuentaPanel.tsx` | Relleno sólido `bg-success`. |
| 8 | Miniatura con gradiente `#5E8296 → #2B4F63` ("Repetición 24 h") | `pages/spots/[slug].astro` | `bg-navy` sólido. |
| 9 | Glassmorphism: `bg-white/15 + border-white/40` en el círculo del candado; `backdrop-blur-[3px]` en el paywall | `components/CamSurface.astro`, `pages/spots/[slug].astro` | Círculo blanco sólido con candado navy; velo del paywall `bg-navy-dark/70` sin blur. |
| 10 | `bg-white/90 backdrop-blur` en header de checkout y barra fija móvil `bg-white/95 backdrop-blur` | `pages/comprar.astro`, `components/comprar/PassBuilder.tsx` | Blanco sólido + `border-divider`. |
| 11 | Chips de spots `bg-white/10 hover:bg-white/20` en tarjeta de pase | `CuentaPanel.tsx` | Outline limpio `border-white/30 hover:border-white`. |
| 12 | Celdas `bg-white/[0.08]` en "Condiciones ahora" | `pages/spots/[slug].astro` | Superficie sólida `bg-navy` sobre navy-dark. |
| 13 | Olas SVG animadas superpuestas a la foto real de cada cámara | `components/CamSurface.astro` | Ahora solo se renderizan cuando NO hay foto (fallback junto al gradiente). Con foto: foto + velo inferior navy. |
| 14 | Trío "cómo funciona" con iconito arriba + 2 líneas (landing) y trío con iconos en círculo + flechas terracotta (planes) | `pages/index.astro`, `pages/planes.astro` | Reescritos como lista editorial numerada (`<ol>`, numeral 01/02/03 en Josefin terracotta, título + párrafo, separadores 1px `divider`), sin iconos. Misma información, copy concreto. |
| 15 | Sombras exageradas: `shadow-[0_24px_60px…]`, `[0_20px_50px…]`, `[0_16px_44px…]`, `[0_16px_40px…]`, `[0_12px_34px…]`, `[0_8px_24px…]` + hover multiplicado | `index.astro`, `login.astro`, `app.astro`, `spots/[slug].astro`, `PlanPricing.tsx`, `CuentaPanel.tsx`, `PassBuilder.tsx`, `home/SpotCard.astro` | Retiradas. Tarjetas → borde 1px `#EFDEB1` (`border-divider`) y hover por borde (`hover:border-navy/40`). Solo quedan `shadow-lg` en la cámara destacada del hero (sobre navy), `shadow-sm` en login y resumen de compra, `shadow-md` en el botón play. |
| 16 | Esquinas muy redondeadas (`rounded-3xl` 18px, `rounded-[20px]`) | `index.astro`, `login.astro`, `app.astro`, `spots/[slug].astro`, `PassBuilder.tsx` | Normalizadas a `rounded-2xl` (14px). |
| 17 | Bordes punteados "AI card" (`border-dashed`) en estado vacío y en tarjeta plan Local | `CuentaPanel.tsx`, `PassBuilder.tsx` | Borde sólido `divider`; la tarjeta Local pasa a `bg-foam`. |
| 18 | Uppercase + tracking fuera de etiquetas | `index.astro` (pill hero), `planes.astro` (chip) | Eliminados con los patrones 1 y 2. El resto del uppercase que queda es funcional: EN VIVO, PASE ACTIVO, SUSCRIPCIÓN ACTIVA, GRATIS/PREMIUM, CONDICIONES/NIVEL, rótulos OLAS/VIENTO/MAREA/AGUA, ACTIVO/EXPIRADO, RECOMENDADO, etiqueta "Cómo funciona el pase". |
| 19 | Copy de plantilla | varios | `Surfea informado` → `Mira el mar antes de salir`; `¿Listo para revisar el mar?` → `Revisa El Sombrero antes de cargar la tabla`; `mira toda la costa sin límite` → `Un pase de 24 horas cuesta $1.49. Con la suscripción Local abres las nueve cámaras…`; `Todas las cámaras… sin límite. Renovación automática.` → `Las nueve cámaras y el forecast a 7 días. Se renueva cada mes…`; `Todo lo que compres aparecerá aquí` → `Los pases y la suscripción quedan registrados aquí`; `tendrías todos los spots, siempre` → `tendrías las nueve cámaras todos los días del mes`; `Un pase, tus spots, tu tiempo` (tríada) → `El pase se activa cuando abres la cámara`; `9 spots, una costa` → `Nueve spots en 30 km de costa` (distancia real máxima entre spots: 31,2 km, calculada con haversine sobre las coordenadas de `data/spots.ts`); `¿Cómo te llamamos?` → `Tu nombre`; `¿Ayuda?` → `Ayuda`; feature `Todas las cámaras, sin límite` → `Las 9 cámaras, todos los días` (`data/spots.ts`, solo texto). Hero: párrafo con localidades reales (San Mateo, Santa Marianita, Montecristi) y duraciones reales. |
| 20 | `MÁS POPULAR` (claim inventado en una demo) | `PlanPricing.tsx` | `RECOMENDADO`, pill `rounded-full`. |
| 21 | Iconografía genérica: iconos de plan (ticket/ola/estrella) junto al nombre; iconos de navegación de cuenta (corazón, campana, tarjeta, usuario); icono de ticket en historial y en estado vacío; icono de info en el aviso de demo del login; icono estrella en upsell | `PlanPricing.tsx`, `pages/cuenta.astro`, `CuentaPanel.tsx`, `pages/login.astro` | Retirados. Se conservan solo los funcionales: candado, play, check, flechas, ojo (viewers), pin (Cómo llegar), corazón (Guardar spot), salir, forecast (ola/viento/marea) en chips de datos. |
| 22 | Dependencia `lucide-react` (`Check`, `Lock`) | `PassBuilder.tsx` | Sustituidos por dos componentes SVG inline con `currentColor`. El paquete sigue en `package.json` (ya no se importa en ningún archivo; se puede desinstalar). |
| 23 | Aviso de demo como pill sand con icono | `pages/login.astro` | Texto plano grey `Demo sin contraseña ni datos reales.` |

## Verificado y conservado a propósito
- Indicadores funcionales de estado: `EN VIVO` sobre cámaras, `PASE ACTIVO`, `SUSCRIPCIÓN ACTIVA`, badges de acceso de 22px en la lista de `/app`, chips de forecast (olas/viento/marea), `PREMIUM`/`GRATIS`, chip de pase en `AppNavbar`.
- Gradiente `bg-gradient-to-br` de `CamSurface` y miniaturas: solo fallback bajo la foto (`spot.gradient`); el scrim inferior `from-navy-dark/45` da legibilidad a badges sobre la foto; el scrim de la barra de controles del player es UI estándar de vídeo.
- Los superficies `bg-white/10` del botón hamburguesa y del menú móvil en navbars navy: sin blur ni borde, es un botón sobre fondo oscuro, no glassmorphism. No se tocó.
- `public/mapa.html` y `lib/session.ts`: sin cambios.

## Archivos tocados
- `src/pages/index.astro` — hero sólido, sin pill/ola, lista numerada, copy, bordes divider.
- `src/pages/planes.astro` — etiqueta texto plano, lista numerada sin iconos/flechas, copy.
- `src/pages/login.astro` — tarjeta 14px + divider + shadow-sm, aviso en texto, placeholder.
- `src/pages/cuenta.astro` — sidebar solo texto, borde divider, `aria-current`.
- `src/pages/comprar.astro` — header sólido, borde divider, "Ayuda".
- `src/pages/app.astro` — mapa y filas sin sombra, `rounded-2xl`, borde divider.
- `src/pages/spots/[slug].astro` — player sin sombra, paywall sólido, celdas navy, miniatura sin gradiente, bordes divider, copy.
- `src/components/CamSurface.astro` — olas solo como fallback sin foto, candado sólido, play `shadow-md`, doc del componente.
- `src/components/home/SpotCard.astro` — sin sombra, borde divider (componente sin uso actual).
- `src/components/planes/PlanPricing.tsx` — sin iconos de plan, sin sombra, `RECOMENDADO`, borde divider.
- `src/components/cuenta/CuentaPanel.tsx` — sin onda/sombras/gradientes, chips outline, historial con separadores, estado vacío y upsell sobrios, copy.
- `src/components/comprar/PassBuilder.tsx` — sin lucide (SVG inline), resumen 14px + shadow-sm, selección sin sombra, tarjeta Local foam/divider, barra móvil sólida, copy.
- `src/data/spots.ts` — solo el texto de una feature del plan Local.

## Comprobación
- `npm run build`: limpio, 15 páginas.
- Capturas desktop 1440px en `docs/audit-ia/`: `landing.png`, `planes.png`, `spot-el-sombrero.png`, `app.png`, `cuenta.png`, `cuenta-con-pase.png`, `comprar.png`; móvil 375px: `landing-movil.png`.

## Pendiente para la siguiente etapa
- Desinstalar `lucide-react` (`npm uninstall lucide-react`) y `tw-animate-css` si tampoco se usa; ambos siguen en `package.json`.
- `home/SpotCard.astro` no se importa en ninguna página: decidir si se elimina.
- Los datos de "Condiciones ahora" (07:40, 147 viendo, Cámara Norte/Point) siguen siendo mock fijo; si el cliente pide realismo, mover a `data/spots.ts`.
- Verificación E2E del flujo login → comprar → cuenta → spot desbloqueado sigue sin hacerse en esta etapa (solo se comprobó visualmente con sesión inyectada).
