FROM node:18-alpine

WORKDIR /app

# Install the parent app deps so chat-service can reuse the generated Prisma client.
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install

COPY chat-service/package.json chat-service/yarn.lock* ./chat-service/

WORKDIR /app/chat-service

RUN yarn install

COPY chat-service/ .

RUN yarn build

EXPOSE 3001

CMD ["node", "dist/index.js"]
