#!/bin/bash
BASE_PATH=`dirname $0`

kill $(cat $BASE_PATH/server.pid)
kill $(cat $BASE_PATH/worker.pid)

rm $BASE_PATH/server.pid
rm $BASE_PATH/worker.pid
