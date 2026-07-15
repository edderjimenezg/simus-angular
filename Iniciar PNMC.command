#!/usr/bin/env bash
set -u

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

clear
echo "==============================================="
echo "       INICIANDO PLATAFORMA PNMC LOCAL"
echo "==============================================="
echo

"$DIR/scripts/dev-up.sh"
STATUS=$?

echo
if [[ $STATUS -eq 0 ]]; then
  echo "Proceso de inicio enviado correctamente."
  echo "Frontend: http://127.0.0.1:4200"
  echo "API:      http://localhost:8080/swagger"
else
  echo "El inicio no pudo completarse (codigo: $STATUS)."
fi

echo
read -r -n 1 -s -p "Presiona cualquier tecla para cerrar esta ventana..."
echo
exit "$STATUS"
