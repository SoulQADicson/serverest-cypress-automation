import { byTestId, TEST_IDS } from '../constants/selectors'

class ShoppingListPage {
  productName(name) {
    return cy.contains(byTestId(TEST_IDS.shoppingList.productName), name)
  }

  quantity() {
    return cy.get(byTestId(TEST_IDS.shoppingList.productQuantity))
  }

  increase() {
    cy.get(byTestId(TEST_IDS.shoppingList.increase)).click()
  }

  decrease() {
    cy.get(byTestId(TEST_IDS.shoppingList.decrease)).click()
  }

  clear() {
    cy.get(byTestId(TEST_IDS.shoppingList.clear)).click()
  }

  emptyMessage() {
    return cy.get(byTestId(TEST_IDS.shoppingList.emptyMessage))
  }
}

export const shoppingListPage = new ShoppingListPage()
