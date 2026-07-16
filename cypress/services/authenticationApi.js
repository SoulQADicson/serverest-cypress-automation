import { API_ROUTES } from '../constants/routes'
import { apiRequest } from './request'

export const authenticationApi = {
  login: (credentials) => apiRequest({ method: 'POST', url: API_ROUTES.LOGIN, body: credentials })
}
