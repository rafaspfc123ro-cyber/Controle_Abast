# Contrato da API REST — ControlAbast

Este documento descreve todas as rotas, métodos HTTP, headers e payloads JSON consumidos pelo frontend **ControlAbast** (Vue 3 + Vite + Pinia).

## Configuração Base

- **Variável de ambiente:** `VITE_API_URL` (definida em `frontend/.env` e `frontend/.env.example`)
- **Valor padrão local:** `http://localhost:3000/api`
- **Cliente HTTP:** `frontend/src/services/api.js` (wrapper baseado em `fetch` nativo)

### Headers Padrão

Todas as requisições enviam:

```http
Accept: application/json
```

Requisições com corpo JSON (`POST`, `PUT`, `PATCH`) enviam adicionalmente:

```http
Content-Type: application/json
```

Quando há um token salvo no `localStorage` (`controlabast_token`), o cliente injeta automaticamente:

```http
Authorization: Bearer <token>
```

### Tratamento de Erros e `401 Unauthorized`

- Qualquer resposta com status **`401 Unauthorized`** faz o frontend limpar automaticamente `controlabast_token`, `controlabast_user` (e a chave legada `controlabast_admin_ativo`) do `localStorage`, além de redefinir o estado da sessão na store `auth`.
- Para respostas `4xx` / `5xx`, o frontend lê a mensagem de erro nos campos `message`, `error` ou `msg` do JSON de resposta:

```json
{
  "message": "Descrição legível do erro ocorrido."
}
```

---

## 1. Autenticação

### `POST /auth/login`

Autentica o usuário a partir do crachá e senha informados no modal de login (`ModalLogin.vue` → `useAuthStore().login()`).

- **Headers necessários:**
  - `Accept: application/json`
  - `Content-Type: application/json`
- **Autenticação prévia:** Não requerida.

#### Request Body (JSON)

```json
{
  "cracha": "3014716",
  "senha": "********"
}
```

#### Response `200 OK` (JSON)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "cracha": "3014716",
    "nome": "Rafael Oliveira da Silva",
    "perfil": "Master",
    "isMaster": true
  }
}
```

> **Observações de compatibilidade do frontend:**
> - O cliente aceita `token` ou `accessToken`, e `usuario` ou `user`.
> - O perfil é usado para controlar acesso às telas administrativas (`/cadastros`, `/usuarios` e ações de edição/exclusão): se `usuario.perfil` (ou `usuario.role`) for `"operador"` (case-insensitive), o usuário é tratado como autenticado sem privilégios de administrador (`isAdmin = false`); qualquer outro perfil concede acesso administrativo (`isAdmin = true`).

#### Response `401 Unauthorized` (JSON)

```json
{
  "message": "Crachá ou senha inválidos."
}
```

---

## 2. Registros (Abastecimentos e Resíduos)

Consumido por `src/stores/registros.js` (`fetchRegistros`, `adicionarRegistro`, `atualizarRegistro`, `excluirRegistro`) e pelas telas `Inicio.vue`, `AbastecimentoForm.vue`, `ResiduoForm.vue`, `Registros.vue` e `Cadastros.vue`.

### Estrutura do Objeto Registro

| Campo | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `id` | `number \| string` | Identificador único do registro gerado pelo backend | `1` |
| `tipo` | `string` | Tipo da movimentação (`"Abastecimento"` ou `"Resíduo"`) | `"Abastecimento"` |
| `dataHora` | `string` | Data e hora no formato brasileiro `DD/MM/YYYY HH:mm` | `"26/11/2026 11:30"` |
| `cracha` | `string` | Número do crachá do operador responsável pelo lançamento | `"3014716"` |
| `nome` | `string` | Rótulo de exibição do operador | `"Crachá 3014716"` |
| `marca` | `string` | Nome da marca associada ao lançamento | `"NIKE"` |
| `celula` | `string` | Nome/código da célula de produção (em maiúsculas) | `"CELULA 01"` |
| `produto` | `string` | Nome do produto químico | `"Adesivo PU"` |
| `qtd` | `number` | Quantidade em Kg ou Litros | `12.5` |
| `valorUnitario` | `number` | Valor unitário do produto no momento do lançamento | `45.9` |
| `valorTotal` | `number` | Custo total calculado (`qtd * valorUnitario`, ou `0` na edição de resíduo) | `573.75` |

---

### `GET /registros`

Lista todos os lançamentos de abastecimento e resíduo.

- **Headers necessários:**
  - `Accept: application/json`
  - `Authorization: Bearer <token>` *(enviado automaticamente quando houver sessão ativa)*
- **Query Params:** Opcionais (repassados caso `fetchRegistros(params)` receba parâmetros).

#### Response `200 OK` (JSON)

O frontend aceita um array diretamente ou encapsulado em `{ "data": [...] }` / `{ "registros": [...] }`:

```json
[
  {
    "id": 1,
    "tipo": "Abastecimento",
    "dataHora": "26/11/2026 11:30",
    "cracha": "3014716",
    "nome": "Crachá 3014716",
    "marca": "NIKE",
    "celula": "CELULA 01",
    "produto": "Adesivo PU",
    "qtd": 12.5,
    "valorUnitario": 45.9,
    "valorTotal": 573.75
  },
  {
    "id": 2,
    "tipo": "Resíduo",
    "dataHora": "26/11/2026 14:15",
    "cracha": "3014716",
    "nome": "Crachá 3014716",
    "marca": "FILA",
    "celula": "CELULA 03",
    "produto": "Solvente Limpeza",
    "qtd": 3.2,
    "valorUnitario": 22.0,
    "valorTotal": 70.4
  }
]
```

---

### `POST /registros`

Cria um novo lançamento de **Abastecimento** ou **Resíduo** (disparado por `Inicio.vue`, `AbastecimentoForm.vue` e `ResiduoForm.vue`).

- **Headers necessários:**
  - `Accept: application/json`
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` *(enviado automaticamente quando houver sessão ativa)*

