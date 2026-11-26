# Food Store — Unidad 10

Frontend React + TypeScript con arquitectura por features, autenticación y rutas protegidas.

## Estructura

- `src/features/`: dominios `auth`, `categories`, `products` e `ingredients`; cada uno organiza sus componentes, hooks, tipos y páginas.
- `src/shared/`: API, interceptores y componentes compartidos.
- `src/store/`: tema y notificaciones globales.
- `src/routes/`: router y protección de rutas.

Cada feature exporta su API pública desde `index.ts`. Los hooks encapsulan las consultas y mutaciones con TanStack Query.

## Uso

```bash
pnpm install
pnpm dev
```

Para verificar la compilación: `pnpm build`.
