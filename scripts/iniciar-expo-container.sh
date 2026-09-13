#!/usr/bin/env sh

set -eu

npm ci
npx expo start --tunnel --port 8081 &
PROCESSO_EXPO="$!"

encerrar_expo() {
  kill -TERM "$PROCESSO_EXPO" 2>/dev/null || true
  wait "$PROCESSO_EXPO"
}

trap encerrar_expo INT TERM

while kill -0 "$PROCESSO_EXPO" 2>/dev/null; do
  URL_TUNEL="$(node -e "fetch('http://127.0.0.1:4040/api/tunnels').then((resposta) => resposta.json()).then((dados) => { const tunel = dados.tunnels.find((item) => item.proto === 'https'); if (tunel) process.stdout.write(tunel.public_url); }).catch(() => {})" 2>/dev/null || true)"

  if [ -n "$URL_TUNEL" ]; then
    echo "Expo Go: exp://${URL_TUNEL#https://}"
    break
  fi

  sleep 1
done

wait "$PROCESSO_EXPO"
