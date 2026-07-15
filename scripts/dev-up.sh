#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v docker >/dev/null 2>&1; then
  echo "[pnmc] Docker CLI no esta disponible. Instala o abre Docker Desktop."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  if [[ "$(uname)" == "Darwin" ]] && command -v open >/dev/null 2>&1; then
    echo "[pnmc] Iniciando Docker Desktop..."
    open -a Docker
    echo "[pnmc] Esperando a que Docker Desktop este listo..."
    for _ in {1..90}; do
      if docker info >/dev/null 2>&1; then
        break
      fi
      sleep 2
    done
  fi
fi

if ! docker info >/dev/null 2>&1; then
  echo "[pnmc] Docker Desktop no esta listo. Abrelo y vuelve a ejecutar el script."
  exit 1
fi

echo "[pnmc] Preparando base de datos local..."
"$ROOT_DIR/scripts/local-db-up.sh"

echo "[pnmc] Iniciando backend (.NET) en nueva terminal..."
osascript <<APPLESCRIPT
 tell application "Terminal"
   do script "cd '$ROOT_DIR' && ./scripts/api-local.sh"
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
