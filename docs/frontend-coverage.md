# Cobertura de testes do frontend

## Escopo e abordagem

O mapeamento foi feito sobre as jornadas disponíveis em `https://front.serverest.dev/` e priorizado por risco, conforme os fundamentos CTFL. A cobertura usa particionamento de equivalência, análise de valor limite, tabela de decisão, transição de estado e testes de caso de uso.

“Cobertura completa” neste projeto significa cobrir as classes de comportamento relevantes, os caminhos críticos e os principais resultados positivos e negativos. Não significa testar todas as combinações possíveis de valores.

## Matriz executável

| Domínio | Positivos | Negativos | Casos | Cobertura principal |
|---|---:|---:|---:|---|
| Autenticação e cadastro | 3 | 4 | 7 | Cadastro, login, logout, perfis, credenciais inválidas, duplicidade e obrigatoriedade |
| Administração de produtos | 1 | 2 | 3 | Cadastro, campos obrigatórios e nome duplicado |
| Catálogo | 1 | 1 | 2 | Pesquisa exata e produto inexistente |
| Lista de compras | 3 | 0 | 3 | Inclusão, alteração de quantidade, remoção e estado vazio |
| **Total UI** | **8** | **7** | **15** | Caminhos críticos disponíveis na interface |

As regras de autorização, contratos, CRUD completo, limites de estoque e carrinhos são cobertas em profundidade na camada de API. Isso evita duplicação excessiva na UI e mantém a pirâmide de testes sustentável.

## Estratégia de seletores

Ordem de preferência adotada:

1. `data-testid`, centralizado em `cypress/constants/selectors.js`;
2. dado de negócio único e visível, como o nome do produto;
3. texto de mensagem apenas quando a própria mensagem é o resultado esperado;
4. classes CSS somente para delimitar um componente sem identificador estável.

O catálogo não oferece `data-testid` no título nem um identificador por card. Por isso, o teste encontra o nome único do produto e usa `.closest('.card')` apenas para associar o botão “Adicionar à lista” ao produto correto. Essa é uma limitação conhecida do frontend; a melhoria recomendada no produto é expor, por exemplo, `data-testid="product-card-<id>"`.

Não são usados seletores posicionais (`:nth-child`), XPath, classes de estilo para ações, esperas fixas ou IDs gerados dinamicamente.

## Lacunas fora da automação UI

- Os relatórios administrativos aparecem como funcionalidade em construção.
- A listagem administrativa de usuários/produtos não oferece identificadores estáveis em todas as linhas e ações.
- Regras profundas de carrinho, estoque e autorização permanecem na API, onde são mais rápidas e determinísticas.
- Acessibilidade, desempenho, responsividade visual e segurança especializada exigem ferramentas e critérios próprios; não são substituídos por testes funcionais Cypress.
