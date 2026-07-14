#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[pnmc] Iniciando backend (.NET) en nueva terminal..."
osascript <<APPLESCRIPT
 tell application "Terminal"
   do script "cd '$ROOT_DIR' && ./scripts/local-db-up.sh && ./scripts/api-local.sh"
   activate
 end tell
APPLESCRIPT

echo "[pnmc] Iniciando frontend Angular en nueva terminal..."
osascript <<APPLESCRIPT
 tell application "Terminal"
   do script "cd '$ROOT_DIR/pnmc-web' && npm start"
   activate
 end tell
APPLESCRIPT

echo "[pnmc] Servicios iniciados"
echo "Frontend: http://127.0.0.1:4200"
echo "API: http://localhost:8080/swagger"
