// Identificador de tentativa; não é usado para autenticação.
export function criarOperacaoId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (letra) => {
    const numero = Math.floor(Math.random() * 16);
    return (letra === 'x' ? numero : (numero & 3) | 8).toString(16);
  });
}
