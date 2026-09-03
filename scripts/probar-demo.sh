#!/usr/bin/env bash
# Dispara manualmente cada una de las 3 demos para probarlas rápido.
# Uso: ./scripts/probar-demo.sh 1|2|3
set -euo pipefail

DEMO="${1:-}"

if [[ -z "$DEMO" ]]; then
  echo "Uso: $0 [1|2|3]"
  echo ""
  echo "  1  Reporte Diario del Repositorio (workflow_dispatch)"
  echo "  2  Bot de Triage de Issues (crea un issue de prueba)"
  echo "  3  Investigador de Fallos de CI (fuerza un fallo en CI)"
  exit 1
fi

case "$DEMO" in
  1)
    echo "==> Ejecutando Demo 1: Reporte Diario del Repositorio..."
    gh workflow run "demo-1-reporte-diario.lock.yml"
    echo "Revisa el progreso con: gh run watch"
    ;;
  2)
    echo "==> Creando un issue de prueba para disparar la Demo 2 (Triage)..."
    gh issue create \
      --title "Bug de prueba: el botón de guardar no responde" \
      --body $'Al hacer clic en "Guardar" en la pantalla de perfil no pasa nada.\n\nPasos para reproducir:\n1. Ir a Perfil\n2. Editar el nombre\n3. Hacer clic en Guardar\n\nEsperado: se guarda el cambio.\nActual: no ocurre nada y no hay error visible en consola.'
    echo "Revisa el progreso con: gh run watch"
    ;;
  3)
    echo "==> Forzando un fallo en el workflow CI para disparar la Demo 3 (CI Doctor)..."
    gh workflow run "ci.yml" -f force_fail=true
    echo "Espera ~1-2 min a que 'CI' termine en fallo; luego se disparará"
    echo "automáticamente 'demo-3-ci-doctor'. Revisa con: gh run list"
    ;;
  *)
    echo "Opción inválida: $DEMO (usa 1, 2 o 3)"
    exit 1
    ;;
esac
