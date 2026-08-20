import { API_ROUTES } from '../constants/routes'
import { apiRequest, apiRequestAllowFailure } from './request'

export const usersApi = {
  list: (query = {}) => apiRequest({ url: API_ROUTES.USERS, qs: query }),
  create: (user) => apiRequest({ method: 'POST', url: API_ROUTES.USERS, body: user, log: false }),
  getById: (id) => apiRequest({ url: `${API_ROUTES.USERS}/${id}` }),
  findByEmail: (email) => apiRequest({ url: API_ROUTES.USERS, qs: { email } }),
  update: (id, user) => apiRequest({ method: 'PUT', url: `${API_ROUTES.USERS}/${id}`, body: user, log: false }),
  remove: (id) => apiRequest({ method: 'DELETE', url: `${API_ROUTES.USERS}/${id}` }),
  attemptList: (query = {}) => apiRequestAllowFailure({ url: API_ROUTES.USERS, qs: query }),
  attemptCreate: (user) => apiRequestAllowFailure({ method: 'POST', url: API_ROUTES.USERS, body: user, log: false }),
  attemptGetById: (id) => apiRequestAllowFailure({ url: `${API_ROUTES.USERS}/${id}` }),
  attemptUpdate: (id, user) => apiRequestAllowFailure({ method: 'PUT', url: `${API_ROUTES.USERS}/${id}`, body: user, log: false }),
  attemptRemove: (id) => apiRequestAllowFailure({ method: 'DELETE', url: `${API_ROUTES.USERS}/${id}` })
}
