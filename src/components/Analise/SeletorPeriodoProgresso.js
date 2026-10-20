import { useState } from 'react';
import { SelectField } from '../SelectField';
import { PickerModal } from '../PickerModal';
const PERIODOS = [
  { id: 'semanaAnterior', titulo: 'Semana anterior completa' },
  { id: 'mesAnterior', titulo: 'Mês anterior completo' },
  { id: 'seisMeses', titulo: 'Últimos seis meses completos' },
];
export function SeletorPeriodoProgresso({ periodo, onChange }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <>
      <SelectField
        label="Período dos seus registros"
        value={PERIODOS.find((item) => item.id === periodo)?.titulo}
        onPress={() => setVisivel(true)}
      />
      <PickerModal
        visible={visivel}
        title="Período dos seus registros"
        items={PERIODOS}
        onClose={() => setVisivel(false)}
        onSelect={(item) => {
          onChange(item.id);
          setVisivel(false);
        }}
      />
    </>
  );
}
