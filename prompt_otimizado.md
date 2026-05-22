# PROMPT OTIMIZADO PARA VIBE CODING (PRONTO PARA INSERIR NO ANTIGRAVITY)

Copie o conteúdo abaixo e envie-o para a IA (como o Antigravity) para iniciar o projeto. Ele foi estruturado para fazer a IA trabalhar de forma **iterativa** (passo a passo), evitando que ela tente escrever milhares de linhas de código de uma vez e acabe gerando arquivos incompletos ou cheios de placeholders (`// TODO`).

---

```markdown
# BRIEFING & INSTRUÇÕES DE DESENVOLVIMENTO: SAAS FITNESS PREMIUM

Você é um Engenheiro de Software Senior, especialista em React, Next.js (App Router), Tailwind CSS e Prisma ORM. Seu objetivo é construir um SaaS premium de gestão de treinos de academia voltado para Personal Trainers, Assessorias Esportivas e Alunos.

Para garantir que o código seja robusto, funcional e sem placeholders (como "// TODO"), nós vamos construir este sistema de forma **iterativa, fase por fase**. A cada iteração, você deve implementar o código completo daquela etapa e aguardar meu feedback antes de avançar para a próxima fase.

---

## 🛡️ REGRAS DE OURO DE CODIFICAÇÃO (LEIA ANTES DE ESCREVER)
1. **Sem Placeholders:** Nunca deixe comentários como `// TODO`, `// Implementar depois` ou funções vazias. Escreva a lógica funcional completa do recurso atual.
2. **Estilo Visual Premium & Dark Mode por Padrão:** Use uma paleta de cores dark premium (fundo Slate-950/Zinc-950, cards Zinc-900, bordas Zinc-800, textos Zinc-100) com acentos vibrantes de fitness (Emerald-500, Cyan-500 ou Violet-500). Use fontes modernas (Inter/Outfit) e transições suaves (`transition-all duration-300`).
3. **Mobile First Estrito:** O app de treino será usado principalmente no celular. A interface de execução de treino do aluno deve ser impecável em telas de 360px a 420px de largura.
4. **TypeScript Estrito:** Tipagem estrita em todas as entidades, propriedades e payloads de APIs.
5. **Segurança e Validação:** Use Zod para validações de schema tanto no Frontend (formulários) quanto no Backend (API routes).

---

## 🛠️ STACK TECNOLÓGICA DEFINIDA
- **Framework:** Next.js 14+ (App Router)
- **Estilização:** Tailwind CSS + Radix UI (ou Lucide React para ícones)
- **Banco de Dados & ORM:** PostgreSQL + Prisma ORM
- **Autenticação:** NextAuth.js (Credenciais + Google OAuth)
- **Gerenciamento de Estado:** React Context API ou Zustand
- **Gráficos:** Recharts (responsivos e estilizados no tema Dark)

---

## 📂 MODELAGEM DE BANCO DE DADOS (PRISMA SCHEMA)
Use esta estrutura relacional como base para a criação das tabelas no Prisma:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  role          Role      @default(STUDENT) // ADMIN, TRAINER, STUDENT
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  trainerProfile TrainerProfile?
  studentProfile StudentProfile?
}

enum Role {
  ADMIN
  TRAINER
  STUDENT
}

model TrainerProfile {
  id           String        @id @default(cuid())
  userId       String        @unique
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  specialties  String[]
  cref         String?
  students     StudentProfile[]
  workoutTemplates WorkoutTemplate[]
}

model StudentProfile {
  id           String        @id @default(cuid())
  userId       String        @unique
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  trainerId    String?
  trainer      TrainerProfile? @relation(fields: [trainerId], references: [id])
  workoutPlans WorkoutPlan[]
  sessions     WorkoutSession[]
  measurements BodyMeasurement[]
  logs         ExerciseLog[]
}

model Exercise {
  id             String   @id @default(cuid())
  name           String   @unique
  muscleGroup    String   // Ex: Peito, Pernas, Costas
  description    String?
  videoUrl       String?
  gifUrl         String?
  equipment      String   // Ex: Halteres, Barra, Máquina
  alternatives   String[] // IDs de exercícios equivalentes para substituição rápida
}

model WorkoutPlan {
  id             String    @id @default(cuid())
  studentId      String
  student        StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  name           String    // Ex: "Treino Hipertrofia A"
  description    String?
  division       String    // Ex: "A", "B", "C", "Push"
  exercises      WorkoutPlanExercise[]
  createdAt      DateTime  @default(now())
}

model WorkoutPlanExercise {
  id             String      @id @default(cuid())
  workoutPlanId  String
  workoutPlan    WorkoutPlan @relation(fields: [workoutPlanId], references: [id], onDelete: Cascade)
  exerciseId     String
  sets           Int
  reps           String      // Ex: "8-10" ou "Até a falha"
  restSeconds    Int
  method         String      // Ex: "Normal", "Drop Set", "Rest Pause"
  recommendedRpe Int?
  recommendedWeight Float?
  notes          String?
}

model WorkoutSession {
  id          String   @id @default(cuid())
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date        DateTime @default(now())
  durationMs  Int
  satisfaction Int      // RPE geral do treino (1 a 10)
  completed   Boolean  @default(true)
  logs        ExerciseLog[]
}

model ExerciseLog {
  id               String   @id @default(cuid())
  studentId        String
  student          StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  sessionId        String
  session          WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exerciseId       String
  setNumber        Int
  weightUsed       Float
  repsPerformed    Int
  rpe              Int?
  failed           Boolean  @default(false)
}

