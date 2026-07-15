import { loginPage } from '../../pages/LoginPage'
import { registerPage } from '../../pages/RegisterPage'
import { createUser } from '../../utils/dataFactory'

describe('Autenticacao no frontend', () => {
  let createdUser

  afterEach(() => {
    if (createdUser) cy.deleteUserByEmail(createdUser.email)
    createdUser = undefined
  })

  it('cadastra um novo usuario comum', () => {
    createdUser = createUser()
    cy.intercept('POST', '**/usuarios').as('createUser')

    loginPage.visit()
    loginPage.openRegistration()
    registerPage.register(createdUser)

    cy.wait('@createUser').its('response.statusCode').should('eq', 201)
    cy.url().should('include', '/home')
    cy.get('[data-testid="logout"]').should('be.visible')
  })

  it('impede o login com credenciais invalidas', () => {
    loginPage.visit()
    loginPage.login('usuario.inexistente@example.com', 'senha-invalida')

    cy.contains('Email e/ou senha inválidos').should('be.visible')
    cy.url().should('include', '/login')
  })
})
