# Surf City Ecuador — Guía de Marca para Desarrollo

Fuente: guía compartida por el cliente (artifact "Guia de Marca (Dev)") + brand board del kit de logo (`brand-src/logo-surfcity-kit.pdf`, pág. 5).

## Colores

| Uso | Nombre | Hex |
| --- | --- | --- |
| Primario (headers, textos de marca, botones secundarios) | Navy | `#005279` |
| Primario oscuro (fondos de header/footer) | Navy Dark | `#0A3550` |
| Acento / CTA principal | Terracotta | `#DC8158` |
| Fondo cálido general | Sand | `#F1E6D2` |
| Fondo de tarjetas/superficies | Foam | `#FBF7F1` |
| Texto principal | Ink | `#12242F` |
| Texto secundario / notas | Grey | `#6B7B85` |
| Blanco (texto sobre fondos oscuros) | White | `#FFFFFF` |
| Separadores/dividers | Sand oscurecido | `#EFDEB1` (`border-top: 1px solid`) |

Brand board del kit (complementario): navy `#00527A` (≈ Navy), sand `#EFDEB1`, gris azulado `#D2D9D8`, terracotta `#DC8158`. Tipografía corporativa del logo/impresos: **Metropolis Black / Semi Bold** (no disponible en web; en web se usa Josefin Sans).

```css
:root {
  --navy: #005279;
  --navy-dark: #0A3550;
  --terracotta: #DC8158;
  --sand: #F1E6D2;
  --foam: #FBF7F1;
  --ink: #12242F;
  --grey: #6B7B85;
}
```

## Tipografía

- Titulares / marca / botones: `'Josefin Sans', Arial, sans-serif` — bold, tracking amplio (`letter-spacing: 0.06em–0.12em` según tamaño).
- Texto de cuerpo: `'Open Sans', Arial, sans-serif` — regular, `line-height: 1.6–1.7`.

```css
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;700&family=Open+Sans:wght@400;600&display=swap');
body { font-family: 'Open Sans', Arial, sans-serif; color: var(--ink); }
h1, h2, h3, .brand, button { font-family: 'Josefin Sans', Arial, sans-serif; }
```

## Botones

Primario (comprar, suscribirse): `background: var(--terracotta); color: #fff; border-radius: 30px; padding: 14px 24px; font-weight: 700; letter-spacing: 0.06em;`

Secundario (ver más, planes): `background: transparent; color: var(--navy); border: 2px solid var(--navy); border-radius: 30px; padding: 12px 24px; font-weight: 700;`

## Header / Footer

- Header: fondo `--navy-dark`, logo en blanco, texto centrado.
- Footer: fondo `--navy-dark`, links en `--sand` o blanco con opacidad reducida (`rgba(255,255,255,0.6)`).

## Logo

- Usar siempre el archivo oficial (blanco sobre fondo transparente) — **nunca recrear el ícono de ola a mano**. Assets en `app/public/brand/`.
- Sobre fondos oscuros (navy): logo blanco completo.
- Espacio mínimo alrededor del logo: su propia altura.

## Tono visual

Minimalista, confiable, "editorial de viajes" — no genérico de app SaaS. Espacios generosos, esquinas redondeadas suaves (10–14px en tarjetas, 30px en botones pill), sin gradientes llamativos ni iconografía genérica de stock.
