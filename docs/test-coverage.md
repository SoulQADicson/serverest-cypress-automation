# Estratégia e matriz de cobertura

## Objetivo

Esta suíte protege os caminhos críticos da loja ServeRest com uma abordagem baseada em risco. A API concentra a maior parte das regras de negócio e contratos; a interface cobre jornadas essenciais do usuário e do administrador.

O catálogo executável está em `cypress/fixtures/testCatalog.json`. Cada teste possui:

- identificador estável;
- camada (`API` ou `UI`);
- domínio funcional;
- prioridade baseada em risco (`P0` crítico e `P1` alto);
- técnica de projeto de teste alinhada aos fundamentos CTFL;
- risco de produto mitigado.

Essas informações são incorporadas automaticamente ao relatório HTML.

## Cobertura por domínio

| Domínio | API | UI | Regras cobertas |
|---|---:|---:|---|
| Autenticação | 3 | 5 | Login válido, credenciais inválidas, campos obrigatórios, cadastro, duplicidade e logout |
| Usuários | 11 | Integrado à autenticação | CRUD, campos inválidos, IDs, recurso inexistente, unicidade, upsert e filtros |
| Produtos | 15 | 1 | CRUD, limites, IDs, recurso inexistente, token, perfil, duplicidade, carrinho ativo e filtros |
| Carrinhos | 17 | Coberto pela regra na API | Criação, totais, estoque, autenticação, IDs, produtos inválidos/duplicados, carrinho inexistente, cancelamento e conclusão |
| **Total** | **46** | **15** | **61 casos automatizados** |

## Caminhos críticos P0

1. Cadastro e autenticação do cliente.
2. Rejeição de credenciais inválidas.
3. Encerramento de sessão.
4. Autorização exclusiva de administrador para manutenção de produtos.
5. Cadastro e manutenção do catálogo.
6. Criação do carrinho com cálculo de totais.
7. Redução de estoque na reserva.
8. Bloqueio de compra acima do estoque.
9. Cancelamento com reposição de estoque.
10. Conclusão da compra sem reposição de estoque.

## Técnicas CTFL aplicadas

| Técnica | Aplicação |
|---|---|
| Particionamento de equivalência | Credenciais, filtros, dados válidos e inválidos |
| Análise de valor limite | Quantidade solicitada imediatamente acima do estoque |
| Tabela de decisão | Token ausente, usuário padrão, administrador e recursos duplicados |
| Transição de estado | Criar/alterar/excluir recursos, reservar/restaurar/consumir estoque |
| Teste de caso de uso | Jornadas completas de cadastro, login, produto, carrinho e compra |

## Princípios de manutenção

- Dados mutáveis recebem identificadores únicos para permitir repetição e reduzir colisões no ambiente público.
- Usuários, produtos e carrinhos criados pela automação são removidos nos hooks de teardown.
- Serviços de API centralizam rotas e autenticação.
- Page Objects encapsulam seletores estáveis `data-testid`.
- Schemas reutilizáveis validam estrutura, tipos e invariantes.
- Os testes verificam status HTTP, contrato, regra de negócio e efeito persistido.
- O relatório diferencia cobertura planejada de casos efetivamente executados.
- Retries são usados apenas no modo headless por causa da dependência de um ambiente público externo.

## Limitações conhecidas

O ambiente `serverest.dev` é público e compartilhado. Dados podem ser alterados por outras execuções, e a disponibilidade da rede não está sob controle da suíte. Para pipelines de maior criticidade, prefira executar uma instância isolada e versionada do ServeRest.
