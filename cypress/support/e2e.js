import './commands'

beforeEach(() => {
  if (Cypress.spec.relative.includes('frontend')) {
    cy.clearCookies()
    cy.clearLocalStorage()
  }
})
