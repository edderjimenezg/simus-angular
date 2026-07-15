#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.local.yml"

stop_service_on_port() {
  local name="$1"
  local port="$2"
  local pids

  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    echo "[pnmc] $name ya estaba apagado."
    return
  fi

  echo "[pnmc] Deteniendo $name (PID: $pids)..."
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
}

echo "[pnmc] Deteniendo servicios locales..."
stop_service_on_port "frontend Angular" 4200
stop_service_on_port "backend API" 8080

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "[pnmc] Deteniendo base de datos Docker (se conservan los datos)..."
  docker compose -f "$COMPOSE_FILE" stop
else
  echo "[pnmc] Docker no esta disponible; no se pudo detener la base desde este script."
fi

echo "[pnmc] Proyecto local apagado."
