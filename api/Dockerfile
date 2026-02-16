# When the target is development, the we build stage 1 and 5
# When the target is deployment, the we build stage 1, 2, 3 and 4

# ===============================
# Stage 1: Dependencies
# ===============================
FROM node:23-alpine3.21 AS dependencies
RUN apk add -U tzdata openssl

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY ./prisma prisma

# Install all dependencies (including dev dependencies for building)
RUN npm ci --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# ===============================
# Stage 2: Build
# ===============================
FROM dependencies AS build
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN echo "Verifying source files..." && \
    test -f src/main.ts || (echo "ERROR: src/main.ts not found!" && exit 1) && \
    echo "Starting build..." && \
    npm run build || (echo "ERROR: Build command failed!" && exit 1) && \
    echo "Build command completed. Checking dist directory..." && \
    (test -d dist && echo "✓ dist directory exists" || (echo "ERROR: dist directory does not exist!" && exit 1)) && \
    echo "Contents of dist:" && \
    (ls -la dist/ || echo "Cannot list dist contents") && \
    echo "Looking for main entry point..." && \
    (test -f dist/main.js && echo "✓ dist/main.js found" || \
     test -f dist/main && echo "✓ dist/main found (no extension)" || \
     (echo "ERROR: dist/main.js not found!" && \
      echo "Contents of dist:" && ls -la dist/ && \
      echo "Searching for main files:" && \
      find dist -name "main*" -type f 2>/dev/null | head -10 || echo "No main files found" && \
      exit 1))

# ===============================
# Stage 3: Deployment dependencies (for staging, pre-prod, prod)
# ===============================
FROM node:23-alpine3.21 AS deployment-deps
RUN apk add -U tzdata openssl

WORKDIR /usr/src/app

# System packages required for timezone data, TLS tooling and native npm deps
# TZ will be set via environment variables at runtime
RUN apk add --no-cache tzdata openssl python3 make g++ curl

# Install node modules before copying the rest of the source to keep cache hits
COPY package*.json ./
COPY ./prisma prisma

# Install only production dependencies
RUN npm ci  --legacy-peer-deps --only=production 

# Generate Prisma client (needed for runtime)
RUN npx prisma generate --schema=./prisma/schema.prisma

# ===============================
# Stage 4: Deployment (for staging, pre-prod, prod deployments)
# ===============================
FROM deployment-deps AS deployment 
WORKDIR /usr/src/app

# Copy built application from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma

# Verify that dist/main.js exists
RUN (test -f dist/main.js || test -f dist/main) || \
    (echo "ERROR: dist/main.js not found after copy!" && echo "Contents of dist:" && ls -la dist/ && echo "Searching for main files:" && find dist -name "main*" -type f 2>/dev/null || echo "No main files found" && exit 1)

# Verify that dist/prisma/seed.js exists (for seeding in production)
RUN (test -f dist/prisma/seed.js || echo "WARNING: dist/prisma/seed.js not found - seeding may not work in production")

ENV NODE_OPTIONS=--max-old-space-size=4096
# NODE_ENV is set via environment variables in docker-compose.yml
# This allows different values for SIT, UAT, staging, pre-prod, prod

# Use dist/main.js as that's where NestJS builds it (according to package.json start:prod)
CMD ["node", "dist/main.js"]

# ===============================
# Stage 5: Development (for local dev with bind mounts via override)
# ===============================
FROM dependencies AS development
WORKDIR /usr/src/app

# Install curl for healthchecks
RUN apk add --no-cache curl

ENV NODE_OPTIONS=--max-old-space-size=4096
# NODE_ENV is set via environment variables in docker-compose.yml or override file

CMD ["npm", "run", "start:dev"]
