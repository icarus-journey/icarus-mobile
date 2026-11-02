import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlanningHubScreen } from '../screens/PlanningHub/PlanningHubScreen';
import { HistoricoMissoesScreen } from '../screens/HistoricoMissoes/HistoricoMissoesScreen';
import { RegistroHistoricoMissaoScreen } from '../screens/HistoricoMissoes/RegistroHistoricoMissaoScreen';
import { MissionFormScreen } from '../screens/MissionForm/MissionFormScreen';
import { MissionDetailScreen } from '../screens/MissionDetail/MissionDetailScreen';
import { EpicFormScreen } from '../screens/EpicForm/EpicFormScreen';
import { EpicDetailScreen } from '../screens/EpicDetail/EpicDetailScreen';
import { CampaignFormScreen } from '../screens/CampaignForm/CampaignFormScreen';
import { CampaignDetailScreen } from '../screens/CampaignDetail/CampaignDetailScreen';
import { ProgressoScreen } from '../screens/Progresso/ProgressoScreen';
import { HistoricoRelatoriosScreen } from '../screens/HistoricoRelatorios/HistoricoRelatoriosScreen';
import { RelatorioSalvoScreen } from '../screens/HistoricoRelatorios/RelatorioSalvoScreen';
import { OrigemRelatorioScreen } from '../screens/HistoricoRelatorios/OrigemRelatorioScreen';
import { ConfiguracaoRelatorioScreen } from '../screens/HistoricoRelatorios/ConfiguracaoRelatorioScreen';
import { RelatorioSemanalScreen } from '../screens/Progresso/RelatorioSemanalScreen';
import { DetalhesDaReferenciaScreen } from '../screens/Progresso/DetalhesDaReferenciaScreen';

const Stack = createNativeStackNavigator();

export function NavegadorMissoes({ route }) {
  return (
    <Stack.Navigator
      initialRouteName={route.params?.telaInicial ?? 'MissionList'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MissionList" component={PlanningHubScreen} />
      <Stack.Screen name="HistoricoMissoes" component={HistoricoMissoesScreen} />
      <Stack.Screen name="RegistroHistoricoMissao" component={RegistroHistoricoMissaoScreen} />
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
    </Stack.Navigator>
  );
}