model BodyMeasurement {
  id          String   @id @default(cuid())
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date        DateTime @default(now())
  weight      Float
  bodyFat     Float?
  chest       Float?
  waist       Float?
  armLeft     Float?
  armRight    Float?
  thighLeft   Float?
  thighRight  Float?
  calfLeft    Float?
  calfRight   Float?
  photos      String[] // URLs das fotos (Frente, Lado, Costas)
}

model WorkoutTemplate {
  id             String          @id @default(cuid())
  trainerId      String
  trainer        TrainerProfile  @relation(fields: [trainerId], references: [id], onDelete: Cascade)
  name           String
  description    String?
  division       String
}
```

---

## 🚀 ROADMAP DE DESENVOLVIMENTO ITERATIVO (PASSO A PASSO)

Você deve começar executando **apenas a Fase 1**. Quando terminar, me mostre o resultado e peça autorização para prosseguir para a próxima fase.

### FASE 1: Setup do Projeto, Autenticação e Configuração do Prisma
1. Crie a estrutura básica do Next.js (App Router, Tailwind CSS e TypeScript).
2. Configure o arquivo `schema.prisma` com o modelo acima.
3. Configure a autenticação via `next-auth` contendo:
   - Login por Email/Senha.
   - Registro de novos usuários escolhendo o cargo (`TRAINER` ou `STUDENT`).
   - Proteção de rotas através de Next.js Middleware baseada em papéis (`/trainer/*` para treinadores, `/student/*` para alunos).
4. Crie uma página de Login e Cadastro com layout dark premium responsivo.

### FASE 2: Biblioteca de Exercícios & Gestão de Alunos (Visão do Trainer)
1. Crie a página `/trainer/dashboard` listando os alunos cadastrados com indicadores básicos de consistência.
2. Crie uma biblioteca completa de exercícios (`/trainer/exercises`):
   - CRUD para exercícios (Nome, Grupo Muscular, Equipamento, Alternativas).
   - Busca inteligente por nome, grupo muscular ou equipamento.
3. Crie a interface para o treinador cadastrar um aluno e vinculá-lo ao seu perfil.

### FASE 3: Construtor de Fichas de Treino & Periodização (Visão do Trainer)
1. Crie o criador de treinos (/trainer/students/[id]/new-plan):
   - Interface arrastar/selecionar exercícios da biblioteca.
   - Definição dos parâmetros por exercício: séries, repetições, descanso, método (drop set, bi-set, etc.), RPE recomendado e carga inicial.
   - Opção de salvar a ficha de treino como um "Template" para reutilização rápida com outros alunos.
   - Configuração de divisões de treino (A, B, C, D, etc.).

### FASE 4: Execução do Treino Mobile-First & Cronômetro (Visão do Aluno)
1. Crie a página `/student/dashboard`:
   - Mostrar o treino programado para hoje.
   - Tempo estimado de treino.
   - Streak de consistência de treinos concluídos.
2. Crie o "Player de Treino" (`/student/workout/[id]/active`):
   - Foco mobile-first (botões grandes, fácil leitura na academia).
   - Campo para o aluno digitar a carga utilizada e repetições reais feitas a cada série.
   - **Smart Timer:** Temporizador de descanso automático que dispara ao marcar uma série como concluída, com aviso visual e sonoro de fim de tempo.
   - Interface rápida para reportar RPE e fadiga ao final do treino.

### FASE 5: Progressão Inteligente de Carga & Histórico (CORE)
1. Implemente a lógica de sugestão de progressão no Player de Treino:
   - Se o aluno completou todas as repetições alvo em 2 treinos seguidos, sugira um aumento de 2,5% a 5% da carga na tela.
   - Se o aluno reportar falha repetida ou fadiga muito alta, recomende a manutenção ou redução (deload) da carga.
2. Crie a página de evolução do aluno (`/student/progress`):
   - Gráficos de evolução de carga por exercício (utilizando Recharts).
   - Gráfico de volume semanal e tonelagem total.
   - Destaque para recordes pessoais (PRs) batidos.

### FASE 6: Avaliações Físicas, IA Copilot e Recursos Avançados
1. Implemente o módulo de Avaliação Física (`/student/measurements` ou `/trainer/students/[id]/measurements`):
   - Formulário para registrar peso, BF% e medidas corporais.
   - Gráficos comparativos de medidas ao longo do tempo.
   - Upload de fotos de evolução (Frente, Lado, Costas) organizadas em timeline.
2. **Recursos de IA (Mockados localmente ou usando OpenAI/Gemini API se configurada):**
   - **Coach Copilot:** IA lê idade, peso, objetivo (emagrecer/hipertrofia/performance) e gera um treino inicial estruturado.
   - **IA de Estagnação:** Algoritmo que analisa o histórico do aluno e acende um alerta no painel do treinador se o aluno não progredir carga em um músculo há mais de 4 semanas.
3. **Modo Academia Lotada:** Na tela de treino do aluno, ao clicar em "Aparelho Ocupado", o app sugere um exercício alternativo equivalente da lista de substitutos configurados no banco de dados.

### FASE 7: Estrutura SaaS, Planos e Ajustes Finais
1. Configure as restrições de planos no sistema:
   - Plano Free: Personal pode gerenciar apenas até 3 alunos.
   - Plano Pro: Alunos ilimitados.
   - Plano Academia: Permissões para múltiplos treinadores sob a mesma conta.
2. Crie uma página de Checkout integrada visualmente (simulação de Stripe/Mercado Pago ou integração real via variáveis de ambiente).
3. Adicione o "Modo WhatsApp": Botão para o treinador exportar e enviar o treino formatado direto para o WhatsApp do aluno com apenas um clique.

---

## 🏁 VAMOS COMEÇAR!
Por favor, responda confirmando que entendeu as regras de ouro, a modelagem do banco de dados e a metodologia iterativa. Em seguida, implemente **exclusivamente a FASE 1** e liste os arquivos criados.
```
