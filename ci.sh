#!/bin/bash -ex

if [[ "x$PHASE" != "x" ]]; then
  if [[ "$PHASE" == "PRE_DEPLOY_BUILD" ]]; then
    echo "Build Docker image and push to docker hub!"
    ./build.sh
    exit 0
  else
    echo "**** Error PHASE value is unexpected"
    exit 1
  fi
else
  echo "****** Error Phase is not set"
fi
