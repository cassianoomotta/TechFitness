# 🏋️ TechFitness

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-3ECF8E?style=flat&logo=supabase)
![NextAuth.js](https://img.shields.io/badge/Auth-NextAuth.js-purple?style=flat)

> **O seu parceiro digital para treinos de alta performance, gamificação e consultoria esportiva inteligente.**

O **TechFitness** é uma plataforma web full-stack de ponta desenvolvida para conectar **Personal Trainers** e **Alunos (Atletas)** através de uma experiência imersiva, moderna, mobile-first e potencializada por Inteligência Artificial.

---

## 🎯 Para Quem É o TechFitness?

### 📱 Para os Alunos (Atletas)
Diga adeus às fichas de papel amassadas e PDFs estáticos ilegíveis no smartphone:
- **Modo "Hora do Show":** Painel de execução interativo durante o treino, com cronômetro de descanso em tempo real, séries, repetições, RPE e anotação imediata de cargas.
- **Mobile First & Ergonomia Nativa:** Navegação inferior fixa (Bottom Navigation Dock) de 48px, suporte total às safe areas do iPhone (Dynamic Island / Notch) e Android, e teclado numérico automático para registro de pesos.
- **RPG & Gamificação:** Suba de nível (de Bronze até *Lenda do Olimpo*), mantenha sua sequência de semanas ativas (*Streak*), desbloqueie conquistas em 4 tiers e dispute o topo na **Liga dos Titãs**.
- **Feed Social & Check-in ("Instagram dos Treinos"):** Registre fotos do treino concluído, compartilhe com seus grupos e receba reações da comunidade.
- **Duelos & Parceiros de Treino:** Encontre parceiros da mesma assessoria e compare frequência, carga acumulada e recordes (PRs) de forma saudável.
- **Clima & Dicas em Tempo Real:** Widget meteorológico integrado via Open-Meteo para ajustar sua hidratação e aquecimento de acordo com o clima local.

### 💼 Para os Treinadores (Personal Trainers)
Seu centro de comando digital para escalar consultorias esportivas:
- **Painel de Gestão Centralizado:** Monitore todos os seus alunos em um só lugar, visualizando assiduidade, consistência e recordes recentes.
- **Copilot de IA para Prescrição de Treinos:** Assistente integrado com Google Gemini e OpenAI que analisa a biometria, objetivo e histórico do aluno para sugerir fichas de treino periodizadas em segundos.
- **Biblioteca com +300 Exercícios:** Catálogo categorizado por grupo muscular e equipamento, com sugestão inteligente de exercícios substitutos caso o aparelho esteja ocupado na academia.
- **Acompanhamento Antropométrico:** Histórico de pesagens, circunferências corporais e galeria de fotos de evolução física do aluno.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Destaques |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js 16](https://nextjs.org/) (App Router) | React Server Components + Client Components otimizados |
| **Linguagem** | [TypeScript 5](https://www.typescriptlang.org/) | Tipagem 100% estrita (**Zero `any`**) |
| **UI & Estilo** | [Tailwind CSS v4](https://tailwindcss.com/) | Glassmorphism, paleta HSL, safe-area utilities |
| **Ícones** | [Lucide React](https://lucide.dev/) | Ícones consistentes e minimalistas |
| **Banco de Dados** | PostgreSQL ([Supabase](https://supabase.com/)) | Hospedado na nuvem com conexões seguras |
| **ORM** | [Prisma ORM 6](https://www.prisma.io/) | Modelagem relacional e migrations automatizadas |
| **Autenticação** | [NextAuth.js](https://next-auth.js.org/) | Sessões seguras JWT, hash bcrypt, RBAC e auto-login |
| **Inteligência Artificial** | Google Gemini + OpenAI API | Fallback inteligente e geração adaptativa de treinos |
| **Mobile & UX** | Apple HIG / Material 3 | Prevenção de auto-zoom iOS, alvos de toque 48px |

---

## 🗺️ Estrutura de Rotas e Páginas

```text
src/
├── app/
│   ├── page.tsx                           # Landing page oficial TechFitness
│   ├── login/                             # Autenticação de alunos e professores
│   ├── register/                          # Cadastro com seleção de perfil e auto-login
│   ├── forgot-password/                   # Recuperação de senha
│   │
│   ├── student/                           # Área do Aluno (Atleta)
│   │   ├── dashboard/                     # Dashboard principal (Treinos, Grupos, Peso, Conquistas)
│   │   ├── workout-session/               # Execução ativa do treino ("Hora do Show")
│   │   ├── achievements/                  # Mural detalhado de troféus e badges
│   │   └── profile/                       # Perfil do aluno, foto, senha e logout
│   │
│   ├── trainer/                           # Área do Personal Trainer
│   │   ├── dashboard/                     # Visão geral de alunos e treinos ativos
│   │   ├── exercises/                     # Biblioteca e gestão de exercícios
│   │   ├── profile/                       # Perfil do treinador e credenciais CREF
│   │   └── students/[id]/
│   │       ├── progress/                  # Gráficos de evolução do aluno
│   │       ├── new-plan/                  # Criação manual ou com IA de novos treinos
│   │       └── measurements/              # Avaliações físicas e fotos de progresso
│   │
│   └── api/                               # Rotas de API Backend
│       ├── auth/[...nextauth]/            # Endpoints de login, sessão e tokens
│       ├── student/                       # Endpoints de treinos, grupos, peso e conquistas
│       ├── trainer/                       # Endpoints de gestão de alunos e templates
│       ├── exercises/                     # Catálogo e busca de exercícios
│       └── notifications/                 # Central de notificações do usuário
```

---

## ⚡ Instalação e Execução Local

### 1. Pré-requisitos
- Node.js 20+ instalado
- Git instalado
- Gerenciador de pacotes `npm` ou `pnpm`

### 2. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/TechFitness.git
cd TechFitness
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com base nas seguintes variáveis:

```env
# Banco de Dados PostgreSQL (Exemplo Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="sua_chave_secreta_super_segura_32_chars"
NEXTAUTH_URL="http://localhost:3000"

# Inteligência Artificial (Opcional - para IA Copilot)
GEMINI_API_KEY="sua_chave_api_do_google_gemini"
OPENAI_API_KEY="sua_chave_api_da_openai"
```

### 5. Sincronizar o Banco de Dados e Rodar o Seed
```bash
npx prisma db push
npx prisma db seed
```

### 6. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador ou acesse pelo smartphone via IP local para testar a experiência mobile.

---

## 🧪 Contas de Teste Pré-Configuradas

Ao rodar o `seed` do banco de dados, as seguintes credenciais padrão estão disponíveis para testes:

| Perfil | E-mail | Senha Padrão | Funcionalidade Principal |
| :--- | :--- | :--- | :--- |
| **Treinador (ADM)** | `professor@techfitness.com` | `123456` | Gestão de alunos, criação com IA, biblioteca |
| **Aluno (Atleta 1)** | `aluno1@techfitness.com` | `123456` | Dashboard gamificado, execução de treinos, grupos |
| **Aluno (Atleta 2)** | `aluno2@techfitness.com` | `123456` | Parceiro de treino para comparação e duelos |

---

## 🛡️ Qualidade e Boas Práticas
- **Verificação de Tipos:** Execute `npx tsc --noEmit` para garantir 0 erros de compilação TypeScript.
- **Build de Produção:** Execute `npm run build` para validar geração de rotas estáticas e dinâmicas com o compilador do Next.js.
- **Auditoria de Segurança:** Proteção contra as 5 falhas críticas (IDOR, credenciais vazadas, validação Zod no backend, RBAC e sanitização de inputs).

---

Feito com dedicação para elevar o nível do treinamento físico e da consultoria esportiva. 🚀
