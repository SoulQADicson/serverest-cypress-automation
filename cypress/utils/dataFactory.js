const uniqueId = () => `${Date.now()}-${Cypress._.random(100000, 999999)}`

export const createUser = (overrides = {}) => {
  const id = uniqueId()
  return {
    nome: `QA Automation ${id}`,
    email: `qa.${id}@example.com`,
    password: `Qa@${id}`,
    administrador: 'false',
    ...overrides
  }
}

export const createInvalidCredentials = () => ({
  email: 'usuario.inexistente@example.com',
  password: 'senha-invalida'
})

export const createProduct = (overrides = {}) => {
  const id = uniqueId()
  return {
    nome: `Produto QA ${id}`,
    preco: 150,
    descricao: 'Produto criado pela automacao Cypress',
    quantidade: 10,
    ...overrides
  }
}
