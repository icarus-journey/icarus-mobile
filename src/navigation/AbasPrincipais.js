import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { BottomNav } from '../components/BottomNav';
import { DiarioScreen } from '../screens/Diario/DiarioScreen';
import { ContaScreen } from '../screens/Conta/ContaScreen';
import { colors } from '../theme/colors';
import { NavegadorMissoes } from './NavegadorMissoes';
import { NavegadorLoja } from './NavegadorLoja';

const Abas = createBottomTabNavigator();
const ITENS_POR_ROTA = { Missoes: 'missoes', Diario: 'diario', Loja: 'loja', Conta: 'perfil' };
const TELAS_COM_BARRA = new Set([
  'MissionList',
  'MissionDetail',
  'CampaignDetail',
  'EpicDetail',
  'Diario',
  'LojaScreen',
  'Conta',
]);

function BarraDasAbas({ state, navigation }) {
  const rota = state.routes[state.index];
  const tela =
    getFocusedRouteNameFromRoute(rota) ??
    (rota.name === 'Missoes' ? 'MissionList' : rota.name === 'Loja' ? 'LojaScreen' : rota.name);
  if (!TELAS_COM_BARRA.has(tela)) return null;

  function selecionar(nome) {
    const destino = state.routes.find((item) => item.name === nome);
    const evento = navigation.emit({
      type: 'tabPress',
      target: destino.key,
      canPreventDefault: true,
    });
    if (rota.key !== destino.key && !evento.defaultPrevented) navigation.navigate(nome);
  }

  function pressionarLongamente(item) {
    const destino = state.routes.find((candidata) => ITENS_POR_ROTA[candidata.name] === item);
    navigation.emit({ type: 'tabLongPress', target: destino.key });
  }

  return (
    <BottomNav
      activeItem={ITENS_POR_ROTA[rota.name]}
      onPressMissoes={() => selecionar('Missoes')}
      onPressDiario={() => selecionar('Diario')}
      onPressLoja={() => selecionar('Loja')}
      onPressPerfil={() => selecionar('Conta')}
      onLongPressItem={pressionarLongamente}
    />
  );
}

export function AbasPrincipais({ route }) {
  const telaInicial = route.params?.telaInicial;
  const lojaInicial = [
    'Loja',
    'LojaScreen',
    'Extrato',
    'MovimentoExtrato',
    'FormularioRecompensa',
  ].includes(telaInicial);
  const abaInicial = lojaInicial
    ? 'Loja'
    : telaInicial === 'Diario'
      ? 'Diario'
      : telaInicial === 'Conta'
        ? 'Conta'
        : 'Missoes';
  return (
    <Abas.Navigator
      initialRouteName={abaInicial}
      backBehavior="firstRoute"
      tabBar={BarraDasAbas}
      screenOptions={{
        headerShown: false,
        lazy: true,
        sceneStyle: { backgroundColor: colors.surface },
      }}
    >
      <Abas.Screen
        name="Missoes"
        component={NavegadorMissoes}
        initialParams={{ telaInicial: abaInicial === 'Missoes' ? telaInicial : undefined }}
      />
      <Abas.Screen name="Diario" component={DiarioScreen} />
      <Abas.Screen
        name="Loja"
        component={NavegadorLoja}
        initialParams={{
          telaInicial: lojaInicial && telaInicial !== 'Loja' ? telaInicial : undefined,
        }}
      />
      <Abas.Screen name="Conta" component={ContaScreen} />
    </Abas.Navigator>
  );
}
