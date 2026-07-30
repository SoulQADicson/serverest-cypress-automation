import { byTestId, TEST_IDS } from '../../constants/selectors'

export const headerComponent = {
  logoutButton: () => cy.get(byTestId(TEST_IDS.auth.logout))
}
