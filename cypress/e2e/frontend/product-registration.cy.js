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

    cy.loginUiSession(admin.email, admin.password, UI_ROUTES.ADMIN_HOME)
    cy.visit(UI_ROUTES.ADMIN_HOME)
    adminProductsPage.openCreation()
    cy.intercept('POST', '**/produtos').as('createProduct')
    adminProductsPage.create(product)

    cy.wait('@createProduct').then(({ response }) => {
      expect(response.statusCode).to.eq(201)
      expect(response.body).to.include({ message: MESSAGES.CREATED_SUCCESSFULLY })
      expect(response.body._id).to.be.a('string').and.not.be.empty
    })
    cy.location('pathname').should('eq', UI_ROUTES.ADMIN_PRODUCTS)
    cy.contains('td', product.nome).should('be.visible')
  })

  it('CT-UI-PRD-002 - Validate required product fields before submission', () => {
    cy.loginUiSession(admin.email, admin.password, UI_ROUTES.ADMIN_HOME)
    cy.visit(UI_ROUTES.ADMIN_HOME)
    adminProductsPage.openCreation()
    adminProductsPage.submit()

    adminProductsPage.requiredFieldsShouldBeInvalid()
    cy.location('pathname').should('eq', UI_ROUTES.ADMIN_CREATE_PRODUCTS)
  })

  it('CT-UI-PRD-003 - Prevent registration of a duplicated product', () => {
    product = createProduct()

    productsApi.create(product, token).its('status').should('eq', 201)

    cy.loginUiSession(admin.email, admin.password, UI_ROUTES.ADMIN_HOME)
    cy.visit(UI_ROUTES.ADMIN_HOME)
    adminProductsPage.openCreation()
    adminProductsPage.create(product)

    cy.contains(MESSAGES.PRODUCT_ALREADY_EXISTS).should('be.visible')
    cy.location('pathname').should('eq', UI_ROUTES.ADMIN_CREATE_PRODUCTS)
  })
})
