# Farolfix

Site institucional e de conversão para serviço de polimento de faróis automotivos em domicílio.

## Stack

- Next.js (App Router)
- Tailwind CSS
- Neon PostgreSQL (Database + Analytics)
- Web Push (notificações para o app instalado no celular do proprietário)
- Recharts (dashboard admin)
- Deploy recomendado: Vercel (free tier)

## Estrutura de pastas

```txt
/app
/components
/lib
/services
/styles
/supabase (SQL de criação das tabelas)
```

## Funcionalidades

- Landing page premium e responsiva (foco mobile/Instagram)
- Formulário de agendamento com:
  - Nome
  - Endereço
  - Telefone
  - Modelo do carro
- Envio para banco Neon
- Confirmação de agendamento direto no site (sem depender do WhatsApp)
- Tracking automático:
  - `acesso`: ao entrar no site
  - `agendamento`: ao enviar formulário
- Área `/admin` protegida por sessão de cookie (mock login)
- Admin mobile com:
  - ativação de notificações push
  - lista de agendamentos recentes
- Dashboard com:
  - Total de acessos
  - Total de agendamentos
  - Taxa de conversão
  - Gráficos diário, mensal e anual

## 1) Configuração Neon

1. Crie um projeto no Neon.
2. Execute o SQL em `supabase/schema.sql`.
3. Copie a string de conexão `DATABASE_URL`.
4. Configure `ADMIN_EMAIL` e `ADMIN_PASSWORD` para o acesso ao painel.
5. Gere as chaves VAPID para push:

```bash
npx web-push generate-vapid-keys
```

## 2) Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
DATABASE_URL=
ADMIN_EMAIL=admin@farolfix.com
ADMIN_PASSWORD=troque-esta-senha
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@farolfix.com
```

## 3) Rodar localmente

```bash
npm install
npm run dev
```

## 4) Deploy na Vercel (free)

1. Suba o repositório no GitHub.
2. Importe o projeto na Vercel.
3. Configure as mesmas variáveis de ambiente.
4. Faça deploy.

## Observações de performance e custo

- Projeto sem serviços pagos obrigatórios.
- Imagens mock locais com `next/image` e lazy loading.
- App Router e CSS enxuto para carregamento rápido.
- Tracking simples em tabela única de analytics para baixo custo operacional.
- Push notifications usando padrão Web Push (sem custo adicional no free tier).

## Como ativar app no celular do proprietário

1. Abra `/admin` no Chrome/Edge do celular.
2. Use **Adicionar à tela inicial**.
3. Dentro do admin, clique em **Ativar notificações**.
4. A partir daí, cada novo agendamento dispara alerta push no celular.
