FROM node:22-alpine as development

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . . 

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
