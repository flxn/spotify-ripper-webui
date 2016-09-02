#!/bin/bash
BASE_PATH=$(dirname $0)

mkdir -p $BASE_PATH/logs

node $BASE_PATH/bin/www >> $BASE_PATH/logs/server.log 2>> $BASE_PATH/logs/server_error.log &
echo $! > $BASE_PATH/server.pid

node $BASE_PATH/worker.js >> $BASE_PATH/logs/worker.log 2>> $BASE_PATH/logs/worker_error.log &
echo $! > $BASE_PATH/worker.pid
