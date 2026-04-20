# Deploy Guide: martinez-hidalgo-web

Providers activos: render, vercel, neon, trycloudflare

## Pasos rapidos
1. npm install
2. cp .env.example .env
3. npm run dev

## Proveedores
- Render: crea un Web Service y apunta al repositorio. `render.yaml` ya viene preparado.
- Vercel: importa el repo y despliega. `vercel.json` enruta todo a `api/index.js`.
- Neon: crea DB PostgreSQL, copia `DATABASE_URL` y ejecuta `db/schema.sql`.
- TryCloudflare: ejecuta `npm run dev` y luego `npm run tunnel`.
