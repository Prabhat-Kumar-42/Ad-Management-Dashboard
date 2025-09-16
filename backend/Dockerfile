# ----------- Stage 1: Build -------------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# ----------- Stage 2: Production ----------
FROM node:24-alpine AS production

WORKDIR /app

COPY package*.json ./

# Install only production dependencies (omitting devDependencies)
RUN npm install --omit=dev
# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start"]
