import { API_ROUTES } from '../constants/routes'
import { apiRequest, apiRequestAllowFailure } from './request'

export const authenticationApi = {
  login: (credentials) => apiRequest({ method: 'POST', url: API_ROUTES.LOGIN, body: credentials, log: false }),
  attemptLogin: (credentials) => apiRequestAllowFailure({
    method: 'POST', url: API_ROUTES.LOGIN, body: credentials, log: false
  })
}
