# Painel diário e visão geral do treinador

## Objetivo

Evoluir o dashboard existente do treinador para uma visão diária, dinâmica e visualmente clara da própria carteira de alunos. O painel deve ajudar o professor a identificar quem precisa de acompanhamento, entender frequência e evolução dos treinos, acompanhar a idade das fichas desde sua criação e visualizar entradas, inatividade e saídas da própria carteira.

O dashboard também pode gerar consultas legítimas ao banco quando o treinador o utiliza. Isso agrega valor ao produto, mas não garante que um projeto Supabase Free deixe de ser pausado por inatividade.

## Usuário e escopo

- Usuário: treinador autenticado.
- Escopo dos dados: somente os alunos vinculados ao treinador autenticado.
- Não haverá consolidação de dados entre professores nem visão de academia nesta entrega. O modelo atual não contém uma entidade de academia.
- A navegação permitirá uma visão agregada da carteira do professor e detalhamento por aluno.

## Objetivos do produto

1. Mostrar uma lista priorizada de alunos sem registro recente de treino, sem classificar automaticamente alguém como desistente.
2. Apresentar gráficos interativos de frequência, movimentação de alunos e recordes, com filtros de período e acesso aos dados detalhados.
3. Mostrar há quantos dias cada ficha ativa existe, usando `WorkoutPlan.createdAt`, conforme solicitado.
4. Registrar a entrada e a saída de alunos da carteira do professor para que a linha do tempo futura seja confiável.
5. Manter o dashboard responsivo, com estados de carregamento, vazio, parcial, erro e tentativa novamente.

## Proposta de experiência

O dashboard atual será ampliado, mantendo sua lista e seus indicadores existentes. A nova hierarquia sugerida é:

1. **Resumo da carteira:** alunos vinculados, treinos concluídos no período, alunos sem sessão recente e fichas ativas.
2. **Atenção hoje:** alunos ordenados por dias desde a última sessão, com acesso à página individual.
3. **Gráficos de atividade:** sessões concluídas por semana e frequência por aluno.
4. **Movimentação da carteira:** entradas e saídas por mês, além da quantidade de alunos sem registros no período.
5. **Fichas:** data de criação e idade em dias para cada ficha ativa do aluno. A idade deve ser apresentada como informação para o treinador decidir se revisa a ficha, sem um prazo universal de validade.
6. **Recordes pessoais:** tendência semanal/mensal de PRs já calculados pela regra atual.

### Interação dos gráficos

- Gráficos devem usar os dados reais do período selecionado e atualizar sem navegação para outra página.
- Gráficos de atividade devem oferecer intervalos de 7, 30 e 90 dias. A linha do tempo de entradas e saídas deve oferecer intervalos de 6 e 12 meses.
- Selecionar uma barra de frequência por aluno ou um item nas listas deve abrir o perfil correspondente, sempre dentro da carteira do professor autenticado. Gráficos agregados de sessões, recordes e movimentações mostram totais do período e não apontam para um aluno específico.
- No celular, gráficos devem permanecer legíveis, ter alvos de toque adequados e oferecer resumo textual dos dados.
- Seguir a identidade visual já definida no AGENTS.md: azul elétrico, ciano e violeta, camadas claras, microinterações discretas, ícones `lucide-react` e nenhum ampersand em texto de interface.
- Não foi encontrada biblioteca de gráficos declarada nos arquivos de dependência consultados. A escolha de biblioteca ou SVG será do implementador, após verificar a versão local do Next.js e os padrões existentes.

## Definições de métricas

- **Aluno vinculado:** perfil com `StudentProfile.trainerId` igual ao treinador autenticado.
- **Sem registro no período:** aluno vinculado sem `WorkoutSession` concluída dentro do intervalo escolhido. A interface deve mostrar a última data conhecida ou “sem sessão registrada” e nunca chamar o aluno de desistente apenas por falta de registro.
- **Entrada na carteira:** início confirmado do vínculo com o treinador, não a criação da conta do usuário.
- **Saída da carteira:** encerramento explícito do vínculo com o treinador ou transferência para outro treinador.
- **Idade da ficha:** diferença entre a data atual e `WorkoutPlan.createdAt`, mostrando apenas fichas não arquivadas e ativas.
- **Recorde pessoal:** usar a regra e o resultado já fornecidos pelo endpoint de estatísticas do treinador; não mudar a lógica de gamificação ou PR.
- **Sem registro recente:** mostrar a contagem para o período selecionado e a data da última sessão; não estabelecer um limiar universal de risco nem rotular desistência.

## Dados e histórico

O projeto registra `User.createdAt`, `StudentProfile.trainerId`, `WorkoutPlan.createdAt` e datas de sessão. Porém, não registra o início ou o encerramento histórico de um vínculo aluno-treinador, e não há fluxo de desligamento identificado no estado atual do código.

