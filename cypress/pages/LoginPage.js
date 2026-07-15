class LoginPage {
  visit() {
    cy.visit('/login')
  }

  openRegistration() {
    cy.get('[data-testid="cadastrar"]').click()
  }

  login(email, password) {
    cy.loginUi(email, password)
  }
}

export const loginPage = new LoginPage()
