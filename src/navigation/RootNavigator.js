import { HistoricoRelatoriosScreen } from '../screens/HistoricoRelatorios/HistoricoRelatoriosScreen';
import { RelatorioSalvoScreen } from '../screens/HistoricoRelatorios/RelatorioSalvoScreen';
import { OrigemRelatorioScreen } from '../screens/HistoricoRelatorios/OrigemRelatorioScreen';
import { ConfiguracaoRelatorioScreen } from '../screens/HistoricoRelatorios/ConfiguracaoRelatorioScreen';
import { ExtratoScreen } from '../screens/Extrato/ExtratoScreen';
import { MovimentoExtratoScreen } from '../screens/Extrato/MovimentoExtratoScreen';
import { HistoricoMissoesScreen } from '../screens/HistoricoMissoes/HistoricoMissoesScreen';
import { RegistroHistoricoMissaoScreen } from '../screens/HistoricoMissoes/RegistroHistoricoMissaoScreen';
import { RelatorioSemanalScreen } from '../screens/Progresso/RelatorioSemanalScreen';
import { ProgressoScreen } from '../screens/Progresso/ProgressoScreen';
import { DetalhesDaReferenciaScreen } from '../screens/Progresso/DetalhesDaReferenciaScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { CampaignDetailScreen } from '../screens/CampaignDetail/CampaignDetailScreen';
import { CampaignFormScreen } from '../screens/CampaignForm/CampaignFormScreen';
import { DiarioScreen } from '../screens/Diario/DiarioScreen';
import { EpicDetailScreen } from '../screens/EpicDetail/EpicDetailScreen';
import { EpicFormScreen } from '../screens/EpicForm/EpicFormScreen';
import { MissionDetailScreen } from '../screens/MissionDetail/MissionDetailScreen';
import { MissionFormScreen } from '../screens/MissionForm/MissionFormScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { PlanningHubScreen } from '../screens/PlanningHub/PlanningHubScreen';
import { ContaScreen } from '../screens/Conta/ContaScreen';
import { LojaScreen } from '../screens/Loja/LojaScreen';
import { FormularioRecompensaScreen } from '../screens/Loja/FormularioRecompensaScreen';
import { useSessao } from '../state/SessaoContext';

const Stack = createNativeStackNavigator();

export function RootNavigator({ initialRouteName }) {
  const { sessao, novaConta } = useSessao();
  if (!sessao) {
    return (
      <Stack.Navigator key="visitante" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }
  return (
    <Stack.Navigator
      key={sessao.usuarioId}
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName ?? (novaConta ? 'Onboarding' : 'MissionList')}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MissionList" component={PlanningHubScreen} />
      <Stack.Screen name="HistoricoMissoes" component={HistoricoMissoesScreen} />
      <Stack.Screen name="RegistroHistoricoMissao" component={RegistroHistoricoMissaoScreen} />
      <Stack.Screen name="Diario" component={DiarioScreen} />
      <Stack.Screen name="MissionForm" component={MissionFormScreen} />
      <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
      <Stack.Screen name="EpicForm" component={EpicFormScreen} />
      <Stack.Screen name="EpicDetail" component={EpicDetailScreen} />
      <Stack.Screen name="CampaignForm" component={CampaignFormScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <Stack.Screen name="ProgressoScreen" component={ProgressoScreen} />
      <Stack.Screen name="HistoricoRelatoriosScreen" component={HistoricoRelatoriosScreen} />
      <Stack.Screen name="RelatorioSalvoScreen" component={RelatorioSalvoScreen} />
      <Stack.Screen name="OrigemRelatorioScreen" component={OrigemRelatorioScreen} />
      <Stack.Screen name="ConfiguracaoRelatorioScreen" component={ConfiguracaoRelatorioScreen} />
      <Stack.Screen name="RelatorioSemanalScreen" component={RelatorioSemanalScreen} />
      <Stack.Screen name="DetalhesDaReferenciaScreen" component={DetalhesDaReferenciaScreen} />
      <Stack.Screen name="Conta" component={ContaScreen} />
      <Stack.Screen name="Loja" component={LojaScreen} />
      <Stack.Screen name="Extrato" component={ExtratoScreen} />
      <Stack.Screen name="MovimentoExtrato" component={MovimentoExtratoScreen} />
      <Stack.Screen name="FormularioRecompensa" component={FormularioRecompensaScreen} />
    </Stack.Navigator>
  );
}
