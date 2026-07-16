import { loginPage } from '../../pages/LoginPage'
import { adminProductsPage } from '../../pages/AdminProductsPage'
import { MESSAGES } from '../../constants/messages'
import { UI_ROUTES } from '../../constants/routes'
import { authenticationApi } from '../../services/authenticationApi'
import { usersApi } from '../../services/usersApi'
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

  it("CT03 - 'Cadastrar um novo produto como usuário administrador'", () => {
    // Arrange
    admin = createUser({ administrador: 'true' })
    product = createProduct()

    usersApi.create(admin).its('status').should('eq', 201)
    authenticationApi.login({ email: admin.email, password: admin.password }).then((response) => {
      expect(response.status).to.eq(200)
      token = response.body.authorization
    })

    // Act
    loginPage.visit()
    loginPage.login(admin.email, admin.password)
    adminProductsPage.openCreation()
    cy.intercept('POST', '**/produtos').as('createProduct')
    adminProductsPage.create(product)

    // Assert
    cy.wait('@createProduct').then(({ response }) => {
      expect(response.statusCode).to.eq(201)
      expect(response.body).to.include({ message: MESSAGES.CREATED_SUCCESSFULLY })
      expect(response.body._id).to.be.a('string').and.not.be.empty
    })
    cy.url().should('include', UI_ROUTES.ADMIN_PRODUCTS)
    cy.contains('td', product.nome).should('be.visible')
  })
})
