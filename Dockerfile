FROM mcr.microsoft.com/playwright:v1.65.1-noble
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY admin/package*.json ./admin/
RUN npm ci && npm --prefix client ci && npm --prefix admin ci

COPY index.html *.config.js ./
COPY src ./src
COPY client ./client
COPY admin ./admin
COPY supabase/schema.sql ./supabase/schema.sql
COPY tests ./tests

ENV CI=1
CMD ["sh", "-ec", "npm run test:unit && npm run test:db && npm run test:e2e && npm run build && npm run build:client && npm run build:admin"]
