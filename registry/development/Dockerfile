FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./

COPY ./ ./

RUN chmod +x ./scripts/generate-jwk.sh
RUN ./scripts/generate-jwk.sh

RUN yarn install



