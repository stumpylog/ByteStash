# Build stage for client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install --package-lock-only
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc

# Copy server source and dependencies
WORKDIR /app
COPY server/package.json ./
RUN npm install --production
COPY server/src ./src

# Copy client build
COPY --from=client-build /app/client/build /client/build

# Create output directory
RUN mkdir -p ./data/snippets

# Clean up build dependencies to reduce image size
RUN apk del python3 make g++ gcc

EXPOSE 5000

CMD ["node", "src/app.js"]