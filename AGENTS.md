<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🏋️ TechFitness - Contexto Principal para IA
Este arquivo é o seu contexto central (Fonte de Verdade). Leia-o rigorosamente e siga todas as diretrizes ao atuar neste projeto.

## 1. Identidade e Propósito
- O **TechFitness** é uma plataforma premium, gamificada e intuitiva que conecta Treinadores e Alunos (Atletas).
- **Treinadores:** Criam treinos, gerenciam métricas de alunos, enviam planos guiados (e com IA).
- **Alunos:** Recebem as fichas, executam treinos, comparam resultados e ganham XP / Conquistas.

## 2. Stack Tecnológica Base
- **Framework:** Next.js (App Router, React Server Components onde aplicável, Client Components (`"use client"`) apenas quando houver interatividade/hooks).
- **Estilização:** Tailwind CSS (Padrão visual premium, utilitários, nada de CSS isolado).
- **Linguagem:** TypeScript (ESTRITAMENTE TIPADO).
- **Ícones:** `lucide-react` (Não use Material Icons ou Heroicons).
- **Banco de Dados:** PostgreSQL com **Prisma ORM**.

## 3. Padrões de Código e TypeScript (🚨 CRÍTICO)
- **Zero "any":** É expressamente proibido o uso de `any` ou deixar variáveis e parâmetros de callbacks inferirem `any` implicitamente (ex: use `.filter((item: ItemType) => ...)` ao invés de `.filter(item => ...)` para evitar falhas de build na Vercel).
- **Interfaces e Tipos:** Defina interfaces claras para todos os props de componentes, objetos de gamificação, retornos de API e tipagens do Prisma.
- **Exportações no Next.js:** Em arquivos de roteamento de página (`page.tsx` ou `layout.tsx`), você **NÃO DEVE** exportar funções ou constantes soltas, pois o Next.js falhará na validação do App Router. Utilitários (como `TIER_CONFIG` ou `getAchievementIcon`) devem morar em `src/lib/` ou arquivos próprios (ex: `gamification-ui.tsx`).

## 4. Estética e UI Premium (Frontend Disruptivo)
- **Aparência Premium:** Aplique paletas maduras, backgrounds em gradiente sutil, bordas semi-transparentes e "Glassmorphism" (`bg-white/50 backdrop-blur-md`). Evite painéis de "bloco sólido" maçantes.
- **Micro-interações:** Use hover states refinados (`hover:scale-105`, `transition-all duration-300`, anéis de brilho) em botões, cartões de conquista e checkpoints.
- **Modularização:** Se um arquivo (como o antigo `dashboard/page.tsx`) ultrapassar 300-400 linhas, separe a interface visual em `components/NomeTab.tsx`.

## 5. Gamificação e Regras de Negócio
- Todo o motor de cálculo lógico (cálculo de Streak, XP, Níveis, Tiers de Achievements) está encapsulado em `src/lib/gamification.ts`. Modifique esse núcleo apenas em coordenação explícita, pois ele dita o RPG do projeto.
- XP e Tiers vão de 1 a 4. Sempre traga um aspecto imersivo para o front-end ao renderizar recompensas.

## 6. Operações de Banco de Dados (Prisma)
- Ao interagir com o modelo de dados, primeiro valide o `schema.prisma`. 
- Qualquer migração de estrutura deve rodar `npx prisma format` e a migração correspondente. Não apague ou drope o banco levianamente em produção.

*Compreendido esse arquivo, aplique sempre o princípio de menor verbosidade, focando em entregar código limpo, elegante e 100% tipado.*
