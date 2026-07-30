import { API_ROUTES } from '../constants/routes'
import { apiRequest } from './request'

export const cartsApi = {
  list: (query = {}) => apiRequest({ url: API_ROUTES.CARTS, qs: query }),
  create: (products, token) => apiRequest({
    method: 'POST',
    url: API_ROUTES.CARTS,
    body: { produtos: products },
    headers: token ? { authorization: token } : undefined
  }),
  getById: (id) => apiRequest({ url: `${API_ROUTES.CARTS}/${id}` }),
  complete: (token) => apiRequest({
    method: 'DELETE',
    url: `${API_ROUTES.CARTS}/concluir-compra`,
    headers: token ? { authorization: token } : undefined
  }),
  cancel: (token) => apiRequest({
    method: 'DELETE',
    url: `${API_ROUTES.CARTS}/cancelar-compra`,
    headers: token ? { authorization: token } : undefined
  })
}
