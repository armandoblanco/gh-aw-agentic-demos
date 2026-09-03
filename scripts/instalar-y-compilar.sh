#!/usr/bin/env bash
# Instala la extensión gh-aw y compila los workflows de demo (.md -> .lock.yml)
set -euo pipefail

echo "==> Verificando GitHub CLI..."
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ No se encontró 'gh' (GitHub CLI). Instálalo desde https://cli.github.com y vuelve a intentar."
  exit 1
fi

echo "==> Verificando sesión activa de gh..."
gh auth status || {
  echo "❌ No hay sesión activa. Ejecuta: gh auth login --scopes repo,workflow"
  exit 1
}

echo "==> Instalando la extensión gh-aw (si no está instalada)..."
if ! gh extension list | grep -q "github/gh-aw"; then
  gh extension install github/gh-aw || {
    echo "⚠️  La instalación vía 'gh extension install' falló (por ejemplo por SSO/SAML de la organización)."
    echo "    Alternativa (instalador standalone):"
    echo "    curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash"
    exit 1
  }
else
  echo "   La extensión ya está instalada."
fi

echo "==> Compilando los workflows (.md -> .lock.yml)..."
gh aw compile

echo ""
echo "✅ Listo. Revisa los archivos .lock.yml generados en .github/workflows/,"
echo "   haz commit y push, y confirma que 'GitHub Actions' esté habilitado en el repo."
