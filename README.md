# Icarus Mobile

Aplicativo React Native pelo qual o usuário organiza objetivos, acompanha
missões, utiliza recompensas e consulta seu progresso.

## Execução local

Esta branch usa Expo SDK 57 e `expo-secure-store`, compatíveis com o
[Expo Go da App Store no iPhone](https://expo.dev/changelog/expo-go-57-login).
O diário aceita texto; o ditado por voz está na branch
`feature/recursos-nativos`, que exige uma build própria.
Mudanças comuns entram em `development` e depois são incorporadas à branch
nativa, mantendo a mesma base de telas e fluxos.

```bash
npm install
cp .env.example .env
npm start -- --tunnel
```

Abra o QR no Expo Go. No iPhone físico, a CLI e o Expo Go precisam estar
conectados à mesma conta Expo (`npx expo login`); a outra pessoa deve entrar
nessa conta no Expo Go. O túnel permite acesso fora da rede local.

Configure `EXPO_PUBLIC_API_URL` no `.env`: `http://10.0.2.2:5138` para o
emulador Android, ou `http://IP_DA_MAQUINA:5138` para um aparelho na mesma
rede. Para teste fora da rede, configure o endereço HTTPS público da API. O
túnel do Expo publica o Metro, mas não a API. Reinicie o Metro ao mudar a
variável. Consulte o README do `icarus-platform` para iniciar a API.

## Autenticação

- Cadastro envia os campos para `POST /api/auth/cadastro` e faz login antes
  do onboarding. Se o login posterior falhar, a conta permanece criada e o
  aplicativo retorna à tela de entrada, sem repetir o cadastro.
- Login usa `POST /api/auth/login`. Tokens ficam no armazenamento seguro do
  dispositivo por meio do `expo-secure-store`; a senha não é persistida. A sessão
  é conferida em `GET /api/auth/me` na
  abertura e renovada por `POST /api/auth/refresh`, inclusive ao retornar ao app.
- A aba Perfil oferece a saída: remove a sessão local e tenta revogar a
  renovação no servidor. Sem rede, a saída local continua funcionando.
- Missões, campanhas, épicos, onboarding e diário ainda são dados em memória:
  autenticar não os persiste na API; sair ou trocar de conta limpa esses estados.

Validação: `npm test -- --runInBand --watch=false` e `npm run lint`.
