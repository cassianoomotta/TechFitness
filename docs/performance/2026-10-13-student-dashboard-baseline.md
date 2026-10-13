# Medições de desempenho do TechFitness

## Status da medição

A URL de produção foi informada em 13/10/2026. Após o novo deploy, as rotas do ranking e do mural existem: chamadas sem sessão retornam HTTP 401 em cerca de 0,24–0,29 s, comportamento esperado para endpoints protegidos. A medição autenticada continua pendente porque a conta oficial de teste não chegou ao painel durante a automação.

## Evidências observadas na produção

- `GET /api/student/ranking`, `GET /api/student/photo-feed` e `GET /api/user/profile` responderam HTTP 401 sem sessão, em cerca de 0,24–0,29 s. O 401 confirma proteção de acesso; não mede o custo autenticado das consultas.
- A automação Playwright não concluiu o login oficial e expirou aguardando o redirecionamento. Nenhuma resposta autenticada, payload de usuário ou imagem foi coletado.
- `npx prisma migrate status` conectou ao banco configurado e informou que as quatro migrações estão aplicadas. A tabela `StudentExerciseNote` existe; portanto, a migração ausente não explica por si só o erro de salvar observações.
- Consultas somente de metadados indicam aproximadamente 1.833 linhas em `ExerciseLog`, 101 em `WorkoutSession`, 6 em `User` e zero estimadas em `StudentExerciseNote`. A estimativa pode ficar desatualizada até o próximo `ANALYZE`.
- As imagens estão armazenadas como data URLs base64 no PostgreSQL: os quatro avatares somam cerca de 268 KB (média de 67 KB, máximo de 94 KB); 34 fotos de treino somam cerca de 2,45 MB (média de 72 KB, máximo de 273 KB). Isso acrescenta bytes às respostas que selecionam essas colunas, mas o volume atual é pequeno e não prova ser a causa principal da lentidão.
- Seis consultas `SELECT 1` somente de leitura levaram 631 ms na conexão inicial e 102–109 ms nas conexões reutilizadas, medidas desta máquina até o pooler configurado. Esses valores não representam a latência do ambiente Vercel.
- Uma execução exploratória do fluxo de grupos observou 5 chamadas à linha do tempo: 2 falharam e a duração mediana entre todas as respostas foi 5.613 ms (máximo 6.277 ms). Como foi apenas uma execução e houve falhas, isso é um sinal para investigação, não uma comparação antes/depois.
- O tempo visual do fluxo de grupos daquela execução foi descartado: a medição anterior podia considerar o estado de carregamento oculto antes de ele aparecer. O marcador foi corrigido; a nova execução não completou porque o login oficial expirou antes do fluxo.
- O fluxo do treinador também não passou da autenticação durante as tentativas feitas.

Portanto, ainda não há medições frias/aquecidas válidas para o painel do aluno ou treinador, nem verificação de falhas isoladas do ranking e do mural na produção. As chamadas sem autenticação e as consultas de metadados não permitem atribuir a lentidão ao banco. Para fechar a causa dos erros, são necessários os logs sanitizados das funções Vercel para as rotas do ranking, mural e observações, ou acesso somente leitura ao projeto TechFitness correto. A conexão Supabase disponível no Codex aponta para outro projeto e não foi usada.

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
