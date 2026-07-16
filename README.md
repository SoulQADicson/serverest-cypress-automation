# Automacao ServeRest com Cypress

Suite de testes em Cypress e JavaScript para o [frontend ServeRest](https://front.serverest.dev/) e a [API ServeRest](https://serverest.dev/).

## Cobertura

### Frontend (3 cenarios)

1. `CT01` - Cadastro bem-sucedido de usuário comum.
2. `CT02` - Tentativa de login com credenciais inválidas.
3. `CT03` - Cadastro de produto por usuário administrador.

### API (3 cenarios)

1. `CT04` - `POST /usuarios`: cadastro bem-sucedido e validação da resposta.
2. `CT05` - `POST /login`: rejeição de credenciais inválidas.
3. `CT06` - `GET /produtos`: listagem e validação do contrato dos produtos.

Os dados mutaveis recebem identificadores unicos. Usuarios e produtos criados pelos testes sao removidos ao final dos respectivos cenarios.

A estratégia e o vínculo dos casos com técnicas CTFL estão documentados na [matriz de cobertura](docs/test-coverage.md).

## Pre-requisitos

- Node.js 20 ou superior
- npm

## Instalacao e execucao

```bash
npm ci
npm test
```

Toda execução headless gera automaticamente:

- `reports/test-report.html`: relatório visual autocontido, com gráfico de aprovados, falhas e ignorados;
- `reports/test-results.json`: resultado estruturado para integração com outras ferramentas.

Comandos adicionais:

```bash
npm run test:e2e  # somente frontend
npm run test:api  # somente API
npm run test:report # suíte completa e relatório HTML
npm run cy:open   # interface interativa
npm run lint      # análise estática do JavaScript
npm run quality   # lint e suíte completa
```

Nao sao necessarias credenciais ou variaveis secretas. As URLs publicas estao centralizadas em `cypress.config.js`.

## Estrutura

```text
cypress/
  e2e/api/         # testes da API
  e2e/frontend/    # testes do frontend
  pages/           # Page Objects
  services/        # clientes de API separados por domínio
  schemas/         # contratos reutilizáveis das respostas
  constants/       # rotas e mensagens de negócio
  support/         # comandos reutilizaveis e configuracao global
  utils/           # fábrica de dados dinâmicos
docs/              # estratégia e matriz de cobertura CTFL
.github/workflows/ # pipeline de integração contínua
```

Falhas em modo headless geram screenshots em `cypress/screenshots/`. Vídeos foram desabilitados para manter a execução leve. O relatório é recriado a cada execução e não requer serviços externos nem dependências adicionais.