#### Request Body (JSON) — Exemplo Abastecimento

```json
{
  "tipo": "Abastecimento",
  "dataHora": "26/11/2026 11:30",
  "cracha": "3014716",
  "marca": "NIKE",
  "celula": "CELULA 01",
  "produto": "Adesivo PU",
  "qtd": 12.5,
  "valorUnitario": 45.9,
  "valorTotal": 573.75,
  "nome": "Crachá 3014716"
}
```

#### Request Body (JSON) — Exemplo Resíduo

```json
{
  "tipo": "Resíduo",
  "dataHora": "26/11/2026 14:15",
  "cracha": "3014716",
  "marca": "FILA",
  "celula": "CELULA 03",
  "produto": "Solvente Limpeza",
  "qtd": 3.2,
  "valorUnitario": 22.0,
  "valorTotal": 70.4,
  "nome": "Crachá 3014716"
}
```

#### Response `201 Created` (JSON)

O frontend aceita o objeto criado diretamente ou encapsulado em `{ "registro": { ... } }` / `{ "data": { ... } }`:

```json
{
  "id": 10,
  "tipo": "Abastecimento",
  "dataHora": "26/11/2026 11:30",
  "cracha": "3014716",
  "marca": "NIKE",
  "celula": "CELULA 01",
  "produto": "Adesivo PU",
  "qtd": 12.5,
  "valorUnitario": 45.9,
  "valorTotal": 573.75,
  "nome": "Crachá 3014716"
}
```

---

### `PUT /registros/:id`

Atualiza os dados de um lançamento existente a partir do modal de edição em `Registros.vue` (`atualizarRegistro(id, dados)`).

- **Headers necessários:**
  - `Accept: application/json`
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Parâmetro de rota:**
  - `id`: ID do registro a ser atualizado.

#### Request Body (JSON)

```json
{
  "tipo": "Abastecimento",
  "dataHora": "26/11/2026 11:30",
  "marca": "NIKE",
  "celula": "CELULA 01",
  "produto": "Adesivo PU",
  "qtd": 15,
  "valorUnitario": 45.9,
  "valorTotal": 688.5,
  "cracha": "3014716",
  "nome": "Crachá 3014716"
}
```

#### Response `200 OK` (JSON)

O frontend aceita o objeto atualizado diretamente ou encapsulado em `{ "registro": { ... } }` / `{ "data": { ... } }`:

```json
{
  "id": 10,
  "tipo": "Abastecimento",
  "dataHora": "26/11/2026 11:30",
  "marca": "NIKE",
  "celula": "CELULA 01",
  "produto": "Adesivo PU",
  "qtd": 15,
  "valorUnitario": 45.9,
  "valorTotal": 688.5,
  "cracha": "3014716",
  "nome": "Crachá 3014716"
}
```

---

### `DELETE /registros/:id`

Remove um lançamento existente após confirmação em `ModalConfirmarExclusao.vue` (`excluirRegistro(id)`).

- **Headers necessários:**
  - `Accept: application/json`
  - `Authorization: Bearer <token>`
- **Parâmetro de rota:**
  - `id`: ID do registro a ser excluído.

#### Response `200 OK` ou `204 No Content`

```json
{
  "message": "Lançamento excluído com sucesso."
}
```

*(Caso o backend retorne `204 No Content` com corpo vazio, o cliente HTTP trata como sucesso.)*
