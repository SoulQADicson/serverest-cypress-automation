import { loginPage } from '../../pages/LoginPage'
import { adminProductsPage } from '../../pages/AdminProductsPage'
import { api } from '../../utils/api'
import { createProduct, createUser } from '../../utils/dataFactory'

describe('Cadastro de produto no frontend', () => {
  let admin
  let product
  let token

  afterEach(() => {
    if (product && token) cy.deleteProductByName(product.nome, token)
    if (admin) cy.deleteUserByEmail(admin.email)
    admin = undefined
    product = undefined
    token = undefined
  })

  it('permite que um administrador cadastre um produto', () => {
    admin = createUser({ administrador: 'true' })
    product = createProduct()

    api.createUser(admin).its('status').should('eq', 201)
    api.login({ email: admin.email, password: admin.password }).then((response) => {
      expect(response.status).to.eq(200)
      token = response.body.authorization
    })

    loginPage.visit()
    loginPage.login(admin.email, admin.password)
    adminProductsPage.openCreation()
    cy.intercept('POST', '**/produtos').as('createProduct')
    adminProductsPage.create(product)

    cy.wait('@createProduct').then(({ response }) => {
      expect(response.statusCode).to.eq(201)
      expect(response.body).to.include({ message: 'Cadastro realizado com sucesso' })
      expect(response.body._id).to.be.a('string').and.not.be.empty
    })
    cy.url().should('include', '/admin/listarprodutos')
    cy.contains('td', product.nome).should('be.visible')
  })
})
