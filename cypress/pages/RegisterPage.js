import { byTestId, TEST_IDS } from '../constants/selectors'

class RegisterPage {
  submit() {
    cy.get(byTestId(TEST_IDS.auth.register)).click()
  }

  register(user) {
    cy.get(byTestId(TEST_IDS.auth.name)).type(user.nome)
    cy.get(byTestId(TEST_IDS.auth.email)).type(user.email)
    cy.get(byTestId(TEST_IDS.auth.registrationPassword)).type(user.password, { log: false })
    if (user.administrador === 'true') cy.get(byTestId(TEST_IDS.auth.adminCheckbox)).check()
    this.submit()
  }

  requiredFieldsShouldBeInvalid() {
    cy.contains(/Nome .* obrigat.rio/).should('be.visible')
    cy.contains(/Email .* obrigat.rio/).should('be.visible')
    cy.contains(/Password .* obrigat.rio/).should('be.visible')
  }
}

export const registerPage = new RegisterPage()
