# Planner Educacional Semestral — PWA

Arquivos incluídos:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js

Como usar:
1. Abra esta pasta no VS Code.
2. Use a extensão *Live Server* (ou sirva a pasta estática) para rodar `index.html` — necessário para PWA e service worker.
3. O app salva dados em `localStorage`. Para sincronização (Drive/Dropbox) recomenda-se integrar uma backend ou serviços 3rd-party.
4. Notificações push de verdade exigem um servidor (Push API / Firebase). Aqui há apenas um helper local que pedirá permissão.

Observações:
- O app é responsivo e funciona em desktop e celular. É um starter completo para você expandir (ex: upload de arquivos, sync com Firebase, push notifications).
