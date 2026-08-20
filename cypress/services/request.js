const apiUrl = () => Cypress.expose('apiUrl')

const request = (options, failOnStatusCode) => cy.request({
  failOnStatusCode,
  log: options.log ?? true,
  ...options,
  url: `${apiUrl()}${options.url}`
})

// Positive requests fail immediately on an unexpected HTTP status. Negative
// scenarios must opt in explicitly so a missing assertion cannot pass silently.
export const apiRequest = (options) => request(options, true)
export const apiRequestAllowFailure = (options) => request(options, false)
