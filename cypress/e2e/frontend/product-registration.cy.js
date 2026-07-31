import { loginPage } from '../../pages/LoginPage'
import { adminProductsPage } from '../../pages/AdminProductsPage'
import { MESSAGES } from '../../constants/messages'
import { UI_ROUTES } from '../../constants/routes'
import { authenticationApi } from '../../services/authenticationApi'
import { usersApi } from '../../services/usersApi'
import { productsApi } from '../../services/productsApi'
import { createProduct, createUser } from '../../utils/dataFactory'

describe('Frontend product registration', () => {
  let admin
  let product
  let token

  before(() => {
    admin = createUser({ administrador: 'true' })
    usersApi.create(admin).its('status').should('eq', 201)
    authenticationApi.login({ email: admin.email, password: admin.password }).then((response) => {
      expect(response.status).to.eq(200)
      token = response.body.authorization
    })
  })

  afterEach(() => {
    if (product) cy.deleteProductByName(product.nome, token)
    product = undefined
  })

  after(() => {
    if (admin) cy.deleteUserByEmail(admin.email)
  })

  it('CT-UI-PRD-001 - Register a new product as an administrator', () => {
    product = createProduct()

    loginPage.visit()
    loginPage.login(admin.email, admin.password)
    adminProductsPage.openCreation()
    cy.intercept('POST', '**/produtos').as('createProduct')
    adminProductsPage.create(product)

    cy.wait('@createProduct').then(({ response }) => {
      expect(response.statusCode).to.eq(201)
      expect(response.body).to.include({ message: MESSAGES.CREATED_SUCCESSFULLY })
      expect(response.body._id).to.be.a('string').and.not.be.empty
    })
    cy.url().should('include', UI_ROUTES.ADMIN_PRODUCTS)
    cy.contains('td', product.nome).should('be.visible')
  })

  it('CT-UI-PRD-002 - Validate required product fields before submission', () => {
    loginPage.visit()
    loginPage.login(admin.email, admin.password)
    adminProductsPage.openCreation()
    adminProductsPage.submit()

    adminProductsPage.requiredFieldsShouldBeInvalid()
    cy.url().should('include', '/admin/cadastrarprodutos')
  })

  it('CT-UI-PRD-003 - Prevent registration of a duplicated product', () => {
    product = createProduct()

    productsApi.create(product, token).its('status').should('eq', 201)

    loginPage.visit()
    loginPage.login(admin.email, admin.password)
    adminProductsPage.openCreation()
    adminProductsPage.create(product)

    cy.contains(MESSAGES.PRODUCT_ALREADY_EXISTS).should('be.visible')
    cy.url().should('include', '/admin/cadastrarprodutos')
  })
})
