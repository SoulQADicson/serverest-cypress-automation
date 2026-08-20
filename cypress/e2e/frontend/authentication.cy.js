import { loginPage } from '../../pages/LoginPage'
import { registerPage } from '../../pages/RegisterPage'
import { headerComponent } from '../../pages/components/HeaderComponent'
import { MESSAGES } from '../../constants/messages'
import { UI_ROUTES } from '../../constants/routes'
import { createInvalidCredentials, createProduct, createUser } from '../../utils/dataFactory'
import { usersApi } from '../../services/usersApi'
import { byTestId, TEST_IDS } from '../../constants/selectors'
import { adminProductsPage } from '../../pages/AdminProductsPage'
import { productsApi } from '../../services/productsApi'

describe('Frontend authentication', () => {
  let createdUser

  afterEach(() => {
    if (createdUser) cy.deleteUserByEmail(createdUser.email)
    createdUser = undefined
  })

  it('CT-UI-AUTH-001 - Register a new standard user with valid data', () => {
    createdUser = createUser()
    cy.intercept('POST', '**/usuarios').as('createUser')

    loginPage.visit()
    loginPage.openRegistration()
    registerPage.register(createdUser)

    cy.wait('@createUser').its('response.statusCode').should('eq', 201)
    cy.location('pathname').should('eq', UI_ROUTES.HOME)
    headerComponent.logoutButton().should('be.visible')
  })

  it('CT-UI-AUTH-002 - Prevent access with invalid credentials', () => {
    const { email, password } = createInvalidCredentials()

    loginPage.visit()
    loginPage.login(email, password)

    cy.contains(MESSAGES.INVALID_CREDENTIALS).should('be.visible')
    cy.location('pathname').should('eq', UI_ROUTES.LOGIN)
  })

  it('CT-UI-AUTH-003 - Authenticate a registered standard user and logout securely', () => {
    createdUser = createUser()
    usersApi.create(createdUser).its('status').should('eq', 201)

    loginPage.visit()
    loginPage.login(createdUser.email, createdUser.password)

    cy.location('pathname').should('eq', UI_ROUTES.HOME)
    headerComponent.logoutButton().should('be.visible').click()
    cy.location('pathname').should('eq', UI_ROUTES.LOGIN)
    cy.window().then(({ localStorage }) => {
      expect(localStorage.getItem('serverest/userToken')).to.eq(null)
    })
    cy.visit(UI_ROUTES.HOME)
    cy.location('pathname').should('eq', UI_ROUTES.LOGIN)
    cy.get(byTestId(TEST_IDS.auth.login)).should('be.visible')
  })

  it('CT-UI-AUTH-004 - Prevent registration with an email that is already in use', () => {
    createdUser = createUser()
    usersApi.create(createdUser).its('status').should('eq', 201)

    loginPage.visit()
    loginPage.openRegistration()
    registerPage.register(createdUser)

    cy.contains(MESSAGES.EMAIL_ALREADY_USED).should('be.visible')
    cy.location('pathname').should('eq', UI_ROUTES.REGISTER)
  })

  it('CT-UI-AUTH-005 - Validate required registration fields before submission', () => {
    loginPage.visit()
    loginPage.openRegistration()
    registerPage.submit()

    registerPage.requiredFieldsShouldBeInvalid()
    cy.location('pathname').should('eq', UI_ROUTES.REGISTER)
  })

  it('CT-UI-AUTH-006 - Validate required login fields before authentication', () => {
    loginPage.visit()
    loginPage.submit()

    loginPage.requiredFieldsShouldBeInvalid()
    cy.location('pathname').should('eq', UI_ROUTES.LOGIN)
  })

  it('CT-UI-AUTH-007 - Route an administrator to the administration area', () => {
    createdUser = createUser({ administrador: 'true' })
    usersApi.create(createdUser).its('status').should('eq', 201)

    loginPage.visit()
    loginPage.login(createdUser.email, createdUser.password)

    cy.location('pathname').should('eq', UI_ROUTES.ADMIN_HOME)
    cy.get(byTestId(TEST_IDS.admin.createProducts)).should('be.visible')
    cy.get(byTestId(TEST_IDS.admin.createUsers)).should('be.visible')
  })

  it('CT-UI-AUTH-008 - Prevent catalog changes by a standard user through a direct admin route', () => {
    createdUser = createUser()
    const product = createProduct()
    usersApi.create(createdUser).its('status').should('eq', 201)

    loginPage.visit()
    loginPage.login(createdUser.email, createdUser.password)
    cy.location('pathname').should('eq', UI_ROUTES.HOME)
    cy.visit(UI_ROUTES.ADMIN_HOME)
    adminProductsPage.openCreation()
    cy.intercept('POST', '**/produtos').as('unauthorizedProduct')
    adminProductsPage.create(product)

    cy.wait('@unauthorizedProduct').its('response.statusCode').should('eq', 403)
    cy.contains(MESSAGES.ADMIN_ONLY).should('be.visible')
    productsApi.findByName(product.nome).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.quantidade).to.eq(0)
    })
  })
})
