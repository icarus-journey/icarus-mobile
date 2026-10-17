# Icarus Mobile

Aplicativo React Native pelo qual o usuário organiza objetivos, acompanha
missões, utiliza recompensas e consulta seu progresso.

## Execução local

O armazenamento de sessão (`react-native-keychain`) e o reconhecimento de voz
exigem um _development build_. Recompile após instalar dependências nativas;
o Expo Go não oferece o armazenamento necessário para o login.

```bash
npm install
cp .env.example .env
npm run android
```

Depois da primeira compilação nativa, use `npm start` para iniciar o Metro com
o cliente de desenvolvimento.

Configure `EXPO_PUBLIC_API_URL` no `.env`: `http://10.0.2.2:5138` para o
emulador Android, ou `http://IP_DA_MAQUINA:5138` para um aparelho na mesma
rede. A API precisa estar acessível nesse endereço; consulte o README do
`icarus-platform`. Reinicie o Metro ao mudar a variável. HTTP é permitido
somente no build de desenvolvimento local; ambientes publicados usam HTTPS.

## Autenticação

- Cadastro envia os campos para `POST /api/auth/cadastro` e faz login antes
  do onboarding. Se o login posterior falhar, a conta permanece criada e o
  aplicativo retorna à tela de entrada, sem repetir o cadastro.
- Login usa `POST /api/auth/login`. Tokens ficam no Keychain/Keystore;
  a senha não é persistida. A sessão é conferida em `GET /api/auth/me` na
  abertura e renovada por `POST /api/auth/refresh`, inclusive ao retornar ao app.
- A aba Perfil oferece a saída: remove a sessão local e tenta revogar a
  renovação no servidor. Sem rede, a saída local continua funcionando.
- Missões, campanhas, épicos, onboarding e diário ainda são dados em memória:
  autenticar não os persiste na API; sair ou trocar de conta limpa esses estados.

Validação: `npm test -- --runInBand --watch=false` e `npm run lint`.
