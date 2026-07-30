import { byTestId, TEST_IDS } from '../constants/selectors'

class AdminProductsPage {
  openCreation() {
    cy.get(byTestId(TEST_IDS.admin.createProducts)).click()
  }

  create(product) {
    cy.get(byTestId(TEST_IDS.productForm.name)).type(product.nome)
    cy.get(byTestId(TEST_IDS.productForm.price)).type(product.preco)
    cy.get(byTestId(TEST_IDS.productForm.description)).type(product.descricao)
    cy.get(byTestId(TEST_IDS.productForm.quantity)).type(product.quantidade)
    this.submit()
  }

  submit() {
    cy.get(byTestId(TEST_IDS.productForm.submit)).click()
  }

  requiredFieldsShouldBeInvalid() {
    cy.contains(/Nome .* obrigat.rio/).should('be.visible')
    cy.contains(/Preco .* obrigat.rio|Preço .* obrigat.rio/).should('be.visible')
    cy.contains(/Descricao .* obrigat.rio|Descrição .* obrigat.rio/).should('be.visible')
    cy.contains(/Quantidade .* obrigat.rio/).should('be.visible')
  }
}

export const adminProductsPage = new AdminProductsPage()
