# Otimização de performance da suíte

## Primeira camada

Esta etapa reduz trabalho de infraestrutura sem remover testes, asserções, contratos ou técnicas CTFL. Os 61 casos e as 32 verificações críticas P0 permanecem inalterados.

### Alterações

- Carrinhos: setup completo apenas nos casos que precisam de administrador, produto e cliente.
- Produtos: administrador e token são criados somente nos cenários autenticados.
- Catálogo e lista: dados imutáveis são preparados uma vez por spec; cookies e local storage continuam isolados por teste.
- Cadastro de produtos: administrador reutilizado dentro do spec, com produtos limpos após cada cenário.
- Hooks globais: limpeza do navegador restrita aos specs de frontend.
- Encadeamento explícito: IDs e tokens são resolvidos antes das ações dependentes, evitando condições de corrida na fila do Cypress.

### Redução determinística de setup

| Área | Antes | Depois |
|---|---:|---:|
| Carrinhos — setups completos | 17 | 8 |
| Carrinhos — casos sem fixture | 0 | 6 |
| Produtos — administradores | 15 | 8 |
| Catálogo/lista — conjuntos completos | 5 | 1 |
| Cadastro de produtos — administradores | 3 | 1 |

## Validação

- ESLint: aprovado.
- Specs de carrinhos e produtos sem retries: 32/32 aprovados.
- Suíte consolidada: 61/61 aprovados.
- Críticos P0: 32/32 aprovados.
- Casos removidos ou ignorados: zero.

Na amostra consolidada, a duração registrada caiu de 219,8 segundos para aproximadamente 202 segundos, ganho próximo de 8%. Como os testes usam um ambiente público compartilhado, latência e carga externa impedem atribuir toda variação ao código. A redução de requisições de setup, entretanto, é determinística e diminui carga, custo e exposição a instabilidade.

Para um benchmark confiável, execute pelo menos cinco rodadas antes e cinco depois no mesmo período, compare a mediana e mantenha retries e infraestrutura idênticos.
