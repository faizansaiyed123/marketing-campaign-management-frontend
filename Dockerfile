FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG DEPLOY_TARGET=development
ENV VITE_API_URL=${VITE_API_URL}

RUN if [ "$DEPLOY_TARGET" = "production" ]; then \
      npm run build:production; \
    else \
      test -n "$VITE_API_URL" && npm run build; \
    fi

# Serve the built static assets with an unprivileged web server, not Vite preview.
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

