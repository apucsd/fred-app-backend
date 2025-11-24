###############################################
# 1) Builder Stage
###############################################
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy prisma folder BEFORE npm install
COPY prisma ./prisma

# Install dependencies (including devDeps for prisma CLI)
RUN npm install

# Copy full source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript -> /app/dist
RUN npm run build


###############################################
# 2) Runner Stage
###############################################
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production deps
# Use --ignore-scripts to prevent 'prisma generate' from running (since prisma CLI is a devDep)
RUN npm install --omit=dev --ignore-scripts

# Copy built artifacts and generated prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy prisma schema just in case it's needed at runtime
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
