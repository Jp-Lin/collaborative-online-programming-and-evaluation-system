#!/bin/bash
fuser -k 3000/tcp
fuser -k 5000/tcp
fuser -k 5001/tcp
fuser -k 5002/tcp

service redis_6379 start
service nginx start

cd ./server
npm install
nodemon server.js &
cd ../client
npm install
ng build --watch &
cd ../executor
pip install -r requirements.txt
python executor_server.py 5000 &
python executor_server.py 5001 &
python executor_server.py 5002 &

echo "=================================================="
read -n 1 -s -r -p  "PRESS ANY KEY TO TERMINATE PROCESSES." PRESSKEY

fuser -k 3000/tcp
fuser -k 5000/tcp
fuser -k 5001/tcp
fuser -k 5002/tcp

service redis_6379 stop
service nginx stop