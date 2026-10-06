#!/usr/bin/env bash
# ==============================================================================
# AMar Fe - Script de Automatización de Compilación Release AAB (Google Play)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "=========================================================="
echo "🌸 AMar Fe Mobile - Compilador Release AAB (Google Play)"
echo "=========================================================="

export JAVA_HOME="${JAVA_HOME:-/media/eramirez/home_deb12/eramirez/android-studio/jbr}"
export ANDROID_HOME="${ANDROID_HOME:-/media/eramirez/home_deb12/eramirez/Android/Sdk}"
export ANDROID_SDK_ROOT="${ANDROID_HOME}"
export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/platform-tools:${PATH}"

GRADLE_BIN="/media/eramirez/home_deb12/eramirez/.gradle/wrapper/dists/gradle-8.7-all/aan3ydargesu18aqyqjwhr3pc/gradle-8.7/bin/gradle"

if [ ! -x "${GRADLE_BIN}" ]; then
  GRADLE_BIN="$(which gradle || true)"
fi

echo "==> Verificando dependencias:"
echo "    JAVA_HOME:    ${JAVA_HOME}"
echo "    ANDROID_HOME: ${ANDROID_HOME}"
echo "    GRADLE:       ${GRADLE_BIN}"

echo "==> Iniciando compilación de Bundle (bundleRelease)..."
"${GRADLE_BIN}" bundleRelease --no-daemon

AAB_OUTPUT="${SCRIPT_DIR}/app/build/outputs/bundle/release"
echo "=========================================================="
echo "✅ Compilación Release AAB completada con éxito!"
echo "📁 Directorio de salida: ${AAB_OUTPUT}"
echo "=========================================================="
ls -lh "${AAB_OUTPUT}"/*.aab 2>/dev/null || true
