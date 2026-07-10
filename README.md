# KITech Software – Webseite

Corporate Website von [KITech Software UG](https://kitech-software.de) (haftungsbeschränkt).

## Stack

- Vite + React 18 + TypeScript
- React Router v6 (Client-Side Rendering, kein Next.js)
- Tailwind CSS + shadcn/ui
- Framer Motion

## Entwicklung

```sh
npm install
npm run dev        # Dev-Server auf Port 8080
npm run build      # Production Build
npm run lint       # ESLint
npm test           # Vitest
npm run preview    # Vorschau des Production Builds
```

## Deployment

Self-hosted über [Coolify](https://coolify.io) (Dockerfile-Build, siehe `Dockerfile` +
`deploy/nginx.conf`). Details und offene manuelle Schritte: [deploy/COOLIFY.md](deploy/COOLIFY.md).

Weitere Projektdokumentation: [CLAUDE.md](CLAUDE.md).
