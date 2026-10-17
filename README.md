# Icarus Mobile

Aplicativo React Native pelo qual o usuário organiza objetivos, acompanha
missões, utiliza recompensas e consulta seu progresso.

## Execução local

O armazenamento de sessão (`react-native-keychain`) e o reconhecimento de voz
exigem um _development build_. Recompile após instalar dependências nativas.
O [Expo Go da App Store](https://expo.dev/changelog/expo-go-57-login)
aceita o SDK 57, mas não inclui `react-native-keychain` nem o módulo de
reconhecimento de voz usados nesta branch.

### Android

```bash
npm install
cp .env.example .env
npm run android
```

Depois da primeira compilação, use `npm start` para iniciar o Metro com o
cliente de desenvolvimento.

### iPhone (iOS 16.4 ou superior)

O projeto inclui `expo-dev-client` e o perfil `development` em `eas.json`. Em
Linux, a compilação iOS ocorre na nuvem pelo EAS. São necessários uma conta
Expo, credenciais do Apple Developer Program para assinar a build e o iPhone
registrado no perfil de distribuição interna. Ative o Modo de Desenvolvedor no
iPhone.

```bash
npm install
cp .env.example .env
npx eas-cli login
npx eas-cli device:create
npx eas-cli build --platform ios --profile development
```

Instale a build pelo link/QR de instalação do EAS. Só depois use `npm start` no
computador e abra o QR do Metro no cliente de desenvolvimento instalado. O QR
do Metro usa o esquema `icarus://` e não abre em um iPhone sem a build. Em um
Mac com Xcode, `npm run ios -- --device` também compila e instala localmente.

Na mesma rede, o iPhone pode acessar a API local. Para testes fora dela, execute
o Metro com `npx expo start --dev-client --tunnel` e publique a API em um
endereço HTTPS acessível ao aparelho. O túnel do Expo transporta apenas o Metro;
configure `EXPO_PUBLIC_API_URL` com o endereço HTTPS da API e reinicie o Metro.

### Endereço da API

Configure `EXPO_PUBLIC_API_URL` no `.env`: `http://10.0.2.2:5138` para o
emulador Android, ou `http://IP_DA_MAQUINA:5138` para Android físico ou iPhone
na mesma rede. A API precisa estar acessível nesse endereço; para teste em
aparelho, use o perfil `rede-local` descrito no README do `icarus-platform`. Reinicie o
Metro ao mudar a variável. Use HTTP apenas no desenvolvimento local; ambientes
publicados usam HTTPS.

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
