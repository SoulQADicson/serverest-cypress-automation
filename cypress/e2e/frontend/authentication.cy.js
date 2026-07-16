import { loginPage } from '../../pages/LoginPage'
import { registerPage } from '../../pages/RegisterPage'
import { MESSAGES } from '../../constants/messages'
import { UI_ROUTES } from '../../constants/routes'
import { createUser } from '../../utils/dataFactory'

describe('Autenticação no frontend', () => {
  let createdUser

  afterEach(() => {
    if (createdUser) cy.deleteUserByEmail(createdUser.email)
    createdUser = undefined
  })

  it("CT01 - 'Cadastrar um novo usuário comum com dados válidos'", () => {
    // Arrange
    createdUser = createUser()
    cy.intercept('POST', '**/usuarios').as('createUser')

    // Act
    loginPage.visit()
    loginPage.openRegistration()
    registerPage.register(createdUser)

    // Assert
    cy.wait('@createUser').its('response.statusCode').should('eq', 201)
    cy.url().should('include', UI_ROUTES.HOME)
    cy.get('[data-testid="logout"]').should('be.visible')
  })

  it("CT02 - 'Impedir o acesso com credenciais inválidas'", () => {
    // Act
    loginPage.visit()
    loginPage.login('usuario.inexistente@example.com', 'senha-invalida')

    // Assert
    cy.contains(MESSAGES.INVALID_CREDENTIALS).should('be.visible')
    cy.url().should('include', UI_ROUTES.LOGIN)
  })
})
