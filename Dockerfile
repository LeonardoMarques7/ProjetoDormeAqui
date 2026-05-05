FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY front-end/package*.json ./front-end/
RUN npm install --prefix front-end --legacy-peer-deps

COPY front-end ./front-end
RUN npm run build --prefix front-end

FROM node:22-alpine AS backend-deps

WORKDIR /app

COPY package*.json ./
COPY back-end/package*.json ./back-end/
RUN npm install --prefix back-end --omit=dev --legacy-peer-deps

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY back-end ./back-end
COPY --from=backend-deps /app/back-end/node_modules ./back-end/node_modules
COPY --from=frontend-build /app/front-end/dist ./front-end/dist

EXPOSE 3000

WORKDIR /app/back-end
CMD ["npm", "start"]
