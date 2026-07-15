const apiUrl = () => Cypress.env('apiUrl')

const request = (options) => cy.request({ failOnStatusCode: false, ...options })

export const api = {
  createUser: (user) => request({ method: 'POST', url: `${apiUrl()}/usuarios`, body: user }),
  findUserByEmail: (email) => request({ url: `${apiUrl()}/usuarios`, qs: { email } }),
  deleteUser: (id) => request({ method: 'DELETE', url: `${apiUrl()}/usuarios/${id}` }),
  login: (credentials) => request({ method: 'POST', url: `${apiUrl()}/login`, body: credentials }),
  findProductByName: (nome) => request({ url: `${apiUrl()}/produtos`, qs: { nome } }),
  deleteProduct: (id, token) => request({
    method: 'DELETE',
    url: `${apiUrl()}/produtos/${id}`,
    headers: { authorization: token }
  })
}
