import { API_ROUTES } from '../constants/routes'
import { apiRequest, apiRequestAllowFailure } from './request'

const productRequest = (request, method, url, product, token) => request({
  method,
  url,
  body: product,
  headers: token ? { authorization: token } : undefined,
  log: false
})

export const productsApi = {
  list: (query = {}) => apiRequest({ url: API_ROUTES.PRODUCTS, qs: query }),
  create: (product, token) => productRequest(apiRequest, 'POST', API_ROUTES.PRODUCTS, product, token),
  getById: (id) => apiRequest({ url: `${API_ROUTES.PRODUCTS}/${id}` }),
  findByName: (nome) => apiRequest({ url: API_ROUTES.PRODUCTS, qs: { nome } }),
  update: (id, product, token) => productRequest(apiRequest, 'PUT', `${API_ROUTES.PRODUCTS}/${id}`, product, token),
  remove: (id, token) => productRequest(apiRequest, 'DELETE', `${API_ROUTES.PRODUCTS}/${id}`, undefined, token),
  attemptList: (query = {}) => apiRequestAllowFailure({ url: API_ROUTES.PRODUCTS, qs: query }),
  attemptCreate: (product, token) => productRequest(apiRequestAllowFailure, 'POST', API_ROUTES.PRODUCTS, product, token),
  attemptGetById: (id) => apiRequestAllowFailure({ url: `${API_ROUTES.PRODUCTS}/${id}` }),
  attemptUpdate: (id, product, token) => productRequest(apiRequestAllowFailure, 'PUT', `${API_ROUTES.PRODUCTS}/${id}`, product, token),
  attemptRemove: (id, token) => productRequest(apiRequestAllowFailure, 'DELETE', `${API_ROUTES.PRODUCTS}/${id}`, undefined, token)
}
