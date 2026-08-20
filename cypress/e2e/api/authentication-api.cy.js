import { MESSAGES } from '../../constants/messages'
import { authenticationApi } from '../../services/authenticationApi'
import { usersApi } from '../../services/usersApi'
import { productsApi } from '../../services/productsApi'
import { createInvalidCredentials, createProduct, createUser } from '../../utils/dataFactory'

describe('ServeRest API - Authentication', () => {
  let userId

  afterEach(() => {
    if (userId) cy.deleteUserById(userId)
    userId = undefined
  })

  it('CT-API-AUTH-001 - Authenticate a registered user and return a bearer token', () => {
    const user = createUser()

    usersApi.create(user).then(({ body, status }) => {
      expect(status).to.eq(201)
      userId = body._id
    })
    authenticationApi.login({ email: user.email, password: user.password }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq('Login realizado com sucesso')
      expect(response.body.authorization).to.match(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
    })
  })

  it('CT-API-AUTH-002 - Reject credentials that do not identify a registered user', () => {
    authenticationApi.attemptLogin(createInvalidCredentials()).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_CREDENTIALS)
      expect(response.body).not.to.have.property('authorization')
    })
  })

  it('CT-API-AUTH-003 - Validate required login fields', () => {
    authenticationApi.attemptLogin({ email: '', password: '' }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.have.all.keys('email', 'password')
      expect(response.body.email).to.be.a('string').and.not.be.empty
      expect(response.body.password).to.be.a('string').and.not.be.empty
    })
  })

  it('CT-API-AUTH-004 - Reject a malformed bearer token on a protected operation', () => {
    productsApi.attemptCreate(createProduct(), 'Bearer token-adulterado').then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })

  it('CT-API-AUTH-005 - Reject a token after its user has been removed', () => {
    const admin = createUser({ administrador: 'true' })
    let revokedToken

    usersApi.create(admin).then(({ body, status }) => {
      expect(status).to.eq(201)
      userId = body._id
      return authenticationApi.login({ email: admin.email, password: admin.password })
    }).then(({ body, status }) => {
      expect(status).to.eq(200)
      revokedToken = body.authorization
      return usersApi.remove(userId)
    }).then(({ status }) => {
      expect(status).to.eq(200)
      userId = undefined
      return productsApi.attemptCreate(createProduct(), revokedToken)
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_TOKEN)
    })
  })
})
