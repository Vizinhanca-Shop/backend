FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./

COPY ./ ./

RUN yarn install

ARG JWT_REFRESH_SECRET
ENV JWT_REFRESH_SECRET='EyGqyoW9imynr5d4çaK3f9'


RUN chmod +x ./scripts/generate-jwk.sh
RUN ./scripts/generate-jwk.sh