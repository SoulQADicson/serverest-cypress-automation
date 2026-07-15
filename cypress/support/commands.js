import { api } from '../utils/api'

Cypress.Commands.add('loginUi', (email, password) => {
  cy.get('[data-testid="email"]').clear().type(email)
  cy.get('[data-testid="senha"]').clear().type(password, { log: false })
  cy.get('[data-testid="entrar"]').click()
})

Cypress.Commands.add('deleteUserByEmail', (email) => {
  api.findUserByEmail(email).then((response) => {
    const user = response.body.usuarios?.[0]
    if (user) api.deleteUser(user._id)
  })
})

Cypress.Commands.add('deleteProductByName', (name, token) => {
  api.findProductByName(name).then((response) => {
    const product = response.body.produtos?.[0]
    if (product) api.deleteProduct(product._id, token)
  })
})
