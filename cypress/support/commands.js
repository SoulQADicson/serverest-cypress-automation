import { productsApi } from '../services/productsApi'
import { usersApi } from '../services/usersApi'

Cypress.Commands.add('loginUi', (email, password) => {
  cy.get('[data-testid="email"]').clear().type(email)
  cy.get('[data-testid="senha"]').clear().type(password, { log: false })
  cy.get('[data-testid="entrar"]').click()
})

Cypress.Commands.add('deleteUserByEmail', (email) => {
  usersApi.findByEmail(email).then((response) => {
    expect(response.status).to.eq(200)
    const user = response.body.usuarios?.[0]
    if (user) usersApi.remove(user._id).its('status').should('eq', 200)
  })
})

Cypress.Commands.add('deleteProductByName', (name, token) => {
  productsApi.findByName(name).then((response) => {
    expect(response.status).to.eq(200)
    const product = response.body.produtos?.[0]
    if (product) productsApi.remove(product._id, token).its('status').should('eq', 200)
  })
})
