import { loginPage } from '../../pages/LoginPage'
import { registerPage } from '../../pages/RegisterPage'
import { headerComponent } from '../../pages/components/HeaderComponent'
import { MESSAGES } from '../../constants/messages'
import { UI_ROUTES } from '../../constants/routes'
import { createInvalidCredentials, createUser } from '../../utils/dataFactory'

describe('Frontend authentication', () => {
  let createdUser

  afterEach(() => {
    if (createdUser) cy.deleteUserByEmail(createdUser.email)
    createdUser = undefined
  })

  it("CT01 - 'Register a new standard user with valid data'", () => {
    createdUser = createUser()
    cy.intercept('POST', '**/usuarios').as('createUser')

    loginPage.visit()
    loginPage.openRegistration()
    registerPage.register(createdUser)

    cy.wait('@createUser').its('response.statusCode').should('eq', 201)
    cy.url().should('include', UI_ROUTES.HOME)
    headerComponent.logoutButton().should('be.visible')
  })

  it("CT02 - 'Prevent access with invalid credentials'", () => {
    const { email, password } = createInvalidCredentials()

    loginPage.visit()
    loginPage.login(email, password)

    cy.contains(MESSAGES.INVALID_CREDENTIALS).should('be.visible')
    cy.url().should('include', UI_ROUTES.LOGIN)
  })
})
