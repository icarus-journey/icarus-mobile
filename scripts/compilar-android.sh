#!/usr/bin/env bash
set -euo pipefail

RAIZ_MOBILE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ_MOBILE"

if [[ -z "${ANDROID_HOME:-}" && -d "$HOME/Android/Sdk" ]]; then
  export ANDROID_HOME="$HOME/Android/Sdk"
fi

if [[ ! -f android/gradlew ]]; then
  npx expo prebuild --platform android --no-install
fi

cd android
COMANDO_COMPILACAO=(./gradlew :app:assembleDebug --no-daemon --max-workers=1
  --no-parallel --configure-on-demand --build-cache
  "-PreactNativeArchitectures=${ICARUS_ARQUITETURA_ANDROID:-arm64-v8a}"
  "-PreactNativeDevServerPort=${ICARUS_PORTA_EXPO:-8082}"
  -Pkotlin.compiler.execution.strategy=in-process
  --init-script "$RAIZ_MOBILE/scripts/limitar-compilacao.gradle")

if command -v systemd-run >/dev/null && systemctl --user show-environment >/dev/null 2>&1; then
  systemd-run --user --scope -p MemoryHigh=4G -p MemoryMax=6G -p CPUQuota=150% \
    "${COMANDO_COMPILACAO[@]}"
else
  "${COMANDO_COMPILACAO[@]}"
fi

printf '\nAPK gerado em android/app/build/outputs/apk/debug/app-debug.apk\n'
