FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
RUN npm prune --omit=dev
COPY src ./src
EXPOSE 5000
CMD ["npm", "start"]
