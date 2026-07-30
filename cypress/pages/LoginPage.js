import { byTestId, TEST_IDS } from '../constants/selectors'

class LoginPage {
  visit() {
    cy.visit('/login')
  }

  openRegistration() {
    cy.get(byTestId(TEST_IDS.auth.register)).click()
  }

  login(email, password) {
    cy.loginUi(email, password)
  }

  submit() {
    cy.get(byTestId(TEST_IDS.auth.login)).click()
  }

  requiredFieldsShouldBeInvalid() {
    cy.contains(/Email .* obrigat.rio/).should('be.visible')
    cy.contains(/Password .* obrigat.rio/).should('be.visible')
  }
}

export const loginPage = new LoginPage()
