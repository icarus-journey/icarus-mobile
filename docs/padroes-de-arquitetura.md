# Icarus Mobile — Padrões de arquitetura

**Status:** rascunho

**Responsável:** Izael

**Última atualização:** 2026-09-05

## 1. Objetivo

Definir a organização de pastas, as responsabilidades de navegação, estado e
acesso a serviços do aplicativo React Native, para que qualquer integrante
consiga localizar e adicionar código de forma previsível.

Este documento não define contratos de API, regras de domínio ou o desenho
detalhado das telas. Esses artefatos pertencem, respectivamente, ao futuro
contrato OpenAPI e a `icarus-context/docs/implementation-design/frontend/`.

## 2. Restrições herdadas

O aplicativo segue a
[arquitetura da solução](../../icarus-context/docs/implementation-design/platform/01-arquitetura-da-solucao.md)
validada no `icarus-context`:

- React Native com JavaScript (sem TypeScript no MVP);
- o aplicativo fala **somente** com a API, por HTTP, através do proxy Nginx;
- é proibido o aplicativo acessar PostgreSQL, RabbitMQ, MinIO, DuckDB, o
  trabalhador Python, o ETL ou o provedor de IA diretamente;
- o token JWT deve ficar em armazenamento seguro do dispositivo, hoje previsto
  como `react-native-keychain`;
- alvo de compatibilidade: Android 16/API 36;
- acessibilidade mínima: WCAG 2.2 nível A, operável com TalkBack.

Execução e teste local do aplicativo ocorrem via **Expo** (fluxo gerenciado),
validado no Expo Go durante o desenvolvimento.

> **Pendência conhecida:** `react-native-keychain` exige módulo nativo
> vinculado, o que não funciona no Expo Go puro. A decisão entre usar
> `expo-secure-store` (compatível com Expo Go) ou migrar para um
> *development build* com `react-native-keychain` deve ser tomada quando o
> fluxo de autenticação (RF-02) for implementado, sem bloquear as telas da
> Sprint 1. Registrar a escolha final neste documento quando decidida.

## 3. Estrutura de pastas

```text
icarus-mobile/
├── App.js
├── app.json
├── docs/
│   ├── padroes-de-codigo.md
│   └── padroes-de-arquitetura.md
└── src/
    ├── navigation/       # stacks, tabs e o navegador raiz
    ├── screens/          # uma pasta por tela ou fluxo de telas
    ├── components/       # componentes reutilizáveis entre telas
    ├── state/            # contextos e providers de estado compartilhado
    ├── services/         # cliente HTTP e um módulo por domínio da API
    ├── hooks/             # hooks reutilizáveis não ligados a uma tela específica
    ├── theme/            # cores, tipografia, espaçamento e tokens visuais
    ├── utils/             # funções puras (formatação, datas, validação local)
    └── assets/            # ícones, imagens e fontes
```

Regras gerais:

- cada pasta representa uma responsabilidade; nada de misturar chamada de API
  dentro de `screens/` ou `components/`;
- um módulo só importa de outro na direção
  `screens → components/hooks/state/services → utils`; `utils` não importa de
  camada nenhuma acima dela;
- código específico de uma única tela mora dentro da própria pasta da tela
  (ex.: `screens/Onboarding/OnboardingStep.js`); só sobe para `components/`
  quando reaproveitado por mais de uma tela.

## 4. Navegação

- biblioteca padrão: **React Navigation** (`@react-navigation/native` com
  `native-stack` e, quando necessário, `bottom-tabs`);
- `src/navigation/` concentra a definição de rotas: um arquivo por fluxo
  (ex.: `AuthNavigator.js`, `OnboardingNavigator.js`, `AppNavigator.js`) e um
  `RootNavigator.js` que decide qual fluxo mostrar;
- telas não decidem sozinhas para onde navegar com base em regra de negócio
  complexa; a decisão de fluxo (ex.: usuário autenticado ou não) fica no
  `RootNavigator`;
- nomes de rota em `PascalCase` e iguais ao nome do componente de tela.

## 5. Estado

- **estado local de tela** (formulário em edição, tela expandida, etc.): hook
  `useState`/`useReducer` dentro do próprio componente;
- **estado compartilhado entre telas** (sessão do usuário, token, dados de
  onboarding em andamento): Context API do React, em `src/state/`, um contexto
  por domínio (ex.: `AuthContext.js`);
