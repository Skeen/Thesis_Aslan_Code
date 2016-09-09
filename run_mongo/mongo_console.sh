#!/bin/sh

docker run -it --link js-spy-db:mongo --rm mongo:3 sh -c 'exec mongo "$MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/test"'
