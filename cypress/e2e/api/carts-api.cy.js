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
    adminId = undefined
    adminToken = undefined
    userId = undefined
    userToken = undefined
    product = undefined
    productId = undefined
    cartActive = false
  })

  const prepareUser = () => {
    const user = createUser()
    return usersApi.create(user).then(({ body, status }) => {
      expect(status).to.eq(201)
      userId = body._id
      return authenticationApi.login({ email: user.email, password: user.password })
    }).then(({ body, status }) => {
      expect(status).to.eq(200)
      userToken = body.authorization
    })
  }

  const prepareProduct = () => {
    const admin = createUser({ administrador: 'true' })
    product = createProduct({ preco: 100, quantidade: 10 })

    return usersApi.create(admin).then(({ body, status }) => {
      expect(status).to.eq(201)
      adminId = body._id
      return authenticationApi.login({ email: admin.email, password: admin.password })
    }).then(({ body, status }) => {
      expect(status).to.eq(200)
      adminToken = body.authorization
      return productsApi.create(product, adminToken)
    }).then((response) => {
      expect(response.status).to.eq(201)
      productId = response.body._id
    })
  }

  const prepareCartContext = () => {
    return prepareProduct().then(() => prepareUser())
  }

  afterEach(() => {
    if (cartActive) cartsApi.cancel(userToken).its('status').should('eq', 200)
    if (productId) cy.deleteProductById(productId, adminToken)
    if (userId) cy.deleteUserById(userId)
    if (adminId) cy.deleteUserById(adminId)
  })

  it('CT-API-CRT-001 - Create a cart and calculate totals', () => {
    prepareCartContext().then(() => cartsApi.create(
      [{ idProduto: productId, quantidade: 2 }], userToken
    )).then((response) => {
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
    prepareCartContext().then(() => cartsApi.create(
      [{ idProduto: productId, quantidade: 3 }], userToken
    )).then(() => {
      cartActive = true
      productsApi.getById(productId).its('body.quantidade').should('eq', 7)
    })
  })

  it('CT-API-CRT-003 - Prevent a user from owning more than one cart', () => {
    prepareCartContext().then(() => {
      const items = [{ idProduto: productId, quantidade: 1 }]
      return cartsApi.create(items, userToken).then(() => {
        cartActive = true
        return cartsApi.attemptCreate(items, userToken).then((response) => {
          expect(response.status).to.eq(400)
          expect(response.body.message).to.eq(MESSAGES.CART_ALREADY_EXISTS)
        })
      })
    })
  })

  it('CT-API-CRT-004 - Reject a quantity above available stock', () => {
    prepareCartContext().then(() => cartsApi.attemptCreate(
      [{ idProduto: productId, quantidade: 11 }], userToken
    )).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.message).to.eq(MESSAGES.INSUFFICIENT_STOCK)
      expect(response.body.item).to.include({ idProduto: productId, quantidadeEstoque: 10 })
    })
  })

  it('CT-API-CRT-005 - Cancel a purchase and restore product stock', () => {
    prepareCartContext().then(() => cartsApi.create(
      [{ idProduto: productId, quantidade: 4 }], userToken
    )).then(() => {
      cartActive = true
      return cartsApi.cancel(userToken)
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.CANCELLED_SUCCESSFULLY)
      cartActive = false
      return productsApi.getById(productId)
    }).its('body.quantidade').should('eq', 10)
  })

  it('CT-API-CRT-006 - Complete a purchase and remove the cart without restoring stock', () => {
    prepareCartContext().then(() => cartsApi.create(
      [{ idProduto: productId, quantidade: 2 }], userToken
    )).then(() => {
      cartActive = true
      return cartsApi.complete(userToken)
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.DELETED_SUCCESSFULLY)
      cartActive = false
      return productsApi.getById(productId)
    }).its('body.quantidade').should('eq', 8)
    cy.then(() => cartsApi.list({ idUsuario: userId })).then((response) => {
      expect(response.status).to.eq(200)
      expectCartListContract(response.body)
      expect(response.body.quantidade).to.eq(0)
    })
  })

  it('CT-API-CRT-007 - Return not found for an unknown cart id', () => {
    cartsApi.attemptGetById('ZZZZZZZZZZZZZZZZ').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.deep.eq({ message: 'Carrinho não encontrado' })
    })
  })

  it('CT-API-CRT-008 - Reject cart creation without an authentication token', () => {
    cartsApi.attemptCreate([{ idProduto: 'produto-inexistente', quantidade: 1 }]).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-CRT-009 - Reject a cart containing an unknown product', () => {
    prepareUser().then(() => cartsApi.attemptCreate(
      [{ idProduto: 'produto-inexistente', quantidade: 1 }], userToken
    ))
      .then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq('Produto não encontrado')
        expect(response.body.item).to.include({ idProduto: 'produto-inexistente' })
      })
  })

  it('CT-API-CRT-010 - Reject duplicated products in the same cart', () => {
    prepareCartContext().then(() => cartsApi.attemptCreate([
      { idProduto: productId, quantidade: 1 },
      { idProduto: productId, quantidade: 2 }
    ], userToken)).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.message).to.eq('Não é permitido possuir produto duplicado')
    })
  })

  it('CT-API-CRT-011 - Report that no cart exists when completing a purchase', () => {
    prepareUser().then(() => cartsApi.complete(userToken)).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.CART_NOT_FOUND)
    })
  })

  it('CT-API-CRT-012 - Report that no cart exists when cancelling a purchase', () => {
    prepareUser().then(() => cartsApi.cancel(userToken)).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq(MESSAGES.CART_NOT_FOUND)
    })
  })

  it('CT-API-CRT-013 - Reject completing a purchase without an authentication token', () => {
    cartsApi.attemptComplete().then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-CRT-014 - Reject cancelling a purchase without an authentication token', () => {
    cartsApi.attemptCancel().then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-CRT-015 - Reject deleting a user who owns an active cart', () => {
    prepareCartContext().then(() => cartsApi.create(
      [{ idProduto: productId, quantidade: 1 }], userToken
    )).then(() => {
      cartActive = true
      usersApi.attemptRemove(userId).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq('Não é permitido excluir usuário com carrinho cadastrado')
        expect(response.body.idCarrinho).to.be.a('string').and.not.be.empty
      })
    })
  })

  it('CT-API-CRT-016 - Reject a cart filter below the documented total-price boundary', () => {
    cartsApi.attemptList({ precoTotal: 0 }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.precoTotal).to.be.a('string').and.not.be.empty
    })
  })

  it('CT-API-CRT-017 - Reject a malformed cart id', () => {
    cartsApi.attemptGetById('invalid-id').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.id).to.include('16 caracteres alfanuméricos')
    })
  })
})
