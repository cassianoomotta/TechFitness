<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🏋️ TechFitness — Contexto Central para IA & Desenvolvedores
Este arquivo é a **Fonte Única de Verdade (Single Source of Truth)** do TechFitness. Leia-o rigorosamente e siga todas as diretrizes ao atuar neste projeto.

---

## 1. Identidade e Propósito do Produto
- O **TechFitness** é uma plataforma premium, gamificada, responsiva e inteligente que conecta **Treinadores (Personal Trainers)** e **Alunos (Atletas)**.
- **Área do Treinador (`/trainer`):** Gestão de alunos, acompanhamento antropométrico, métricas de consistência, biblioteca de exercícios (+300) e geração de treinos periodizados via Copilot de IA (Gemini / OpenAI).
- **Área do Aluno (`/student`):** Execução de treinos ("Hora do Show"), cronômetro de descanso, gamificação RPG (XP, Níveis, Streaks, Conquistas, Liga dos Titãs), registro biométrico e treino em duplas/grupos com feed social de check-in.

---

## 2. Stack Tecnológica
- **Framework:** Next.js 16 (App Router, React 19).
  - Use React Server Components (RSC) por padrão para busca e renderização de dados.
  - Utilize Client Components (`"use client"`) **apenas** quando houver interatividade, hooks de estado (`useState`, `useEffect`) ou eventos de usuário.
- **Estilização:** Tailwind CSS v4 (Design system utilitário, nada de CSS isolado ou inline não padronizado).
- **Linguagem:** TypeScript 5 (**ESTRITAMENTE TIPADO**).
- **Ícones:** `lucide-react` exclusivamente. Não utilize Heroicons ou Material Icons.
- **Banco de Dados & ORM:** PostgreSQL (hospedado no Supabase) com **Prisma ORM 6**.
- **Autenticação:** NextAuth.js com JWT, hash bcrypt, RBAC (`STUDENT`, `TRAINER`, `ADMIN`) e auto-login pós-cadastro.

---

## 3. Padrões de Código e TypeScript (🚨 CRÍTICO)
- **Zero `any`:** É expressamente proibido o uso do tipo `any` ou deixar parâmetros de callbacks inferirem `any` implicitamente (exemplo: sempre declare explicitamente `.filter((item: ItemType) => ...)` ou tipagens de retorno de funções assíncronas). Isso evita quebras silenciosas no build da Vercel.
- **Interfaces e Tipos:** Defina interfaces claras e exportáveis para props de componentes, respostas de APIs (`src/app/api/...`), modelos de gamificação e contratos do Prisma.
- **Regra de Exportações no App Router:** Em arquivos de rota (`page.tsx` ou `layout.tsx`), **NÃO EXPORTE** funções, constantes ou tipos avulsos. O compilador do Next.js App Router falhará. Utilitários (ex: `TIER_CONFIG`, `getAchievementIcon`, formatadores de data) devem obrigatoriamente residir em `src/lib/` ou arquivos auxiliares de componentes.
- **Validação de Schemas:** Sempre valide payloads em rotas de API com Zod para proteção contra payloads maliciosos.

---

## 4. Ergonomia e Mobile First (Apple HIG & Material 3 / UX)
- **Bottom Navigation Dock:** Em smartphones (`sm:hidden`), as abas de navegação do aluno residem em uma barra inferior fixa (`fixed bottom-0 z-50`) com efeito glassmorphism (`bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-2xl`), respeitando as Safe Areas (`bottom-nav-safe`).
- **Lei de Fitts & Alvos de Toque:** Todo botão, link ou elemento clicável móvel deve ter altura e área mínima de toque de **44px a 48px** (`min-h-[44px]` ou `min-h-[48px]`).
- **Regra dos 16px no iOS Safari:** Inputs com tamanho de fonte menor que 16px (`text-xs`, `text-sm`) causam zoom forçado automático no iOS ao receber foco, quebrando a viewport. **SEMPRE** use `text-base md:text-sm` em todos os inputs de texto, e-mail, senhas e valores.
- **Teclados Nativos Inteligentes:** Configure atributos como `inputMode="decimal"` para pesos e números, e `inputMode="email"` / `autoCapitalize="none"` para e-mails.
- **Header Limpo no Mobile:** O canto superior direito do cabeçalho móvel deve conter apenas elementos essenciais (Avatar/Minha Conta e Notificações). Botões secundários como "Sair da Conta" **pertencem exclusivamente à tela de Perfil (`ProfileSettingsView`)**, evitando corte e overflow de tela em dispositivos menores.

