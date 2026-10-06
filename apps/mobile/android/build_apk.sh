#!/usr/bin/env bash
# ==============================================================================
# AMar Fe - Script de Automatización de Compilación Release APK Android
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "========================================================"
echo "🌸 AMar Fe Mobile - Compilador Automatizado Release APK"
echo "========================================================"

# Configuración de Entorno Android y JDK
export JAVA_HOME="${JAVA_HOME:-/media/eramirez/home_deb12/eramirez/android-studio/jbr}"
export ANDROID_HOME="${ANDROID_HOME:-/media/eramirez/home_deb12/eramirez/Android/Sdk}"
export ANDROID_SDK_ROOT="${ANDROID_HOME}"
export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/platform-tools:${PATH}"

GRADLE_BIN="/media/eramirez/home_deb12/eramirez/.gradle/wrapper/dists/gradle-8.7-all/aan3ydargesu18aqyqjwhr3pc/gradle-8.7/bin/gradle"

if [ ! -x "${GRADLE_BIN}" ]; then
  GRADLE_BIN="$(which gradle || true)"
fi

echo "==> Verificando dependencias de compilación:"
echo "    JAVA_HOME:    ${JAVA_HOME}"
echo "    ANDROID_HOME: ${ANDROID_HOME}"
echo "    GRADLE:       ${GRADLE_BIN}"

if [ ! -d "${ANDROID_HOME}" ]; then
  echo "❌ Error: No se localizó el Android SDK en ${ANDROID_HOME}"
  exit 1
fi

if [ ! -x "${JAVA_HOME}/bin/java" ]; then
  echo "❌ Error: No se localizó el JDK en ${JAVA_HOME}"
  exit 1
fi

echo "==> Iniciando compilación Gradle (assembleRelease)..."
"${GRADLE_BIN}" assembleRelease --no-daemon

APK_OUTPUT="${SCRIPT_DIR}/app/build/outputs/apk/release"
echo "========================================================"
echo "✅ Compilación Release APK completada con éxito!"
echo "📁 Directorio de salida: ${APK_OUTPUT}"
echo "========================================================"
ls -lh "${APK_OUTPUT}"/*.apk 2>/dev/null || true
