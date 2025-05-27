FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3941

CMD [ "npm", "start" ]