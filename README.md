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
npm ci
cp .env.example .env
npm start -- --tunnel
```

Abra o QR no Expo Go. No iPhone físico, a CLI e o Expo Go precisam estar
conectados à mesma conta Expo (`npx expo login`). Quem iniciar o Metro no
próprio computador pode usar sua conta pessoal nos dois lados. O túnel permite
acesso fora da rede local.

Configure `EXPO_PUBLIC_API_URL` no `.env`: `http://10.0.2.2:5138` para o
emulador Android, ou `http://IP_DA_MAQUINA:5138` para um aparelho na mesma
rede. Para teste fora da rede, configure o endereço HTTPS público da API. O
túnel do Expo publica o Metro, mas não a API. Reinicie o Metro ao mudar a
variável. Para testar cadastro e login, inicie PostgreSQL, configure os User
Secrets e aplique as migrations conforme a seção 6 de `icarus-platform/PROJETO.md`.

## Autenticação

- Cadastro envia os campos para `POST /api/auth/cadastro` e faz login antes
  do onboarding. Se o login posterior falhar, a conta permanece criada e o
  aplicativo retorna à tela de entrada, sem repetir o cadastro.
- Login usa `POST /api/auth/login`. Tokens ficam no armazenamento seguro do
  dispositivo por meio do `expo-secure-store`; a senha não é persistida. A sessão
  é conferida em `GET /api/auth/me` na
  abertura e renovada por `POST /api/auth/refresh`, inclusive ao retornar ao app.
- A aba Perfil consulta o cadastro real (somente leitura) e permite salvar ou limpar
  situação e horas semanais de estudo/trabalho. O fuso IANA do dispositivo é
  sincronizado ao abrir a sessão e ao retornar ao aplicativo.
- Sair da conta exige confirmação. Confirmar remove a sessão local e tenta
  revogar a renovação no servidor; a saída local funciona inclusive sem rede.
- Missões, campanhas, épicos e onboarding usam a API autenticada; os contextos
  mantêm o estado de apresentação e são limpos ao trocar de conta. O diário
  permanece local, sem endpoint de persistência nesta entrega.

Validação: `npm test -- --runInBand --watch=false` e `npm run lint`.

## Loja de recompensas

A aba Loja consulta a API autenticada e permite criar, editar e excluir
recompensas disponíveis, resgatar, desfazer resgate e confirmar o uso
irreversível. Saldo e estado vêm do servidor. Proteções de sequência têm preço
visível e limite de três unidades; o consumo automático depende da rotina
diária, ainda não implementada. A loja oferece atualização por gesto e ao
receber foco, além de estados de carregamento, vazio e erro.

Contrato e limites: [`05-contrato-da-loja.md`](../icarus-context/docs/implementation-design/platform/05-contrato-da-loja.md).

## Meu progresso e minha semana

Na tela de Missões, **Meu progresso** abre registros pessoais por período e
**Contexto para sua jornada**, com referências Gold reais da edição 2024.
**Entender os dados** mostra recorte, denominador, limites e links das fontes.
As quatro abas existentes são preservadas. Componentes novos usam os tokens
Inter/roxo existentes; são implementação RN proposta, sem novos frames Figma.

**Ver minha semana** solicita ou recupera o relatório persistido; consultas
seguintes reutilizam o trabalho e apenas acompanham o processamento. Nova
geração após falha exige ação explícita. Sem registros suficientes, a tela
informa a ausência, sem relatório simulado. Fonte pública e síntese pessoal
ficam identificadas separadamente. Pontos não incrementam campanhas medidas
em módulos, reais ou outra unidade.

A taxa e a comparação conjunta dependem do histórico de ocorrências previstas;
cenários dependem de medições RF-03.5. Esses dados aparecem indisponíveis nesta
fatia. Testes cobrem navegação, HTTP, estados, sessão expirada, troca de conta,
metadados e unidades. A validação visual das novas telas em aparelho,
TalkBack/VoiceOver e iPhone permanece pendente.
