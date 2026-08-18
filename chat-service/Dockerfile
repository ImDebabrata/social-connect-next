FROM node:18-alpine

WORKDIR /app

# Copy root package files if needed, or just chat-service ones?
# Since we will set context to root, we can copy what we need.

# Copy prisma schema from root
COPY prisma ./prisma

# Copy chat-service files
COPY chat-service/package.json chat-service/yarn.lock* ./chat-service/

WORKDIR /app/chat-service

# Install dependencies
RUN yarn install

# Copy source code
COPY chat-service/ .

# Generate prisma client and compile TypeScript for production
RUN npx prisma generate
RUN yarn build

EXPOSE 3001

CMD ["node", "dist/index.js"]
