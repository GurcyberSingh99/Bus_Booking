FROM node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8
LABEL org.opencontainers.image.source="https://github.com/GurcyberSingh99/Bus_Booking"
LABEL org.opencontainers.image.description="Bus trip and seat reservation API"
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate && chown -R node:node /app
COPY --chown=node:node src ./src
USER node
EXPOSE 5000
CMD ["npm", "start"]
