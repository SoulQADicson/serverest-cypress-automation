import { catalogPage } from '../../pages/CatalogPage'
import { shoppingListPage } from '../../pages/ShoppingListPage'
import { authenticationApi } from '../../services/authenticationApi'
import { productsApi } from '../../services/productsApi'
import { usersApi } from '../../services/usersApi'
import { createProduct, createUser } from '../../utils/dataFactory'
import { UI_ROUTES } from '../../constants/routes'

describe('Frontend catalog and shopping list', () => {
  let customer
  let admin
  let product
  let adminToken

  before(() => {
    customer = createUser()
    admin = createUser({ administrador: 'true' })
    product = createProduct({ quantidade: 2 })

    usersApi.create(customer).its('status').should('eq', 201)
    usersApi.create(admin).its('status').should('eq', 201)
    authenticationApi.login({ email: admin.email, password: admin.password }).then((response) => {
      adminToken = response.body.authorization
      return productsApi.create(product, adminToken)
    }).its('status').should('eq', 201)

  })

  beforeEach(() => {
    cy.loginUiSession(customer.email, customer.password, UI_ROUTES.HOME)
    cy.visit(UI_ROUTES.HOME)
  })

  after(() => {
    if (product && adminToken) cy.deleteProductByName(product.nome, adminToken)
    if (customer) cy.deleteUserByEmail(customer.email)
    if (admin) cy.deleteUserByEmail(admin.email)
  })

  it('CT-UI-CAT-001 - Find an existing product by its exact name', () => {
    catalogPage.search(product.nome)

    catalogPage.product(product.nome).should('be.visible')
  })

  it('CT-UI-CAT-002 - Return no product for an unknown search term', () => {
    catalogPage.search(`inexistente-${Date.now()}`)

    cy.contains(/Nenhum produto foi encontrado/).should('be.visible')
  })

  it('CT-UI-LST-001 - Add a product to the shopping list', () => {
    catalogPage.search(product.nome)
    catalogPage.addToShoppingList(product.nome)

    shoppingListPage.productName(product.nome).should('be.visible')
    shoppingListPage.quantity().should('contain.text', '1')
  })

  it('CT-UI-LST-002 - Increase and decrease quantity within available stock', () => {
    catalogPage.search(product.nome)
    catalogPage.addToShoppingList(product.nome)

    shoppingListPage.increase()
    shoppingListPage.quantity().should('contain.text', '2')
    shoppingListPage.decrease()
    shoppingListPage.quantity().should('contain.text', '1')
  })

  it('CT-UI-LST-003 - Clear the list and present the empty state', () => {
    catalogPage.search(product.nome)
    catalogPage.addToShoppingList(product.nome)
    shoppingListPage.clear()

    shoppingListPage.emptyMessage().should('be.visible')
    shoppingListPage.productName(product.nome).should('not.exist')
  })
})
