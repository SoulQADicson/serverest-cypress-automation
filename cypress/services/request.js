const apiUrl = () => Cypress.expose('apiUrl')

export const apiRequest = (options) => cy.request({
  failOnStatusCode: false,
  ...options,
  url: `${apiUrl()}${options.url}`
})
