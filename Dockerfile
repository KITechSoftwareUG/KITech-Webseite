# syntax=docker/dockerfile:1

# ---- Stage 1: Build ----------------------------------------------------
# Statische Vite/React-SPA - wir bauen nur, es gibt keinen Node-Server zur
# Laufzeit.
#
# Hinweis Paketmanager: Das Projekt nutzt primaer Bun (bun.lockb vorhanden),
# das mitgelieferte bun.lockb ist jedoch nicht mehr synchron mit package.json
# ("bun install --frozen-lockfile" schlaegt mit "lockfile had changes" fehl).
# Bis das Lockfile aktualisiert/committed wird, verwenden wir daher npm ci
# mit dem vorhandenen, aktuellen package-lock.json (Fallback lt. Vorgabe).
FROM node:20-alpine AS build

WORKDIR /app

# Lockfile + Manifest zuerst kopieren, damit der Dependency-Layer gecacht wird
COPY package.json package-lock.json ./
RUN npm ci

# Restlichen Quellcode kopieren und Production-Build erzeugen
COPY . .
RUN npm run build

# ---- Stage 2: Serve ------------------------------------------------------
# Statische Auslieferung des dist/-Outputs ueber nginx.
FROM nginx:alpine AS serve

# Eigene Server-Konfiguration (SPA-Fallback, Security-Header, Gzip)
COPY deploy/security-headers.conf /etc/nginx/conf.d/security-headers.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Gebauten Output aus Stage 1 uebernehmen
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
