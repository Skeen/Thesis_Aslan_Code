#!/bin/sh

docker run --name js-spy-db -v $PWD/database:/data/db -p 27017:27017 -d mongo:3
