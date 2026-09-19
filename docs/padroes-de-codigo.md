# Icarus Mobile — Padrões de código

**Status:** rascunho

**Responsável:** Izael

**Última atualização:** 2026-09-05

## 1. Objetivo

Definir convenções de nomenclatura, organização de arquivos, estilo de
código, acessibilidade e testes mínimos para as contribuições ao aplicativo
React Native, mantendo consistência entre integrantes.

Ver também [`padroes-de-arquitetura.md`](./padroes-de-arquitetura.md) para a
organização de pastas e as responsabilidades de navegação, estado e acesso a
serviços.

## 2. Linguagem e ferramentas

- JavaScript (ES2020+), sem TypeScript no MVP, conforme decisão registrada na
  arquitetura da solução;
- aplicativo criado e executado com Expo; testado no Expo Go durante o
  desenvolvimento;
- formatação: Prettier;
- análise estática: ESLint com a configuração `eslint-config-universe` (ou
  equivalente oficial do Expo) mais o plugin `eslint-plugin-jsx-a11y` para
  acessibilidade;
- ambos rodam localmente (`npm run lint`, `npm run format`) e devem ser
  executados antes de abrir um *pull request*; a configuração exata dos
  scripts será adicionada ao `package.json` quando o projeto Expo for
  inicializado.

## 3. Nomenclatura

| Item | Convenção | Exemplo |
|---|---|---|
| Arquivo de componente/tela | `PascalCase.js`, igual ao nome do componente | `MissaoCard.js` |
| Arquivo de hook | `camelCase.js`, prefixo `use` | `useMissoes.js` |
| Arquivo de serviço/utilitário | `camelCase.js` | `apiClient.js` |
| Componente | `PascalCase` | `function MissaoCard() {}` |
| Hook | `camelCase`, prefixo `use` | `useMissoes()` |
| Função comum | `camelCase`, verbo no infinitivo | `formatarData()` |
| Constante | `UPPER_SNAKE_CASE` para valores fixos globais; `camelCase` para o restante | `PONTOS_MAXIMOS` |
| Prop booleana | prefixo `is`/`has`/`deve` | `isLoading`, `hasError` |

Nomes de domínio (missão, campanha, épico, área da vida, recompensa etc.)
seguem em português, com os mesmos termos e identificadores já usados em
`04-requisitos.md`, para evitar tradução divergente entre telas e requisitos.

## 4. Organização de um arquivo de componente

```jsx
// imports: React/RN primeiro, bibliotecas externas, depois módulos internos
import { useState } from 'react';
import { View, Text } from 'react-native';

import { useMissoes } from '../../hooks/useMissoes';
import styles from './styles';

export function MissaoCard({ missao, onConcluir }) {
  // hooks no topo, na ordem em que são usados
  const [carregando, setCarregando] = useState(false);

  // handlers depois dos hooks
  function handleConcluir() {
    setCarregando(true);
    onConcluir(missao.id);
  }

  // retorno de JSX por último
  return (
    <View accessibilityRole="summary">
      <Text>{missao.titulo}</Text>
    </View>
  );
}
```

- somente componentes funcionais com hooks; nada de componentes de classe;
- um componente por arquivo; estilos em arquivo `styles.js` irmão quando
  passarem de poucas regras, usando `StyleSheet.create`;
- nada de estilo inline para regras reaproveitadas; estilo inline é aceitável
  apenas para um valor calculado em tempo de execução (ex.: largura de uma
  barra de progresso);
- props desestruturadas na assinatura da função, não acessadas via `props.x`
  no corpo.

## 5. Comentários

- por padrão, sem comentário: nomes de variável, função e componente devem
  explicar o "o quê";
- comentário permitido apenas para justificar uma decisão não óbvia (ex.: uma
  regra de acessibilidade específica do Android, uma limitação do Expo Go);
- nada de comentário descrevendo o que o código já diz, nem referência a
  tarefa ou responsável no corpo do código (isso pertence ao commit e ao
  *pull request*).

## 6. Acessibilidade no código

- todo elemento interativo (`Pressable`, `TouchableOpacity`, campo de
  formulário) define `accessibilityLabel` com texto legível, não o texto
  visual bruto quando este for um ícone ou abreviação;
- estados de carregamento, erro e vazio são anunciados
  (`accessibilityLiveRegion` ou mensagem textual visível), nunca representados
  apenas por cor ou ícone;
- área de toque mínima recomendada pela documentação do React Native
  (aproximadamente 44x44dp) para qualquer elemento tocável;
- validar manualmente com o TalkBack ativo antes de considerar uma tela da
  Sprint 1 concluída, conforme RNF-06.

## 7. Testes mínimos

- ferramentas: **Jest** (executor, incluído no template Expo) e
  **React Native Testing Library** para testes de componente;
- cobertura mínima por contribuição:
  - toda tela nova tem um teste que a renderiza e verifica os elementos
    principais acessíveis (por `getByRole`/`getByLabelText`, não por
    detalhe de estilo);
  - toda função em `utils/` e `services/` tem teste do caminho principal e de
    ao menos um caso de erro ou entrada inválida;
  - interações críticas de fluxo (ex.: confirmar uma ação, navegar entre
    telas de um mesmo fluxo) têm um teste de interação simulando o toque do
    usuário;
- não é necessário perseguir cobertura percentual formal no aplicativo; a
  meta de 85% de cobertura definida nos requisitos é do back-end (RNF-03).
  O critério aqui é: nenhuma tela ou função de serviço sem teste algum.

## 8. Revisão e commits

- toda contribuição chega por *pull request* para `development`, a partir de
  uma branch `feature/<descrição-curta>`, conforme o fluxo já validado no
  workflow de CI do repositório;
- mensagens de commit descrevem a intenção da mudança (ex.:
  `feat: tela de onboarding`, `fix: validação do campo de data`), sem
  referenciar a ferramenta usada para gerar o código;
- antes de abrir o *pull request*: rodar lint, formatação e os testes locais;
  confirmar manualmente a navegação com TalkBack quando a mudança afetar uma
  tela;
- revisão de código verifica, nesta ordem: aderência a este documento e ao
  [`padroes-de-arquitetura.md`](./padroes-de-arquitetura.md), acessibilidade,
  cobertura mínima de teste e, por último, estilo.

## 9. Rastreabilidade

| Origem | Uso neste documento |
|---|---|
| `icarus-context/docs/product-specification/04-requisitos.md` (RNF-06, RNF-07) | Critérios de acessibilidade e compatibilidade Android. |
| `icarus-context/docs/implementation-design/platform/01-arquitetura-da-solucao.md` | Linguagem do aplicativo (JavaScript) e estratégia de testes do mobile. |
| `icarus-mobile/.github/workflows/validacao-inicial.yml` | Fluxo de branches validado por CI. |
