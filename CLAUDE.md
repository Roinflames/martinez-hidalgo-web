# martinez-hidalgo-web — CLAUDE.md

## Proyecto
Sitio web institucional de la firma legal ABHV (Asesorías Legales de Excelencia).
Stack: HTML + CSS + Vanilla JS · Express (Node.js) · Render (static site + web service)

## URLs en producción
| Servicio | URL | Tipo |
|---|---|---|
| **Principal (usar este)** | `martinez-hidalgo-web-1.onrender.com` | Static site |
| Backup / API | `martinez-hidalgo-web.onrender.com` | Node.js Web Service |

## Regla: mínimo viable antes de cualquier trabajo
Antes de tocar código, verificar que el sitio carga en producción:
1. `publishPath` en Render dashboard debe ser `public` (no `.`)
   → Dashboard: https://dashboard.render.com/static/srv-d7m4as6gvqtc73a4nulg/settings
2. `public/index.html` debe existir
3. El static site no tiene backend — el chatbot es 100% client-side

## Formulario de contacto
- Usa Formspree: `public/script.js` → reemplazar `YOUR_FORM_ID` con ID real de formspree.io
- Sin Formspree activo, el form muestra error al enviar

## Estructura relevante
```
public/         → raíz del static site (publishPath en Render)
src/server.js   → Express que también sirve public/ (web service backup)
render.yaml     → config del web service (no del static site)
```

## Reglas de deploy
- No hacer push sin build local verificado
- El static site en Render deploya automático en push a `main`
- Si hay cambio de publishPath, hacerlo desde el dashboard (el MCP de Render no soporta update de static sites)
