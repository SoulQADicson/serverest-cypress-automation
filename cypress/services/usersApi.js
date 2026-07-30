import { API_ROUTES } from '../constants/routes'
import { apiRequest } from './request'

export const usersApi = {
  list: (query = {}) => apiRequest({ url: API_ROUTES.USERS, qs: query }),
  create: (user) => apiRequest({ method: 'POST', url: API_ROUTES.USERS, body: user }),
  getById: (id) => apiRequest({ url: `${API_ROUTES.USERS}/${id}` }),
  findByEmail: (email) => apiRequest({ url: API_ROUTES.USERS, qs: { email } }),
  update: (id, user) => apiRequest({ method: 'PUT', url: `${API_ROUTES.USERS}/${id}`, body: user }),
  remove: (id) => apiRequest({ method: 'DELETE', url: `${API_ROUTES.USERS}/${id}` })
}
