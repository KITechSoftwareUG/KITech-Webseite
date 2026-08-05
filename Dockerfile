# syntax=docker/dockerfile:1

# Next.js App Router mit Server-Rendering. Anders als frueher (statische Vite-SPA
# hinter nginx) laeuft hier zur Laufzeit ein Node-Server - genau deshalb liefert
# die Seite fertiges HTML aus.
#
# `output: "standalone"` in next.config.ts erzeugt einen minimalen Server-Ordner,
# der nur die tatsaechlich benoetigten node_modules enthaelt.

# ---- Stage 1: Dependencies ------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: Build -------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: Runtime -----------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Nicht als root laufen
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# public/ und die statischen Assets muessen neben den standalone-Server gelegt
# werden - Next kopiert sie nicht selbst dorthin.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
