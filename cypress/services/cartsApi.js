import { API_ROUTES } from '../constants/routes'
import { apiRequest, apiRequestAllowFailure } from './request'

const authenticatedRequest = (request, method, url, token, body) => request({
  method,
  url,
  body,
  headers: token ? { authorization: token } : undefined,
  log: false
})

export const cartsApi = {
  list: (query = {}) => apiRequest({ url: API_ROUTES.CARTS, qs: query }),
  create: (products, token) => authenticatedRequest(apiRequest, 'POST', API_ROUTES.CARTS, token, { produtos: products }),
  getById: (id) => apiRequest({ url: `${API_ROUTES.CARTS}/${id}` }),
  complete: (token) => authenticatedRequest(apiRequest, 'DELETE', `${API_ROUTES.CARTS}/concluir-compra`, token),
  cancel: (token) => authenticatedRequest(apiRequest, 'DELETE', `${API_ROUTES.CARTS}/cancelar-compra`, token),
  attemptList: (query = {}) => apiRequestAllowFailure({ url: API_ROUTES.CARTS, qs: query }),
  attemptCreate: (products, token) => authenticatedRequest(apiRequestAllowFailure, 'POST', API_ROUTES.CARTS, token, { produtos: products }),
  attemptGetById: (id) => apiRequestAllowFailure({ url: `${API_ROUTES.CARTS}/${id}` }),
  attemptComplete: (token) => authenticatedRequest(apiRequestAllowFailure, 'DELETE', `${API_ROUTES.CARTS}/concluir-compra`, token),
  attemptCancel: (token) => authenticatedRequest(apiRequestAllowFailure, 'DELETE', `${API_ROUTES.CARTS}/cancelar-compra`, token)
}
