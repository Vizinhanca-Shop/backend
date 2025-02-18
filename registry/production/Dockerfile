FROM node:22-alpine

WORKDIR /usr/src/app

COPY . .

RUN rm -rf node_modules
RUN rm -rf dist
RUN apk add openssl

RUN npm install -g yarn --force
RUN yarn install

RUN chmod +x ./scripts/generate-jwk.sh
RUN ./scripts/generate-jwk.sh

RUN NODE_OPTIONS="--max-old-space-size=2048" yarn build

EXPOSE 5000
