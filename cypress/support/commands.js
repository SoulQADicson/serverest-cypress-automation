import { productsApi } from '../services/productsApi'
import { usersApi } from '../services/usersApi'
import { byTestId, TEST_IDS } from '../constants/selectors'

Cypress.Commands.add('loginUi', (email, password) => {
  cy.get(byTestId(TEST_IDS.auth.email)).clear().type(email)
  cy.get(byTestId(TEST_IDS.auth.loginPassword)).clear().type(password, { log: false })
  cy.get(byTestId(TEST_IDS.auth.login)).click()
})

Cypress.Commands.add('loginUiSession', (email, password, expectedPath) => {
  cy.session(['ui-login', email], () => {
    cy.visit('/login')
    cy.loginUi(email, password)
    cy.location('pathname').should('eq', expectedPath)
  }, {
    validate() {
      cy.window().then(({ localStorage }) => {
        expect(localStorage.getItem('serverest/userToken')).to.be.a('string').and.not.be.empty
      })
    },
    cacheAcrossSpecs: false
  })
})

Cypress.Commands.add('deleteUserByEmail', (email) => {
  usersApi.findByEmail(email).then((response) => {
    expect(response.status).to.eq(200)
    const user = response.body.usuarios?.[0]
    if (user) usersApi.remove(user._id).its('status').should('eq', 200)
  })
})

Cypress.Commands.add('deleteUserById', (id) => {
  usersApi.remove(id).then((response) => {
    expect(response.status, `cleanup user ${id}: ${JSON.stringify(response.body)}`).to.eq(200)
  })
})

Cypress.Commands.add('deleteProductById', (id, token) => {
  productsApi.remove(id, token).then((response) => {
    expect(response.status, `cleanup product ${id}: ${JSON.stringify(response.body)}`).to.eq(200)
  })
})

Cypress.Commands.add('deleteProductByName', (name, token) => {
  productsApi.findByName(name).then((response) => {
    expect(response.status).to.eq(200)
    const product = response.body.produtos?.[0]
    if (product) productsApi.remove(product._id, token).its('status').should('eq', 200)
  })
})
