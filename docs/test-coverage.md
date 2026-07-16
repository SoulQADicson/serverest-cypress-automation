# Matriz de cobertura de testes

| ID | Nível | Funcionalidade | Classificação | Técnica CTFL | Resultado esperado |
|---|---|---|---|---|---|
| CT01 | E2E | Cadastro de usuário | Positivo | Particionamento de equivalência válido | Usuário cadastrado e autenticado |
| CT02 | E2E | Autenticação | Negativo | Particionamento de equivalência inválido | Acesso recusado e mensagem apresentada |
| CT03 | E2E | Cadastro de produto | Positivo | Transição de estado | Produto disponível na listagem administrativa |
| CT04 | API | `POST /usuarios` | Positivo | Particionamento de equivalência válido | HTTP 201 e contrato de criação válido |
| CT05 | API | `POST /login` | Negativo | Particionamento de equivalência inválido | HTTP 401 sem token de autorização |
| CT06 | API | `GET /produtos` | Positivo/contrato | Teste de contrato | HTTP 200 e todos os produtos com estrutura válida |

## Estratégia

- Os dados mutáveis são únicos para permitir execução repetida e paralela.
- Usuários e produtos criados são removidos nos hooks de teardown.
- As validações cobrem resposta HTTP, regra de negócio e contrato dos dados.
- Retries são aplicados somente no modo de execução para reduzir falsos negativos por instabilidade externa.
