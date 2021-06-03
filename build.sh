#!/bin/bash -e
docker info
docker build -t streamingtv/anyservice:tms_$GIT_SHA .
docker login -e teamouts002@gmail.com -u $DOCKER_USER -p $DOCKER_PASS
docker push streamingtv/anyservice:tms_$GIT_SHA

echo "Docker Build Finished.."