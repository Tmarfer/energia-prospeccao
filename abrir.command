#!/bin/bash
cd "$(dirname "$0")"
npx serve project -p 7432 --no-clipboard &
SERVER_PID=$!
sleep 2
open "http://localhost:7432/Apresentacao%20Regulatoria.html"
wait $SERVER_PID
