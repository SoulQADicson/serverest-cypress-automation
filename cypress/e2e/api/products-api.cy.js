import { MESSAGES } from '../../constants/messages'
import { expectProductContract, expectProductListContract } from '../../schemas/product.schema'
import { authenticationApi } from '../../services/authenticationApi'
import { cartsApi } from '../../services/cartsApi'
import { productsApi } from '../../services/productsApi'
import { usersApi } from '../../services/usersApi'
import { createProduct, createUser } from '../../utils/dataFactory'

describe('ServeRest API - Products', () => {
  let admin
  let adminId
  let adminToken
  const productIds = new Set()

  beforeEach(() => {
    admin = createUser({ administrador: 'true' })
    usersApi.create(admin).then(({ body }) => {
      adminId = body._id
    })
    authenticationApi.login({ email: admin.email, password: admin.password }).then(({ body }) => {
      adminToken = body.authorization
    })
  })

  afterEach(() => {
    const ids = [...productIds]
    productIds.clear()
    ids.forEach((id) => productsApi.remove(id, adminToken))
    if (adminId) usersApi.remove(adminId)
    adminId = undefined
  })

  it('CT-API-PRD-001 - Allow an administrator to create and retrieve a product', () => {
    const product = createProduct()

    productsApi.create(product, adminToken).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.message).to.eq(MESSAGES.CREATED_SUCCESSFULLY)
      productIds.add(response.body._id)

      productsApi.getById(response.body._id).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expectProductContract(getResponse.body)
        expect(getResponse.body).to.include(product)
      })
    })
  })

  it('CT-API-PRD-002 - Filter products by name and validate the list contract', () => {
    const product = createProduct()

    productsApi.create(product, adminToken).then(({ body }) => {
      productIds.add(body._id)
      productsApi.list({ nome: product.nome }).then((response) => {
        expect(response.status).to.eq(200)
        expectProductListContract(response.body)
        expect(response.body.quantidade).to.eq(1)
      })
    })
  })

  it('CT-API-PRD-003 - Reject product creation without an authentication token', () => {
    productsApi.create(createProduct()).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-PRD-004 - Reject product creation by a standard user', () => {
    const standardUser = createUser()
    let standardUserId

    usersApi.create(standardUser).then(({ body }) => {
      standardUserId = body._id
    })
    authenticationApi.login({ email: standardUser.email, password: standardUser.password }).then(({ body }) => {
      productsApi.create(createProduct(), body.authorization).then((response) => {
        expect(response.status).to.eq(403)
        expect(response.body.message).to.eq(MESSAGES.ADMIN_ONLY)
      })
    })
    cy.then(() => usersApi.remove(standardUserId))
  })

  it('CT-API-PRD-005 - Reject a duplicated product name', () => {
    const product = createProduct()

    productsApi.create(product, adminToken).then(({ body }) => {
      productIds.add(body._id)
      productsApi.create(product, adminToken).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq(MESSAGES.PRODUCT_ALREADY_EXISTS)
      })
    })
  })

  it('CT-API-PRD-006 - Update and delete a product as an administrator', () => {
    const product = createProduct()
    const updatedProduct = { ...product, preco: 175, quantidade: 12 }

    productsApi.create(product, adminToken).then(({ body }) => {
      productsApi.update(body._id, updatedProduct, adminToken).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.message).to.eq(MESSAGES.UPDATED_SUCCESSFULLY)
      })
      productsApi.getById(body._id).its('body').should('include', updatedProduct)
      productsApi.remove(body._id, adminToken).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.message).to.eq(MESSAGES.DELETED_SUCCESSFULLY)
      })
    })
  })

  it('CT-API-PRD-007 - Return not found for an unknown product id', () => {
    productsApi.getById('ZZZZZZZZZZZZZZZZ').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.deep.eq({ message: 'Produto não encontrado' })
    })
  })

  it('CT-API-PRD-008 - Reject invalid product field boundaries', () => {
    productsApi.create(
      { nome: '', preco: 0, descricao: '', quantidade: -1 },
      adminToken
    ).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.include.all.keys('nome', 'preco', 'quantidade')
    })
  })

  it('CT-API-PRD-009 - Reject product update without an authentication token', () => {
    productsApi.update('produto-inexistente', createProduct()).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-PRD-010 - Reject product deletion without an authentication token', () => {
    productsApi.remove('produto-inexistente').then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-PRD-011 - Reject product update and deletion by a standard user', () => {
    const standardUser = createUser()
    const product = createProduct()
    let standardUserId

    usersApi.create(standardUser).then(({ body }) => { standardUserId = body._id })
    productsApi.create(product, adminToken).then(({ body }) => productIds.add(body._id))
    authenticationApi.login({ email: standardUser.email, password: standardUser.password }).then(({ body }) => {
      const standardToken = body.authorization
      const productId = [...productIds][0]

      productsApi.update(productId, { ...product, preco: 200 }, standardToken).then((response) => {
        expect(response.status).to.eq(403)
        expect(response.body.message).to.eq(MESSAGES.ADMIN_ONLY)
      })
      productsApi.remove(productId, standardToken).then((response) => {
        expect(response.status).to.eq(403)
        expect(response.body.message).to.eq(MESSAGES.ADMIN_ONLY)
      })
    })
    cy.then(() => usersApi.remove(standardUserId))
  })

  it('CT-API-PRD-012 - Reject updating a product with an existing name', () => {
    const firstProduct = createProduct()
    const secondProduct = createProduct()
    let secondProductId

    productsApi.create(firstProduct, adminToken).then(({ body }) => productIds.add(body._id))
    productsApi.create(secondProduct, adminToken).then(({ body }) => {
      secondProductId = body._id
      productIds.add(body._id)
    })
    cy.then(() => {
      productsApi.update(
        secondProductId,
        { ...secondProduct, nome: firstProduct.nome },
        adminToken
      ).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq(MESSAGES.PRODUCT_ALREADY_EXISTS)
      })
    })
  })

  it('CT-API-PRD-013 - Reject deleting a product that belongs to an active cart', () => {
    const standardUser = createUser()
    const product = createProduct()
    let standardUserId
    let standardToken
    let cartActive = false

    usersApi.create(standardUser).then(({ body }) => { standardUserId = body._id })
    authenticationApi.login({ email: standardUser.email, password: standardUser.password })
      .then(({ body }) => { standardToken = body.authorization })
    productsApi.create(product, adminToken).then(({ body }) => {
      productIds.add(body._id)
      cartsApi.create([{ idProduto: body._id, quantidade: 1 }], standardToken)
        .its('status').should('eq', 201)
      cartActive = true
      productsApi.remove(body._id, adminToken).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq('Não é permitido excluir produto que faz parte de carrinho')
      })
    })
    cy.then(() => {
      if (cartActive) cartsApi.cancel(standardToken)
      usersApi.remove(standardUserId)
    })
  })

  it('CT-API-PRD-014 - Reject a product filter below the documented price boundary', () => {
    productsApi.list({ preco: 0 }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.preco).to.be.a('string').and.not.be.empty
    })
  })

  it('CT-API-PRD-015 - Reject a malformed product id', () => {
    productsApi.getById('invalid-id').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.id).to.include('16 caracteres alfanuméricos')
    })
  })
})
