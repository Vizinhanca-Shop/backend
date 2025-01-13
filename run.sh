#!/bin/bash

COMPOSE_FILE="compose-production.yml"
CONTAINER_NAME="docker_api.centerlight.com.br"

# Stop and remove the container if it's running
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Build the Docker image
docker compose -f $COMPOSE_FILE --env-file .env build

# Start the service
docker compose -f $COMPOSE_FILE --env-file .env up -d --force-recreate
