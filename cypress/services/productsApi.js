import { API_ROUTES } from '../constants/routes'
import { apiRequest } from './request'

export const productsApi = {
  list: (query = {}) => apiRequest({ url: API_ROUTES.PRODUCTS, qs: query }),
  create: (product, token) => apiRequest({
    method: 'POST',
    url: API_ROUTES.PRODUCTS,
    body: product,
    headers: token ? { authorization: token } : undefined
  }),
  getById: (id) => apiRequest({ url: `${API_ROUTES.PRODUCTS}/${id}` }),
  findByName: (nome) => apiRequest({ url: API_ROUTES.PRODUCTS, qs: { nome } }),
  update: (id, product, token) => apiRequest({
    method: 'PUT',
    url: `${API_ROUTES.PRODUCTS}/${id}`,
    body: product,
    headers: token ? { authorization: token } : undefined
  }),
  remove: (id, token) => apiRequest({
    method: 'DELETE',
    url: `${API_ROUTES.PRODUCTS}/${id}`,
    headers: token ? { authorization: token } : undefined
  })
}