Para não apresentar uma data de cadastro como se fosse entrada na carteira:

- A carteira atual será exibida sem inventar datas de entrada históricas.
- A linha do tempo precisa registrar novos vínculos e encerramentos a partir da implantação.
- A linha do tempo começa na implantação; vínculos atuais sem data conhecida não serão usados como entradas históricas. `User.createdAt` não serve como substituto da data de entrada na carteira.
- Para manter a regra já comunicada no fluxo de vínculo, o professor não ganha uma ação direta de desvinculação. Será adicionada uma ação exclusiva de administrador à lista administrativa de usuários existentes; ao confirmar o encerramento, o vínculo ativo é finalizado e um evento de saída é registrado.
- O histórico de entradas e saídas deve ser mantido para que a linha do tempo permaneça correta. Não apagar esses eventos após 30 dias.
- Não excluir sessões, fichas ou medidas para reduzir o tamanho do banco. Não criar snapshots diários persistidos; calcular agregações ao consultar o painel.

O dashboard do treinador mostrará somente contagens agregadas de saídas, sem nomes ou dados de ex-alunos. O encerramento do vínculo retira o antigo treinador das consultas individuais já protegidas pelo vínculo atual. O evento histórico não deve ser usado para restaurar acesso a prontuários, medidas ou sessões.

## Abordagens consideradas

1. **Ampliar o dashboard existente — recomendada e escolhida nesta conversa.** Reutiliza a tela e os endpoints do treinador, adiciona gráficos e agregações com drill-down e evita manter dois painéis semelhantes. A lista administrativa de usuários existente receberá a ação restrita de encerramento de vínculo.
2. **Criar uma página analítica separada.** Dá mais espaço para análises avançadas, mas divide a visão diária e duplica navegação/dados numa fase em que as métricas desejadas cabem no dashboard atual.
3. **Gerar snapshots diários persistidos.** Facilita carregar relatórios pré-calculados, mas cria dados temporários e tarefas de retenção sem necessidade inicial. Também não garante que a Supabase conte a execução de cron como atividade suficiente para evitar pausa.

## Segurança, privacidade e acesso

- Todas as consultas devem derivar o treinador da sessão autenticada e filtrar por esse treinador no servidor; não confiar num `trainerId` enviado pelo cliente.
- Não expor listagens, medidas, nomes ou métricas de outros treinadores.
- Saídas podem aparecer como contagens agregadas; acesso a nomes ou perfil de ex-aluno após desvinculação não está aprovado neste desenho.
- Dados corporais não serão agregados entre alunos nem exibidos em gráficos gerais nesta entrega. Medidas permanecem disponíveis nas telas individuais já autorizadas.
- Usar consultas agregadas no banco, com seleção mínima de campos, para evitar carregar todo o histórico de sessões para memória da aplicação.

## Fora de escopo

- Dashboard multi-academia ou consolidação de vários professores.
- Registro alimentar ou gráficos de dieta, pois não foi encontrado fluxo de diário alimentar no app.
- Mudança de XP, streaks ou regras de recordes.
- Alertas por e-mail, push ou notificações programadas.
- Classificação automática de aluno como desistente ou plano como vencido.
- Painel público, material de marketing ou screenshots com dados reais.

## Relação com a inatividade da Supabase

O dashboard deve gerar leituras úteis ao ser utilizado pelo professor, mas não pode garantir que a Supabase deixe de pausar um projeto Free. O projeto já tem um cron diário que consulta o banco para expirar referências de fotos; a execução e o projeto-alvo precisam ser verificados separadamente. O painel não deve ser tratado como substituto dessa verificação ou de um plano pago quando disponibilidade garantida for necessária.

## Questões ainda abertas

Não há questões pendentes para esta proposta. Saídas serão mostradas apenas em contagens agregadas; nomes e dados de ex-alunos não serão exibidos ao antigo treinador.

## Critérios de aceitação propostos

- O professor vê somente a própria carteira e consegue navegar da visão agregada para o aluno correto.
- Os gráficos respondem a filtros de período e não exibem valores inventados para vínculos antigos sem data.
- A falta de sessão aparece como “sem registro” com data da última sessão, não como desligamento.
- Vínculos e desligamentos realizados após a implantação geram eventos suficientes para a linha do tempo futura.
- A idade exibida usa `WorkoutPlan.createdAt` e exclui fichas arquivadas ou inativas.
- Não são persistidos snapshots diários nem apagados registros duráveis de treino para manter o banco pequeno.
- Estados de carregamento, vazio, erro, dados parciais e tentativa novamente mantêm o restante do painel utilizável.
- A interface é responsiva, segue o design system e não contém `&` em texto visível.
