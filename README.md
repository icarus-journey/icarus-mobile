# Icarus Mobile

Aplicativo React Native pelo qual o usuário organiza objetivos, acompanha
missões, utiliza recompensas e consulta seu progresso.

## Execução local

Esta branch usa Expo SDK 57 e `expo-secure-store`. O Expo Go precisa
corresponder ao SDK 57; consulte as [versões do cliente](https://expo.dev/go).
O diário aceita texto no Expo Go; o ditado local também está nesta branch e
exige o cliente de desenvolvimento compilado. `feature/recursos-nativos`
preserva a linha anterior com `react-native-keychain`; a sessão atual continua
usando `expo-secure-store` nos dois modos.
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

## Navegação por abas

Missões, Diário, Loja e Perfil são abas reais, com uma única barra no visual
existente. Trocar de aba preserva a posição e o rascunho do Diário; tocar de
novo em Missões/Loja volta ao início da pilha. Voltar fecha primeiro o detalhe;
na raiz de outra aba, retorna a Missões. Formulários, análises e históricos
continuam sem a barra. Logout remove o histórico privado da navegação.

Usa `@react-navigation/bottom-tabs` 7.21.0, em JavaScript, sobre as dependências
nativas existentes; sem nova build. Consulte o
[mapa de navegação](../icarus-context/docs/implementation-design/frontend/01-navegacao-mobile.md).
MVP-23 verificado com 519 testes/73 suítes, lint/formatação e bundles
Android/iOS; interação física e leitores de tela ainda pendentes.

## Carregamento e fluidez

As listas de planejamento, diário e loja renderizam os itens conforme a rolagem.
Leituras de progresso/pesquisas respeitam a aba visível, descartam respostas de
outro filtro/usuário e cancelam consultas abandonadas. Atualizar a mesma leitura
mantém o conteúdo enquanto aguarda a API. O relatório salvo é consultado antes
de solicitar geração; o resumo semanal permanece em memória entre os segmentos.
Perfil mantém campos/foto durante a atualização e aplica a resposta completa,
preservando edições não salvas da mesma sessão. Escritas seguem seus contratos de confirmação
e idempotência. Consulte o [ciclo de leitura](docs/padroes-de-arquitetura.md#61-ciclo-de-leitura--mvp-24).

Para medir HTTP e renderização durante o desenvolvimento:

```bash
EXPO_PUBLIC_MEDIR_FLUIDEZ=1 npm run start:nativo -- --localhost --port 8082
```

Os registros `[Icarus fluidez]` contêm tempos, método, rota sem identificadores
e status; não incluem parâmetros, textos, fotos ou credenciais. A opção é
desativada por padrão e não registra em produção. Não exige novo APK.

## Espaço útil e barra do sistema

No Android, a barra inferior do sistema fica oculta durante o uso e reaparece
pelo gesto da borda. Teclado, leitor de tela ou estado de acessibilidade ainda
não confirmado mantêm os controles visíveis. As quatro abas do Icarus e a
barra superior permanecem. As áreas seguras continuam definidas pelo sistema.

No iPhone, o app solicita a ocultação automática do indicador de início;
a decisão e a área inferior continuam sob controle do iOS. Não exige nova
build ou dependência: usa opções do native-stack/screens já instalados.
[Comportamento e evidências do MVP-25](../icarus-context/docs/implementation-design/frontend/02-area-util-e-barras-do-sistema.md).
Android 16/cliente instalado: ocultação, gesto e teclado conferidos; iPhone,
leitores e Expo Go compatível com SDK 57 ainda pendentes.

## Editar repetições

Na criação/edição de missão, **Recompensa** recebe um inteiro de 1 a 1.000.000,
sem preenchimento ou alteração automática pela dificuldade. A edição carrega o
valor salvo e, em recorrentes, vale a partir de amanhã. Requer API com o
[contrato de escrita manual 2.0.0](../icarus-context/docs/implementation-design/platform/01-arquitetura-da-solucao.md#escrita-manual-de-missão--contrato-200-em-revisão);
publicar os dois lados juntos. Sem dependência ou build nativa nova.

O cabeçalho de Missões mostra sequência e saldo reais de
`GET /api/usuarios/{id}/jornada` (1.1.0). O foguinho abre o calendário; a moeda
abre a Loja. Atualiza ao retornar à tela/app e a cada minuto ativo, descartando
respostas de outra sessão. Hoje confirmado usa chama laranja; contagem
desconhecida usa travessão, sem inventar zero para registros antigos sem fuso.
Layout se adapta à fonte/tela e valores grandes. Os três PNGs aprovados ficam
em `src/assets/jornada/`; não requer nova build ou dependência. Dia protegido
usa escudo no calendário, mantém o contador e não ativa a chama de hoje.
Devolução aguardando vaga aparece só nos detalhes. Contrato e
limites: [sequência diária](../icarus-context/docs/implementation-design/platform/10-sequencia-diaria.md).

A missão recorrente ativa oferece **Editar missão**, inclusive após concluir a
execução do dia. O formulário consulta a regra salva antes de permitir edição;
frequência, dias, dia mensal e fim opcional usam os controles existentes. As
alterações valem a partir de amanhã; vínculo permanece somente para leitura.
Erro preserva o rascunho; conflito solicita reabrir a edição. A confirmação de
execução já mostrada na sessão é mantida. Sem dependências ou novo APK.

O detalhe consulta a execução real (HTTP 1.3.0), seus pontos e disponibilidade.
Atualiza ao voltar para a tela/app e a cada minuto em primeiro plano. Campanha
não iniciada e data futura aparecem com rótulos curtos e botão desabilitado;
falha permite **Atualizar execução**. Conclusão envia o identificador mostrado;
resposta repetida não incrementa a campanha outra vez. Fuso, datas e limites
são decididos pela API, com descarte de respostas de outra sessão.

**Concluir agora** continua com um toque e sem campos extras: o instante vem da
API na confirmação. O link **Fiz em outro momento** abre apenas data/horário e
**Confirmar conclusão**. Cancelar descarta a escolha; falha preserva o rascunho.
O app envia valores civis com ocorrência, data prevista e fuso esperados; a API
converte e valida. Depois de concluir, o detalhe mostra a realização salva,
sem permitir editá-la. A opção manual requer HTTP 1.3 compatível; API antiga
mantém o padrão agora. Sem biblioteca ou alteração nativa nova.

## Excluir da rotina

Os detalhes de épicos, campanhas e missões elegíveis oferecem **Excluir**, com
confirmação curta. A hierarquia sai das listas após a resposta da API; falhas
mantêm o item e permitem tentar novamente. Conclusões, medições e pontos ficam
preservados no servidor. Missões não recorrentes concluídas não oferecem a
exclusão. Respostas antigas não recolocam itens excluídos, e o filtro local é
isolado por sessão. A mudança usa JavaScript e não exige recompilar o APK.

## Ditado no cliente Android

Com Java e Android SDK instalados e o aparelho autorizado no USB:

```bash
npm ci
npm run android -- --no-bundler
```

A primeira execução compila e instala o Icarus com `expo-dev-client` e
`expo-speech-recognition`.

Em Linux com pouca memória, prefira `npm run android:leve`: compila somente
ARM64 com uma tarefa Gradle e uma compilação C++ por vez. Quando há sessão
systemd do usuário, limita o processo a 6 GB de RAM e 1,5 núcleo de CPU.
Esse comando gera o APK sem instalar; use
`adb install -r android/app/build/outputs/apk/debug/app-debug.apk` para instalá-lo
preservando os dados. Para emulador x86_64, defina
`ICARUS_ARQUITETURA_ANDROID=x86_64`. Depois, da raiz do workspace:

```bash
./icarus-infrastructure/scripts/iniciar-projeto.sh --nativo
```

O iniciador usa API 5138 e Metro 8082, abre o cliente instalado e o espelhamento.
Para iniciar somente o Metro: `npm run start:nativo -- --port 8082`.
Mudanças em JavaScript usam recarga; mudanças em módulos/configuração nativa
exigem recompilar. Sem `--nativo`, o iniciador continua abrindo o Expo Go.

Em Diário, **Ditar texto** pede permissão do microfone e usa reconhecimento
`pt-BR` no dispositivo, exigindo suporte e modelo local. O áudio não é persistido
nem enviado ao backend/IA; o texto preenche o campo e só vira entrada após a
confirmação. Sair da tela interrompe a escuta. No Expo Go o botão fica oculto e
a digitação continua disponível. O texto confirmado é salvo pela API autenticada;
o reconhecimento de voz continua no dispositivo.

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
- A foto pode vir da câmera ou galeria. Envio e leitura passam pelo cliente
  autenticado, com renovação de sessão e descarte de respostas de outra conta;
  trocar a imagem atualiza o avatar sem reutilizar a foto anterior em cache.
- Sair da conta exige confirmação. Confirmar remove a sessão local e tenta
  revogar a renovação no servidor; a saída local funciona inclusive sem rede.
- Missões, campanhas, épicos, onboarding e diário usam a API autenticada; os
  contextos mantêm o estado de apresentação e são limpos ao trocar de conta.

## Progresso das campanhas

O formulário permite definir início, quantidade e unidade da meta enquanto a
campanha estiver planejada. A API inicia na data do perfil; em andamento,
a configuração fica bloqueada e o progresso continua disponível. Nos detalhes,
**Registrar progresso** salva o total alcançado, inclusive zero ou uma redução,
e recupera o histórico ao reabrir. Digite o total acumulado, não apenas o avanço
do dia. A barra para em 100%, mas o texto preserva o valor acima da meta;
concluir exige confirmação e cancela repetições pendentes de hoje em diante,
preservando histórico e pontos. A jornada é atualizada ao voltar ao aplicativo.

Falhas preservam o valor digitado; repetir a tentativa não duplica a medição.
Troca de conta descarta o estado e respostas antigas. Registrar progresso não
altera saldo nem cria pontos. Campanhas antigas mantêm seus valores, sem
inventar medições retroativas. A leitura 1.1.0 mostra avanço, quanto falta e
um gráfico dos registros, também em **Sua meta em foco**. Com cinco registros
semanais comparáveis, exibe **Se mantiver esse ritmo…** e o tempo aproximado.
Sem base elegível, não cria previsão. Explicações e registros completos abrem
sob demanda em **Entender meu ritmo**; pontos e XP ficam fora do cálculo.
Contrato: [progresso mensurado](../icarus-context/docs/implementation-design/platform/09-progresso-mensurado-campanhas.md).
Esta mudança é JavaScript/API e não exige recompilar o cliente instalado.

## Histórico dos relatórios

Em Minha semana, **Ver histórico** lista as semanas salvas. O detalhe lê o texto
e os indicadores originais; **Como foi feito** abre período/fuso, registros e
configuração da IA sob demanda. Sem gerar ao abrir, recalcular o passado ou
preencher fontes não registradas. Paginação, falhas recuperáveis, sessão e retorno
com lista preservada seguem o cliente autenticado. Contrato
[1.0.0](../icarus-context/docs/implementation-design/platform/13-historico-relatorios.md).
JavaScript/API, sem nova build nativa. Fluxo de leitura e retorno conferido no
Samsung Android 16; validação pelo usuário, iPhone e leitores de tela pendentes.

## Histórico de missões

Em Missões, **Histórico** fica ao lado de Meu progresso. A lista usa ocorrências
reais da API, com data prevista, estado, campanha e crédito recebido. Filtros
recolhidos permitem período, estado e campanha/avulsas; Outro período aceita
início/fim. Voltar do detalhe preserva a lista e Ver mais traz a próxima página.
Registros removidos da rotina continuam consultáveis; o detalhe é somente leitura,
com realização, registro e ausência de metadados explícitos. Troca de conta ou
filtro descarta respostas antigas. Sem dependência ou nova build nativa.
Contrato: [histórico 1.0.0](../icarus-context/docs/implementation-design/platform/11-historico-missoes.md).

## Extrato

Na Loja, **Ver extrato** abre os movimentos reais da API. Período combina com
Todos/Recebidos/Usados, Ver mais pagina e o detalhe é somente leitura. Voltar
preserva a consulta. Valores usam moeda e número; saldo antigo não registrado é
exibido como indisponível. Há repetição de falha e isolamento na troca de conta.
Contrato [1.0.0](../icarus-context/docs/implementation-design/platform/12-extrato-pontos.md).
JavaScript/API: o cliente já instalado não precisa de nova build nativa.

## Histórico do diário

Reflexões e deslizes são carregados ao abrir o Diário e por **Atualizar histórico**.
Criar, editar e excluir aguardam a API; falhas preservam o texto ou a entrada,
sem confirmar sucesso. Editar mantém a data original; excluir exige confirmação
e retira a entrada do histórico por exclusão lógica no servidor. O histórico
aceita várias entradas no mesmo dia e sobrevive à reabertura do app.

Somente tipo, data e texto são enviados. Diário não gera pontos e não participa
do relatório de IA. Módulo e estados são isolados por conta; respostas antigas
não reaparecem após logout/troca de sessão. Contrato:
[`08-contrato-do-diario.md`](../icarus-context/docs/implementation-design/platform/08-contrato-do-diario.md).

Validação: `npm test -- --runInBand --watch=false` e `npm run lint`.

A conclusão confirmada pela API produz dois pulsos de vibração no Android e
retorno háptico de sucesso no iOS; falha ou ausência de suporte não impede o fluxo.

## Loja de recompensas

A aba Loja consulta a API autenticada e permite criar, editar e excluir
recompensas disponíveis, resgatar, desfazer resgate e confirmar o uso
irreversível. Saldo e estado vêm do servidor. Proteções de sequência têm preço
visível e limite de três unidades. O fechamento automático e a compensação
retroativa vêm da API; dia protegido mantém a sequência sem somar. Devoluções
com estoque cheio aguardam vaga, sem virar pontos. A loja oferece atualização por gesto e ao
receber foco, além de estados de carregamento, vazio e erro.

Contrato e limites: [`05-contrato-da-loja.md`](../icarus-context/docs/implementation-design/platform/05-contrato-da-loja.md).

## Meu progresso e minha semana

**Meu progresso** separa **Minha jornada** de **Pesquisas**. Semana, mês e seis
meses completos mostram missões feitas, evolução em barras, números disponíveis
e distribuição por área. **Seus objetivos · Agora** abre campanhas/épicos sob
demanda: estados atuais, contagens e atividade. A API escolhe a campanha em
destaque pelas realizações dos últimos sete dias; sem atividade confirmada,
não escolhe. Metas mostram a unidade original, valor/faltante atuais e avanço
registrado no período. Épicos não recebem percentual; pontos não viram resultado.
Uma consulta ao resumo traz os dados, sem buscar uma previsão por campanha.

A API calcula a atividade por realização e a adesão ao planejamento em bases
separadas; HTTP de progresso 1.3.0, compatível com a leitura anterior. O resumo
**Do que você planejou** mostra barra, porcentagem e feitas/previstas até fechar
o período. Uma realização posterior aparece na atividade seguinte. Legado
mostra apenas planejadas registradas, com explicação em **Sobre estes números**;
não inventa taxa. Pendentes/atrasadas ficam em **Ver mais números**. Trocar a
sessão ou o período esconde imediatamente resultados anteriores, inclusive
respostas atrasadas. Sem dependência ou nova build.

Pesquisas de 2024 aparecem uma por vez, com controles anterior/próxima, valores
visuais, fonte, país e população. A linguagem é cotidiana: horas/minutos e
“metade dos registros”, preservando o significado estatístico. Origem, grupos,
limites e links ficam em **Entender os dados**. Perguntas editoriais foram
adaptadas para leitura pela pessoa, sem promessas sobre resultados individuais.

**Minha semana** destaca um próximo passo do relatório persistido. Resumo e
pergunta opcional abrem sob demanda; a identificação de IA permanece visível.
No relatório 1.1.0, o planejamento mostra feitas/planejadas e taxa juntos;
**Comparar semanas** abre a semana anterior e a média das quatro anteriores.
A atividade por realização fica em outro controle. Valores e disponibilidade
vêm da API; relatórios antigos permanecem com seu conteúdo e apresentação.
Nova geração após falha exige ação explícita. Referências públicas e síntese
pessoal continuam separadas. Componentes usam Inter/roxo e dependências já
instaladas, com controles acessíveis, alturas variáveis e rolagem em fonte grande.

A direção visual de 23/10/2026 é proposta implementada, aguardando validação
pelo usuário. Testes cobrem navegação, gráfico real, pesquisa por área da meta,
metadados, linguagem, erros, sessão e ausência de dados. Consulte o
[contrato de consumo analítico](../icarus-context/docs/implementation-design/platform/06-consumo-analitico-mobile-api.md).
