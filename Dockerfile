# build
FROM node:18.2-alpine3.15 AS build

## shared
WORKDIR /build/shared
COPY ./shared/package*.json ./
RUN npm ci
COPY ./shared ./
RUN npm run build && npm prune --production

## frontend
WORKDIR /build/frontend
COPY ./smarthome-frontend/package*.json ./
RUN npm ci
COPY ./smarthome-frontend ./
RUN npm run build && npm prune --production

## backend
WORKDIR /build/backend
COPY ./smarthome-backend/package*.json ./
RUN npm ci
COPY ./smarthome-backend ./
RUN npm run build && npm prune --production

# run
FROM node:18.2-alpine3.15 AS runtime

ENV NODE_ENV=production

## shared
WORKDIR /app/shared
COPY --from=build /build/shared/dist ./dist
COPY --from=build /build/shared/node_modules ./node_modules

## frontend
WORKDIR /app/frontend
COPY --from=build /build/frontend/dist ./dist

## backend
WORKDIR /app/backend
COPY --from=build /build/backend/dist ./dist
COPY --from=build /build/backend/node_modules ./node_modules

CMD ["node", "./dist/main.js"]
