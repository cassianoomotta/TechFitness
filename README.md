# 🏋️ TechFitness

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-3ECF8E?style=flat&logo=supabase)
![NextAuth.js](https://img.shields.io/badge/Auth-NextAuth.js-purple?style=flat)

> **O parceiro digital definitivo para treinos de alta performance, gamificação RPG, biometria inteligente e consultoria esportiva de elite.**

O **TechFitness** é uma plataforma web full-stack de última geração construída para conectar **Personal Trainers** e **Alunos (Atletas)** através de uma experiência imersiva, responsiva, mobile-first e potencializada por Inteligência Artificial.

---

## 🎯 Experiência & Funcionalidades

### 📱 Para os Alunos (Atletas)
Diga adeus às fichas de papel amassadas e PDFs estáticos ilegíveis no smartphone:
- **Cockpit de Início & Gamificação RPG:**
  - Painel de Nível RPG (25 títulos progressivos, de *Iniciante* a *Lenda do Olimpo*).
  - Barra de progresso de XP com gradiente dinâmico (`#2563EB` → `#00C2FF`).
  - Sequência de consistência semanal (*Streak*) e contador de treinos concluídos.
  - Teaser da *Próxima Conquista* servindo de atalho de dopamina para desbloqueio de troféus.
  - **Liga dos Titãs:** Ranking competitivo semanal, mensal e geral entre todos os atletas da assessoria.
  - **Check-ins da Turma ("Instagram dos Treinos"):** Mural de fotos de treino em formato carrossel/stories dos últimos 7 dias.
- **Meus Treinos Isolado:** Acesso direto e limpo às rotinas prescritas pelo treinador sem rolagem desnecessária.
- **Modo "Hora do Show":** Painel de execução interativo durante o treino, com cronômetro de descanso em tempo real, contagem de séries, repetições, RPE e anotação imediata de cargas.
- **Motor de Monitoramento Biométrico & Gráficos SVG:**
  - Curvas de Bézier cúbicas contínuas aceleradas por hardware para acompanhamento de peso corporal.
  - Seletor dinâmico de métricas: Peso (`kg`), Gordura Corporal (`BF %`) e Circunferências (*Cintura*, *Peitoral*, *Braço*, *Coxa* em `cm`).
  - Cards de KPIs no topo com cálculo de variação total (*Delta*) e cores contextuais de acordo com o objetivo (*Emagrecimento* vs *Hipertrofia*).
  - Tooltip magnético interativo com resposta tátil para inspeção de cada pesagem.
- **Ergonomia Fitts & Apple HIG:**
  - Mobile Bottom Navigation Dock fixo com 5 abas (*Início*, *Treinos*, *Grupos*, *Peso*, *Conquistas*), alvos de toque de 48px e respeito total a Safe Areas (Notch e Dynamic Island).
  - Prevenção do zoom involuntário no iOS Safari (`text-base md:text-sm`).
  - Navegação intuitiva pelo logotipo (`BrandLogo`) com retorno imediato à página inicial e rolagem suave.
- **Clima & Hidratação em Tempo Real:** Widget meteorológico integrado via Open-Meteo que adapta dicas de treino e hidratação com base na temperatura local.

---

### 💼 Para os Treinadores (Personal Trainers)
Centro de comando digital para escalar assessorias esportivas com excelência:
- **Painel Centralizado de Alunos:** Acompanhe frequência, assiduidade e recordes de todos os atletas em uma interface moderna.
- **Avaliação Física com Gráficos Biométricos Integrados:**
  - Registre peso, percentual de gordura, 7 dobras/perímetros corporais e fotos comparativas (frente, lado e costas).
  - Visualize o histórico em **Fichas detalhadas** ou no **Gráfico evolutivo de curvas suaves**, identificando rapidamente a resposta física do atleta ao treino.
- **Copilot de IA para Prescrição Periodizada:** Assistente com Google Gemini e OpenAI que analisa histórico e biometria para gerar rotinas completas com periodização em segundos.
- **Biblioteca com +300 Exercícios:** Catálogo estruturado por grupos musculares e equipamentos, com sugestões de substituições imediatas para aparelhos ocupados.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Destaques |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js 16](https://nextjs.org/) (App Router, React 19) | Server Components nativos + Client Components sob demanda |
| **Linguagem** | [TypeScript 5](https://www.typescriptlang.org/) | Tipagem 100% estrita (**Zero `any`** em todo o projeto) |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com/) | Design System utilitário, paleta HSL e glassmorphism |
| **Gráficos & Visualização** | SVG Vetorial Nativo | Curvas de Bézier cúbicas suaves, zero dependências externas |
| **Ícones** | [Lucide React](https://lucide.dev/) | Ícones ergonômicos e consistentes |
| **Banco de Dados** | PostgreSQL ([Supabase](https://supabase.com/)) | Conexão em nuvem com pooler transacional PgBouncer |
| **ORM** | [Prisma ORM 6](https://www.prisma.io/) | Modelagem relacional e migrations automatizadas |
| **Autenticação** | [NextAuth.js](https://next-auth.js.org/) | Sessões JWT, hash bcrypt, RBAC (`STUDENT`, `TRAINER`, `ADMIN`) |
| **Performance** | `next/dynamic` + Skeletons | Lazy loading de abas pesadas reduzindo o bundle inicial em +50% |

---

## 🗺️ Arquitetura de Pastas e Rotas

```text
src/
├── app/
│   ├── page.tsx                           # Landing page oficial TechFitness
│   ├── login/                             # Autenticação unificada
│   ├── register/                          # Cadastro com seleção de perfil e auto-login
│   ├── forgot-password/                   # Recuperação de acesso
│   │
│   ├── student/                           # Área do Aluno (Atleta)
│   │   ├── dashboard/                     # Cockpit com 5 abas (Início, Treinos, Grupos, Peso, Conquistas)
│   │   │   └── components/                # Abas modularizadas (WorkoutTab, WeightTab, GroupsTab, etc.)
│   │   ├── workout-session/               # Execução ativa de treino ("Hora do Show")
│   │   ├── achievements/                  # Jornada e troféus desbloqueáveis
│   │   └── profile/                       # Ajustes de conta, foto de perfil e encerramento de sessão
│   │
│   ├── trainer/                           # Área do Treinador (Personal Trainer)
│   │   ├── dashboard/                     # Visão global da assessoria e atletas
│   │   ├── exercises/                     # Biblioteca de exercícios e substitutos
│   │   ├── profile/                       # Dados profissionais e CREF
│   │   └── students/[id]/
│   │       ├── progress/                  # Painel de consistência do atleta
│   │       ├── new-plan/                  # Prescrição manual ou via Copilot de IA
│   │       └── measurements/              # Avaliação física com gráficos biométricos
│   │
│   └── api/                               # Rotas de API Backend (Next.js Route Handlers)
│       ├── auth/[...nextauth]/            # Endpoints NextAuth
│       ├── student/                       # APIs de treinos, pesagens, PRs e conquistas
│       └── trainer/                       # APIs de gestão de alunos e fichas
│
├── components/                            # Componentes de Design System Compartilhados
│   ├── BodyMetricsChart.tsx               # Motor de gráficos SVG vetoriais
│   ├── BrandLogo.tsx                      # Logotipo interativo com suporte a rotas
│   └── UserAvatar.tsx                     # Avatar com cache de imagem
│
└── lib/                                   # Regras de Negócio e Serviços
    ├── gamification.ts                    # Fórmulas de XP, níveis e conquistas RPG
    └── prisma.ts                          # Cliente Singleton do Prisma ORM
```

---

## ⚡ Instalação e Execução Local

### 1. Clonar o Repositório
```bash
git clone https://github.com/cassianoomotta/TechFitness.git
cd TechFitness
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com base no modelo abaixo:

```env
# Banco de Dados PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="sua_chave_secreta_super_segura_32_chars"
NEXTAUTH_URL="http://localhost:3000"

# Inteligência Artificial (Opcional - para IA Copilot)
GEMINI_API_KEY="sua_chave_api_do_google_gemini"
OPENAI_API_KEY="sua_chave_api_da_openai"
```

### 4. Sincronizar o Banco de Dados
```bash
npx prisma db push
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador ou acesse pelo smartphone via IP local para experimentar a ergonomia mobile.

---

## 🧪 Contas Oficiais de Teste

Para testes de interface, validações E2E ou logins no navegador, utilize as credenciais de teste configuradas:

| Perfil | E-mail | Senha Padrão | Funcionalidade Principal |
| :--- | :--- | :--- | :--- |
| **Professor (Trainer)** | `professor@gmail.com` | `123456` | Gestão de alunos, avaliação física, IA Copilot |
| **Aluno (Student)** | `aluno.teste@techfitness.com` | `123456` | Cockpit de gamificação, Hora do Show, gráficos de peso |

---

## 🛡️ Qualidade e Boas Práticas
- **Verificação de Tipos:** Execute `npx tsc --noEmit` para garantir **0 erros de compilação TypeScript**.
- **Validação de Build:** Execute `npm run build` para validar empacotamento do Next.js.
- **Auditoria de Segurança:** Proteção contra as 5 falhas críticas (IDOR, credenciais vazadas, validação Zod no backend, RBAC estrito e sanitização de inputs).
- **Design System Utilitário:** Sem CSS isolado ad-hoc; total alinhamento às diretrizes do `AGENTS.md`.

---

Feito com dedicação para transformar a rotina de treinos e a consultoria esportiva. 🚀
