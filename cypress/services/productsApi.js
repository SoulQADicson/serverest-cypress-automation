import { API_ROUTES } from '../constants/routes'
import { apiRequest } from './request'

export const productsApi = {
  list: () => apiRequest({ url: API_ROUTES.PRODUCTS }),
  findByName: (nome) => apiRequest({ url: API_ROUTES.PRODUCTS, qs: { nome } }),
  remove: (id, token) => apiRequest({
    method: 'DELETE',
    url: `${API_ROUTES.PRODUCTS}/${id}`,
    headers: { authorization: token }
  })
}