---

## 5. Estética Visual e UI Disruptiva
- **Glassmorphism & Camadas:** Use `bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm`. Evite blocos opacos cinzas genéricos ou sombras duras.
- **Paleta de Cores Coesa:**
  - Primária / Ação: Azul elétrico (`#2563EB`, hover `#1D4ED8`).
  - Destaque / Acentos: Azul ciano (`#00C2FF`), Violeta suave.
  - Alertas / Destrutivo: Vermelho coral (`#EF4444`, fundo `bg-red-50`).
  - Textos: `#0F172A` (Slate 900) e `#64748B` (Slate 500).
- **Micro-interações:** Adicione feedback tátil em botões (`active:scale-95 transition-all duration-200`) e hover states sutis (`hover:border-[#2563EB]/40`).
- **Modularização de Arquivos:** Se uma tela ou componente ultrapassar 300-400 linhas, quebre-o imediatamente em subcomponentes na pasta `components/` correspondente.

---

## 6. Gamificação e Regras de Negócio
- Todo o núcleo de gamificação está isolado em `src/lib/gamification.ts`.
- **Níveis e XP:** 25 níveis com títulos imersivos (de *Iniciante* a *Lenda do Olimpo*).
- **Streaks:** Cálculo de consistência semanal contínua sem quebra.
- **Conquistas:** 4 Tiers progressivos (Bronze, Prata, Ouro, Diamante).
- Não altere a fórmula de cálculo sem coordenação explícita, pois ela mantém o equilíbrio de progressão de todos os usuários.

---

## 7. Banco de Dados e Migrações (Prisma)
- **Localização:** `prisma/schema.prisma`.
- Antes de qualquer alteração estrutural em models, analise as relações existentes (`User`, `StudentProfile`, `TrainerProfile`, `WorkoutPlan`, `WorkoutSession`, `ExerciseLog`, `WorkoutGroup`).
- Execute sempre `npx prisma format` antes de rodar `npx prisma db push`.
- Nunca delete colunas ou tabelas com dados de produção sem criar um script de migração seguro.

---

## 8. Skills Disponíveis no Projeto
Quando uma demanda exigir rigor específico, consulte as skills especializadas do projeto:
- **`especialista-ux`:** Auditoria ergonômica, Lei de Fitts, redução de atrito e fluxos em mobile.
- **`frontend-disruptivo`:** Elevação visual, gradientes, glassmorphism e animações premium.
- **`backend-resiliente`:** Rotas de API seguras, validações Zod, tratamentos de erro e transações Prisma.
- **`documentacao-automatica`:** Atualização contínua de README, diagramas Mermaid e arquitetura.
- **`conselho-ia`:** Reunião com 5 personas especialistas para dirimir impasses de arquitetura ou produto.
- **`auditoria-seguranca`:** Revisão profunda contra as 5 falhas críticas (IDOR, XSS, tokens expostos, etc.).

---

## 9. Contas Oficiais de Teste para IA & Automação (Sem Tentativas e Erros)
Para testes de interface, validações E2E, logins no navegador ou chamadas autenticadas, utilize **EXCLUSIVAMENTE** as duas contas oficiais de teste documentadas no arquivo local `test-credentials.json` (ignorado no Git). Nunca tente adivinhar credenciais de usuários reais:
- **Professor (Trainer):** `professor@gmail.com` | Senha: `123456`
- **Aluno (Student):** `aluno.teste@techfitness.com` | Senha: `123456`

---

*Seguindo rigorosamente este arquivo, garantimos que o TechFitness permaneça escalável, elegante, seguro e com código 100% tipado.*
