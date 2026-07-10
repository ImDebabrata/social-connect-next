FROM node:18-alpine

WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install

COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD yarn dev