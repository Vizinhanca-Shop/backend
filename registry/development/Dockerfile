FROM node:18-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install -g yarn --force
RUN yarn install
RUN yarn build

