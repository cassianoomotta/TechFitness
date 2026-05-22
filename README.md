# 🏋️ TechFitness

**O seu parceiro digital para treinos de alta performance.**

O **TechFitness** é uma plataforma moderna e inteligente para gestão de treinamentos físicos, desenhada para conectar personal trainers aos seus alunos através de uma experiência fluida, interativa e impulsionada por Inteligência Artificial.

---

## 💡 O que é o projeto?

Criamos o TechFitness pensando em três públicos diferentes. Encontre o seu abaixo:

### 👥 Para quem treina (Leigos / Alunos)
Sabe aquela ficha de papel amassada na academia ou aquele PDF difícil de ler no celular? O TechFitness é a evolução disso. É um aplicativo web onde você faz login e encontra exatamente o que precisa fazer no dia. 

Com ele você pode:
- **Acessar seus treinos** de forma interativa, sabendo exatamente as séries, repetições e o tempo de descanso.
- **Registrar seu progresso:** Anotar os pesos levantados em cada exercício e ver como sua força está aumentando com o passar das semanas.
- **Treino em Dupla (Duelo):** Tem um amigo na mesma consultoria? Você pode buscar seu parceiro e comparar (de forma saudável) quem está indo mais à academia ou levantando mais peso.
- **Ver vídeos e alternativas:** A máquina que você precisa usar está ocupada? O sistema sugere um exercício alternativo na hora para você não perder tempo!

### 🏆 Para os Profissionais de Saúde (Personal Trainers)
O TechFitness é o seu escritório de consultoria esportiva. O objetivo da plataforma é economizar horas do seu dia na hora de montar fichas e acompanhar resultados.

Com ele você pode:
- **Gerenciar seus alunos** em um painel único, acompanhando métricas de consistência, frequência e recordes (PRs) de cada um deles.
- **Prescrever treinos de forma ágil** através de uma biblioteca padronizada com mais de 300 exercícios estruturados por grupo muscular e equipamento.
- **Assistente de IA (Copilot):** Se estiver sem ideias ou com pressa, nossa Inteligência Artificial analisa o peso, as avaliações recentes e o objetivo do seu aluno para gerar e sugerir uma base de treino completa em poucos segundos.

### 💻 Para o pessoal de Tecnologia (Desenvolvedores)
Sob o capô, o TechFitness é uma aplicação web Full-Stack moderna focada em performance, design e segurança. 

**Stack Tecnológico:**
- **Frontend & Backend:** [Next.js 16](https://nextjs.org/) (App Router) + React.
- **Estilização:** Tailwind CSS v4 (utilizando glassmorphism, micro-interações e um design premium moderno).
- **Banco de Dados & ORM:** PostgreSQL (via [Prisma ORM](https://www.prisma.io/)).
- **Autenticação:** NextAuth.js com controle de papéis (Role-Based Access Control para `TRAINER` e `STUDENT`).
- **Inteligência Artificial:** Integração via API com modelos LLM (Google Gemini e OpenAI) implementando fallback inteligente (se a chave de um falhar, o sistema usa o outro ou cai graciosamente para um gerador de mocks).

---

## ✨ Principais Funcionalidades

1. **Dashboard do Treinador:** Visão geral de alunos ativos, fichas ativas, frequência média e novos recordes.
2. **Dashboard do Aluno:** Interface amigável focada no modo "Hora do show" para execução rápida dos exercícios no ambiente da academia.
3. **Construção de Treinos com IA:** Integração robusta que seleciona os melhores exercícios do banco de dados relacional baseado em "prompts" de biometria.
4. **Gamificação:** Comparação de métricas entre duplas de treino, estimulando a adesão.
5. **Biblioteca Extensa de Exercícios:** Possibilidade de sugerir alternativas para exercícios específicos quando o equipamento não estiver disponível.

---

## 🚀 Como rodar o projeto localmente

Se você deseja contribuir ou apenas rodar o projeto na sua máquina:

**1. Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/TechFitness.git
cd TechFitness
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Configure as Variáveis de Ambiente:**
Crie um arquivo `.env` na raiz do projeto contendo as seguintes chaves:
```env
DATABASE_URL="file:./dev.db" # Para desenvolvimento local em SQLite
NEXTAUTH_SECRET="sua_chave_secreta_aqui"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="sua_api_key_do_gemini" # Opcional (Para recursos de IA)
```

**4. Configure o Banco de Dados:**
Sincronize a estrutura do banco e povoe a biblioteca de exercícios padrão:
```bash
npx prisma db push
npx prisma db seed
```

**5. Inicie o Servidor Local:**
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o sistema rodando!
