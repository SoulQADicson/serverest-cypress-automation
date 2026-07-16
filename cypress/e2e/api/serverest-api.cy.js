import { MESSAGES } from '../../constants/messages'
import { authenticationApi } from '../../services/authenticationApi'
import { productsApi } from '../../services/productsApi'
import { usersApi } from '../../services/usersApi'
import { expectProductListContract } from '../../schemas/product.schema'
import { expectCreatedResourceContract } from '../../schemas/user.schema'
import { createUser } from '../../utils/dataFactory'

describe('API ServeRest', () => {
  let createdUserId

  afterEach(() => {
    if (createdUserId) usersApi.remove(createdUserId).its('status').should('eq', 200)
    createdUserId = undefined
  })

  it("CT04 - 'Cadastrar usuário com dados válidos via API'", () => {
    // Arrange
    const user = createUser()

    // Act
    usersApi.create(user).then((response) => {
      createdUserId = response.body._id

      // Assert
      expect(response.status).to.eq(201)
      expect(response.body.message).to.eq(MESSAGES.CREATED_SUCCESSFULLY)
      expectCreatedResourceContract(response.body)
    })
  })

  it("CT05 - 'Rejeitar autenticação com credenciais inválidas via API'", () => {
    // Arrange
    const invalidCredentials = {
      email: 'nao.existe@example.com',
      password: 'senha-incorreta'
    }

    // Act
    authenticationApi.login(invalidCredentials).then((response) => {
      // Assert
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq(MESSAGES.INVALID_CREDENTIALS)
      expect(response.body).not.to.have.property('authorization')
    })
  })

  it("CT06 - 'Listar produtos e validar o contrato da resposta via API'", () => {
    // Act
    productsApi.list().then((response) => {
      // Assert
      expect(response.status).to.eq(200)
      expectProductListContract(response.body)
    })
  })
})
