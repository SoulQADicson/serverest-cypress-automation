import { byTestId, TEST_IDS } from '../constants/selectors'

class CatalogPage {
  search(name) {
    cy.get(byTestId(TEST_IDS.catalog.search)).clear().type(name)
    cy.get(byTestId(TEST_IDS.catalog.searchButton)).click()
  }

  product(name) {
    // The application does not expose a test id on the product title.
    // Text is business data and therefore safer here than a positional selector.
    return cy.contains(name)
  }

  addToShoppingList(name) {
    this.product(name)
      .closest('.card')
      .find(byTestId(TEST_IDS.catalog.addToList))
      .click()
  }

  openShoppingList() {
    cy.get(byTestId(TEST_IDS.navigation.shoppingList)).click()
  }
}

export const catalogPage = new CatalogPage()
