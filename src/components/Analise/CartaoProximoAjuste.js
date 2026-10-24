import { Text, View } from 'react-native';
import { SecondaryButton } from '../Button';
import { estilosAnalise as estilos } from './estilosAnalise';

export function CartaoProximoAjuste({ dados, carregando, onVerSemana }) {
  return (
    <View style={[estilos.cartao, estilos.destaque]}>
      <Text style={estilos.rotulo}>
        {dados?.relatorio ? 'Sua semana · reflexão com IA' : 'Sua jornada'}
      </Text>
      <Text style={estilos.titulo}>Um passo para sua semana</Text>
      <Text style={estilos.texto} numberOfLines={2}>
        {dados?.relatorio?.texto?.proximoAjuste ??
          (carregando
            ? 'Consultando seus registros…'
            : 'Reflita sobre seus registros e conheça o contexto público em Meu progresso.')}
      </Text>
      <SecondaryButton label="Ver minha semana" onPress={onVerSemana} />
    </View>
  );
}
