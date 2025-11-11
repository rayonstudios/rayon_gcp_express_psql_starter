FROM node:20-alpine

# Accept build arguments
ARG NODE_ENV
ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_PROJECT_ID

# Set environment variables from build arguments
ENV NODE_ENV=$NODE_ENV
ENV INFISICAL_CLIENT_ID=$INFISICAL_CLIENT_ID
ENV INFISICAL_CLIENT_SECRET=$INFISICAL_CLIENT_SECRET
ENV INFISICAL_PROJECT_ID=$INFISICAL_PROJECT_ID

# Set working directory
WORKDIR /app

# Install system dependencies for native modules and runtime dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl

# Create non-root user for security
RUN addgroup -g 1001 nodejs && \
    adduser -D -u 1001 -G nodejs nodejs && \
    chown -R nodejs:nodejs /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --include=dev --ignore-scripts

# Copy config files needed for build
COPY tsconfig.json ./
COPY tsoa.json ./

# Copy source code
COPY . .

# Fetch environment variables from Infisical
RUN npm run env:fetch

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size (only after build is complete)
RUN npm prune --production

# Rebuild native modules for production to ensure they work correctly
RUN npm rebuild bcrypt --build-from-source

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/server.js"]
