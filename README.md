# 📅 AgendaFácil

> Sistema profissional de agendamento online para profissionais autônomos

## 🚀 Sobre o Projeto

AgendaFácil é uma plataforma completa de agendamento online que permite profissionais gerenciarem seus horários de forma eficiente e seus clientes agendarem serviços de forma simples e rápida.

### ✨ Funcionalidades

- 🎯 **Landing Page Moderna** - Página de apresentação com planos Essencial e Profissional
- 👤 **Sistema de Autenticação** - Login e cadastro seguro com Supabase Auth
- 📊 **Dashboard Profissional** - Visão geral de agendamentos e estatísticas em tempo real
- ⚙️ **Configurações Completas** - Gerenciamento de serviços, horários disponíveis e link personalizado
- 📅 **Página Pública de Agendamento** - Interface otimizada para clientes com seleção de serviço, data e horário
- 💳 **Integração com Mercado Pago** - Pagamentos e assinaturas via Edge Functions do Supabase
- 🎨 **Design Responsivo** - Funciona perfeitamente em desktop e mobile
- 🌓 **Tema Dark/Light** - Interface moderna com shadcn/ui e Tailwind CSS

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - React 18 com TypeScript
  - Vite (build tool)
  - Tailwind CSS
  - shadcn/ui (componentes)
  - React Router DOM
  - date-fns (manipulação de datas)

- **Backend:**
  - Supabase (PostgreSQL, Auth, Edge Functions)
  - Supabase Edge Functions (API serverless)

- **Pagamentos:**
  - Mercado Pago API
  - Supabase Edge Functions como proxy

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Mercado Pago (para pagamentos)

### Passo a Passo

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/agendafacil.git
cd agendafacil
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
VITE_MERCADOPAGO_PUBLIC_KEY=sua_chave_publica_do_mercadopago
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse: `http://localhost:8080`

## 🗄️ Banco de Dados

O projeto usa Supabase (PostgreSQL) com as seguintes tabelas:

- **profiles** - Dados dos profissionais
- **services** - Serviços oferecidos
- **available_hours** - Horários disponíveis
- **appointments** - Agendamentos
- **subscriptions** - Assinaturas (Mercado Pago)

As migrations estão em `supabase/migrations/`

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push para o GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático! ✨

### Outras opções

- Netlify
- Railway
- Render

## 📱 Como Usar

### Para Profissionais:

1. Acesse a landing page
2. Escolha um plano (Essencial ou Profissional)
3. Complete o cadastro
4. Configure seus serviços e horários
5. Compartilhe seu link de agendamento

### Para Clientes:

1. Acesse o link do profissional (ex: `/agendar/seu-nome`)
2. Escolha o serviço
3. Selecione data e horário
4. Preencha seus dados
5. Confirme o agendamento

## 🎨 Screenshots

*(Adicione prints da aplicação aqui)*

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

Desenvolvido com ❤️ por [Seu Nome]

## 🙏 Agradecimentos

- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Mercado Pago](https://www.mercadopago.com.br/) - Gateway de pagamento
- [Vercel](https://vercel.com/) - Hospedagem

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
