# Automacao ServeRest com Cypress

Suite de testes em Cypress e JavaScript para o [frontend ServeRest](https://front.serverest.dev/) e a [API ServeRest](https://serverest.dev/).

## Cobertura

### Frontend (3 cenarios)

1. Cadastro bem-sucedido de usuario comum.
2. Tentativa de login com credenciais invalidas.
3. Cadastro de produto por usuario administrador.

### API (3 cenarios)

1. `POST /usuarios`: cadastro bem-sucedido e validacao da resposta.
2. `POST /login`: rejeicao de credenciais invalidas.
3. `GET /produtos`: listagem e validacao do contrato dos produtos.

Os dados mutaveis recebem identificadores unicos. Usuarios e produtos criados pelos testes sao removidos ao final dos respectivos cenarios.

## Pre-requisitos

- Node.js 20 ou superior
- npm

## Instalacao e execucao

```bash
npm ci
npm test
```

Comandos adicionais:

```bash
npm run test:e2e  # somente frontend
npm run test:api  # somente API
npm run cy:open   # interface interativa
```

Nao sao necessarias credenciais ou variaveis secretas. As URLs publicas estao centralizadas em `cypress.config.js`.

## Estrutura

```text
cypress/
  e2e/api/         # testes da API
  e2e/frontend/    # testes do frontend
  pages/           # Page Objects
  support/         # comandos reutilizaveis e configuracao global
  utils/           # cliente de API e fabrica de dados
```

Falhas em modo headless geram screenshots em `cypress/screenshots/`. Videos foram desabilitados para manter a execucao leve.
