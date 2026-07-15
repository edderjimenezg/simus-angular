#!/usr/bin/env bash
set -u

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

clear
echo "==============================================="
echo "       DETENIENDO PLATAFORMA PNMC LOCAL"
echo "==============================================="
echo

"$DIR/scripts/dev-down.sh"
STATUS=$?

echo
if [[ $STATUS -eq 0 ]]; then
  echo "Los servicios locales se detuvieron correctamente."
else
  echo "El apagado finalizo con errores (codigo: $STATUS)."
fi

echo
read -r -n 1 -s -p "Presiona cualquier tecla para cerrar esta ventana..."
echo
exit "$STATUS"
