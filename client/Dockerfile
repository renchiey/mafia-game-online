FROM node:22-alpine as development

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . . 

ENV VITE_URL=http://localhost:3000/

ENV VITE_WS_URL=ws://localhost:8080/

RUN npm run build

FROM node:22-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --only=production

RUN npm i -g serve

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist"]