- não introduzir biblioteca externa de gerência de estado (Redux, Zustand,
  Recoil etc.) sem necessidade concreta identificada; a Sprint 1 deve ser
  resolvida com `useState`/`useReducer` e Context API;
- dado vindo da API não é duplicado em estado global "por garantia"; ele é
  buscado pela tela ou pelo hook que precisa dele através de `services/`.

## 6. Acesso a serviços

- todo acesso à API passa por `src/services/`;
- um cliente HTTP único (`services/apiClient.js`) concentra a URL base, o
  cabeçalho de autenticação e o tratamento padrão de erro; nenhuma tela chama
  `fetch` diretamente;
- um módulo por domínio de produto, espelhando os módulos já nomeados na
  arquitetura da solução (ex.: `services/missoes.js`, `services/campanhas.js`,
  `services/perfil.js`); cada módulo expõe funções (`buscarMissoes`,
  `concluirMissao`) e não estruturas de request/response cruas;
- **os contratos exatos de cada endpoint (rota, payload, códigos de erro)
  ainda não existem** — serão definidos no OpenAPI do `icarus-platform`. Até
  lá, os módulos de serviço podem ficar com assinatura definida e
  implementação pendente (`TODO` explícito), sem inventar contrato;
- nenhuma regra de domínio (cálculo de sequência, validação de recorrência,
  etc.) é replicada no aplicativo; o aplicativo exibe o que a API retorna e
  envia o que o usuário informa.

## 7. Componentes e telas

- `screens/`: um componente por tela navegável, responsável por orquestrar
  dados (via `services/` e/ou `state/`) e composição visual;
- `components/`: componentes de apresentação, reutilizáveis, sem chamada de
  serviço; recebem dados e callbacks via props;
- telas não ultrapassam responsabilidade de composição: lógica de formatação
  ou validação reutilizável vai para `utils/` ou `hooks/`.

## 8. Acessibilidade

- toda tela nova é navegável e legível pelo TalkBack antes de ser considerada
  concluída;
- componentes interativos (botão, campo, item de lista) definem
  `accessibilityLabel` e, quando aplicável, `accessibilityRole` e
  `accessibilityState`;
- layout responde a diferentes tamanhos de tela e fonte do sistema (uso de
  unidades relativas do RN, `flex`, sem tamanho de fonte fixo que quebre com
  fonte grande do sistema);
- detalhamento de critérios de código fica em
  [`padroes-de-codigo.md`](./padroes-de-codigo.md#acessibilidade-no-código).

## 9. Testes mínimos de arquitetura

- serviços (`services/`) e utilitários (`utils/`) têm teste unitário cobrindo
  o caminho principal e ao menos um caso de erro;
- toda tela nova tem um teste de renderização (Jest + React Native Testing
  Library) garantindo que ela monta sem erro e expõe os elementos acessíveis
  esperados;
- detalhamento de ferramentas e execução fica em
  [`padroes-de-codigo.md`](./padroes-de-codigo.md#testes-mínimos).

## 10. Dependências permitidas e proibidas

Permitidas:

- aplicativo → API do `icarus-platform`, por HTTP, através do proxy;
- aplicativo → armazenamento seguro local do token;
- aplicativo → bibliotecas de UI, navegação e teste registradas no
  `package.json`.

Proibidas:

- qualquer chamada direta a PostgreSQL, RabbitMQ, MinIO, DuckDB, ao
  trabalhador Python, ao ETL ou a um provedor de IA;
- lógica de domínio duplicada no aplicativo (cálculo de pontos, sequência,
  recorrência, elegibilidade de sugestão de IA etc.);
- dependência nova adicionada ao projeto sem verificação de vulnerabilidade
  conhecida crítica ou alta.

## 11. Rastreabilidade

| Origem | Uso neste documento |
|---|---|
| `icarus-context/docs/implementation-design/platform/01-arquitetura-da-solucao.md` | Restrições de dependência, armazenamento seguro do token, acessibilidade e alvo Android. |
| `icarus-context/docs/product-specification/04-requisitos.md` (RNF-06, RNF-07) | Critérios de acessibilidade e compatibilidade. |
| `icarus-mobile/README.md` | Descrição geral do aplicativo. |

## 12. Próxima revisão

Revisar este documento quando o fluxo de autenticação (RF-02) for
implementado, para registrar a decisão sobre armazenamento seguro do token no
Expo Go, e quando o primeiro contrato OpenAPI estiver disponível, para
substituir os `TODO` dos módulos de serviço.
