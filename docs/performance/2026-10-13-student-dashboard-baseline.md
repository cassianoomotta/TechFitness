# Medições de desempenho do TechFitness

## Status da medição

A URL de produção foi informada em 13/10/2026. A medição completa antes/depois ainda não pode ser concluída porque a publicação atual não contém a rota do mural criada no código local.

## Evidências observadas na produção

- Uma sessão autenticada de teste recebeu HTTP 200 no ranking.
- `GET /api/student/photo-feed` respondeu HTTP 404 sem sessão. A rota não está publicada no host testado.
- Uma execução exploratória do fluxo de grupos observou 5 chamadas à linha do tempo: 2 falharam e a duração mediana entre todas as respostas foi 5.613 ms (máximo 6.277 ms). Como foi apenas uma execução e houve falhas, isso é um sinal para investigação, não uma comparação antes/depois.
- O tempo visual do fluxo de grupos daquela execução foi descartado: a medição anterior podia considerar o estado de carregamento oculto antes de ele aparecer. O marcador foi corrigido; a nova execução não completou porque o login oficial expirou antes do fluxo.
- O fluxo do treinador também não passou da autenticação durante as tentativas feitas.

Portanto, ainda não há medições frias/aquecidas válidas para o painel do aluno ou treinador, nem verificação de falhas isoladas do ranking e do mural na produção. As alterações locais não foram publicadas por este trabalho.

## Condições e privacidade

O script usa somente as contas oficiais configuradas em `test-credentials.json`, registra rota anonimizada, status, duração e tamanho de resposta quando disponível. Não grava respostas, capturas de tela, nomes, e-mails ou URLs de fotos.

“Fria” significa navegação com o cache da sessão do painel limpo depois do login; a autenticação pode aquecer caches do servidor ou banco. “Aquecida” significa repetição do fluxo na mesma sessão. Não são benchmarks de banco frio.

## Próxima validação

Depois de publicar o código local com a rota `/api/student/photo-feed`, repetir:

```powershell
$env:TECHFITNESS_BASE_URL = "https://tech-fitness.vercel.app"
node scripts/measure-student-dashboard.mjs --flow student-home
node scripts/measure-student-dashboard.mjs --flow trainer-stats
node scripts/measure-student-dashboard.mjs --flow groups-timeline
node scripts/measure-student-dashboard.mjs --flow student-home --fail-route ranking
node scripts/measure-student-dashboard.mjs --flow student-home --fail-route photo-feed
```

Se o Chromium empacotado pelo Playwright não estiver instalado, configure `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` com o caminho do Chrome local. O script não requer o perfil ou cookies pessoais do navegador.
