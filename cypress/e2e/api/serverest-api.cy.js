import { MESSAGES } from '../../constants/messages'
import { authenticationApi } from '../../services/authenticationApi'
import { productsApi } from '../../services/productsApi'
import { usersApi } from '../../services/usersApi'
import { expectProductListContract } from '../../schemas/product.schema'
import { expectCreatedResourceContract } from '../../schemas/user.schema'
import { createInvalidCredentials, createUser } from '../../utils/dataFactory'

describe('ServeRest API', () => {
  let createdUserId

  afterEach(() => {
    if (createdUserId) usersApi.remove(createdUserId).its('status').should('eq', 200)
    createdUserId = undefined
  })

  it("CT04 - 'Create a user with valid data via API'", () => {
    const user = createUser()

    usersApi.create(user).then((response) => {
      createdUserId = response.body._id

      expect(response.status).to.eq(201)
      expect(response.body.message).to.eq(MESSAGES.CREATED_SUCCESSFULLY)
      expectCreatedResourceContract(response.body)
    })
  })

  it("CT05 - 'Reject authentication with invalid credentials via API'", () => {
    const invalidCredentials = createInvalidCredentials()

    authenticationApi.login(invalidCredentials).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_CREDENTIALS)
      expect(response.body).not.to.have.property('authorization')
    })
  })

  it("CT06 - 'List products and validate the API response contract'", () => {
    productsApi.list().then((response) => {
      expect(response.status).to.eq(200)
      expectProductListContract(response.body)
    })
  })
})
