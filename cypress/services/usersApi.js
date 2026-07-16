import { API_ROUTES } from '../constants/routes'
import { apiRequest } from './request'

export const usersApi = {
  create: (user) => apiRequest({ method: 'POST', url: API_ROUTES.USERS, body: user }),
  findByEmail: (email) => apiRequest({ url: API_ROUTES.USERS, qs: { email } }),
  remove: (id) => apiRequest({ method: 'DELETE', url: `${API_ROUTES.USERS}/${id}` })
}
