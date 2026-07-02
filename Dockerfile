# Stage 1: Build the React client
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ARG VITE_COUPLE_NAME
ARG VITE_WEDDING_DATE
ARG VITE_ADMIN_PASSWORD
ENV VITE_API_URL=$VITE_API_URL \
    VITE_COUPLE_NAME=$VITE_COUPLE_NAME \
    VITE_WEDDING_DATE=$VITE_WEDDING_DATE \
    VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci

COPY client/ ./client/
RUN npm run build --workspace=client

# Stage 2: Production server
FROM node:20-alpine AS production
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci --omit=dev

COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server/src/index.js"]