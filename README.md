# Icarus Mobile

Aplicativo React Native pelo qual o usuário organiza objetivos, acompanha
missões, utiliza recompensas e consulta seu progresso.

## Execução local

O reconhecimento de voz usa um módulo nativo e requer um _development build_.
No Expo Go, o restante do aplicativo funciona e o diário aceita digitação, mas
o ditado informa que esse recurso não está disponível.

```bash
npm install
npm run android
```

Depois da primeira compilação nativa, use `npm start` para iniciar o Metro com
o cliente de desenvolvimento.
