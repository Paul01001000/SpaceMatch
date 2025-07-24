# Backend Dockerfile

# Stage 1: Build
FROM node:18 AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-slim AS production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install --only=production --legacy-peer-deps
COPY --from=build /usr/src/app/dist ./dist
# Copy the spaceImages directory for demo data
COPY --from=build /usr/src/app/src/models/spaceImages ./dist/models/spaceImages
EXPOSE 3000
CMD ["node", "dist/index.js"]
# docker build -t backend-spacematch .
#docker run --env-file .env -p 3000:3000 backend-spacematch