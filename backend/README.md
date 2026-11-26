# ControlAbast — Backend API

API REST em Node.js + Express para o sistema **ControlAbast**, implementando o contrato descrito em [`../API_CONTRACT.md`](../API_CONTRACT.md).

## Requisitos

- Node.js `>= 20`

## Configuração

1. Copie `.env.example` para `.env` (já criado para desenvolvimento local) e ajuste as variáveis conforme necessário:

```env
PORT=3000
JWT_SECRET=controlabast-dev-secret-change-in-production
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:5173
DEFAULT_MASTER_PASSWORD=123456
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor:

```bash
npm run dev
```

Ou em produção:

```bash
npm start
```

A API ficará disponível em `http://localhost:3000/api`.

## Credenciais Iniciais (Seed)

Na primeira execução, os arquivos em `data/users.json` e `data/registros.json` são criados automaticamente com os usuários padrão:

| Crachá | Nome | Perfil | Senha inicial |
| --- | --- | --- | --- |
| `3014716` | Rafael Oliveira da Silva | `Master` | `123456` (ou `DEFAULT_MASTER_PASSWORD`) |
| `1000001` | Operador Padrão | `Operador` | `123456` |

## Rotas Principais

- `GET /api/health` — Status da API
- `POST /api/auth/login` — Autenticação com `{ cracha, senha }`
- `GET /api/auth/me` — Dados do usuário autenticado
- `GET /api/registros` — Lista lançamentos
- `POST /api/registros` — Cria lançamento de Abastecimento ou Resíduo
- `PUT /api/registros/:id` — Atualiza lançamento (requer token de administrador)
- `DELETE /api/registros/:id` — Remove lançamento (requer token de administrador)
