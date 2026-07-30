import { MESSAGES } from '../../constants/messages'
import { expectCartContract, expectCartListContract } from '../../schemas/cart.schema'
import { authenticationApi } from '../../services/authenticationApi'
import { cartsApi } from '../../services/cartsApi'
import { productsApi } from '../../services/productsApi'
import { usersApi } from '../../services/usersApi'
import { createProduct, createUser } from '../../utils/dataFactory'

describe('ServeRest API - Carts and purchase flow', () => {
  let adminId
  let adminToken
  let userId
  let userToken
  let product
  let productId
  let cartActive

  beforeEach(() => {
    const admin = createUser({ administrador: 'true' })
    const user = createUser()
    product = createProduct({ preco: 100, quantidade: 10 })

    usersApi.create(admin).then(({ body }) => { adminId = body._id })
    authenticationApi.login({ email: admin.email, password: admin.password }).then(({ body }) => {
      adminToken = body.authorization
      productsApi.create(product, adminToken).then((productResponse) => {
        expect(productResponse.status).to.eq(201)
        productId = productResponse.body._id
      })
    })
    usersApi.create(user).then(({ body }) => { userId = body._id })
    authenticationApi.login({ email: user.email, password: user.password })
      .then(({ body }) => { userToken = body.authorization })
    cartActive = false
  })

  afterEach(() => {
    if (cartActive) cartsApi.cancel(userToken)
    if (productId) productsApi.remove(productId, adminToken)
    if (userId) usersApi.remove(userId)
    if (adminId) usersApi.remove(adminId)
  })

  it('CT-API-CRT-001 - Create a cart and calculate totals', () => {
    cartsApi.create([{ idProduto: productId, quantidade: 2 }], userToken).then((response) => {
      expect(response.status, JSON.stringify(response.body)).to.eq(201)
      expect(response.body.message).to.eq(MESSAGES.CREATED_SUCCESSFULLY)
      cartActive = true

      cartsApi.getById(response.body._id).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expectCartContract(getResponse.body)
        expect(getResponse.body).to.include({
          idUsuario: userId,
          quantidadeTotal: 2,
          precoTotal: 200
        })
      })
    })
  })

  it('CT-API-CRT-002 - Reduce stock when a cart is created', () => {
    cartsApi.create([{ idProduto: productId, quantidade: 3 }], userToken).then(() => {
      cartActive = true
      productsApi.getById(productId).its('body.quantidade').should('eq', 7)
    })
  })

  it('CT-API-CRT-003 - Prevent a user from owning more than one cart', () => {
    const items = [{ idProduto: productId, quantidade: 1 }]

    cartsApi.create(items, userToken).then(() => {
      cartActive = true
      cartsApi.create(items, userToken).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq(MESSAGES.CART_ALREADY_EXISTS)
      })
    })
  })

  it('CT-API-CRT-004 - Reject a quantity above available stock', () => {
    cartsApi.create([{ idProduto: productId, quantidade: 11 }], userToken).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.message).to.eq(MESSAGES.INSUFFICIENT_STOCK)
      expect(response.body.item).to.include({ idProduto: productId, quantidadeEstoque: 10 })
    })
  })

  it('CT-API-CRT-005 - Cancel a purchase and restore product stock', () => {
    cartsApi.create([{ idProduto: productId, quantidade: 4 }], userToken).then(() => {
      cartActive = true
    })
    cartsApi.cancel(userToken).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.CANCELLED_SUCCESSFULLY)
      cartActive = false
    })
    productsApi.getById(productId).its('body.quantidade').should('eq', 10)
  })

  it('CT-API-CRT-006 - Complete a purchase and remove the cart without restoring stock', () => {
    cartsApi.create([{ idProduto: productId, quantidade: 2 }], userToken).then(() => {
      cartActive = true
    })
    cartsApi.complete(userToken).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.DELETED_SUCCESSFULLY)
      cartActive = false
    })
    productsApi.getById(productId).its('body.quantidade').should('eq', 8)
    cartsApi.list({ idUsuario: userId }).then((response) => {
      expect(response.status).to.eq(200)
      expectCartListContract(response.body)
      expect(response.body.quantidade).to.eq(0)
    })
  })

  it('CT-API-CRT-007 - Return not found for an unknown cart id', () => {
    cartsApi.getById('ZZZZZZZZZZZZZZZZ').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.deep.eq({ message: 'Carrinho não encontrado' })
    })
  })

  it('CT-API-CRT-008 - Reject cart creation without an authentication token', () => {
    cartsApi.create([{ idProduto: productId, quantidade: 1 }]).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-CRT-009 - Reject a cart containing an unknown product', () => {
    cartsApi.create([{ idProduto: 'produto-inexistente', quantidade: 1 }], userToken)
      .then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq('Produto não encontrado')
        expect(response.body.item).to.include({ idProduto: 'produto-inexistente' })
      })
  })

  it('CT-API-CRT-010 - Reject duplicated products in the same cart', () => {
    const duplicatedItems = [
      { idProduto: productId, quantidade: 1 },
      { idProduto: productId, quantidade: 2 }
    ]

    cartsApi.create(duplicatedItems, userToken).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.message).to.eq('Não é permitido possuir produto duplicado')
    })
  })

  it('CT-API-CRT-011 - Report that no cart exists when completing a purchase', () => {
    cartsApi.complete(userToken).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.CART_NOT_FOUND)
    })
  })

  it('CT-API-CRT-012 - Report that no cart exists when cancelling a purchase', () => {
    cartsApi.cancel(userToken).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.CART_NOT_FOUND)
    })
  })

  it('CT-API-CRT-013 - Reject completing a purchase without an authentication token', () => {
    cartsApi.complete().then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-CRT-014 - Reject cancelling a purchase without an authentication token', () => {
    cartsApi.cancel().then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-CRT-015 - Reject deleting a user who owns an active cart', () => {
    cartsApi.create([{ idProduto: productId, quantidade: 1 }], userToken).then(() => {
      cartActive = true
      usersApi.remove(userId).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq('Não é permitido excluir usuário com carrinho cadastrado')
        expect(response.body.idCarrinho).to.be.a('string').and.not.be.empty
      })
    })
  })

  it('CT-API-CRT-016 - Reject a cart filter below the documented total-price boundary', () => {
    cartsApi.list({ precoTotal: 0 }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.precoTotal).to.be.a('string').and.not.be.empty
    })
  })

  it('CT-API-CRT-017 - Reject a malformed cart id', () => {
    cartsApi.getById('invalid-id').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.id).to.include('16 caracteres alfanuméricos')
    })
  })
})
