import { api } from '../../utils/api'
import { createUser } from '../../utils/dataFactory'

describe('API ServeRest', () => {
  it('POST /usuarios - cria um usuario com dados validos', () => {
    const user = createUser()

    api.createUser(user).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.include({ message: 'Cadastro realizado com sucesso' })
      expect(response.body._id).to.be.a('string').and.not.be.empty

      api.deleteUser(response.body._id).its('status').should('eq', 200)
    })
  })

  it('POST /login - rejeita credenciais invalidas', () => {
    api.login({
      email: 'nao.existe@example.com',
      password: 'senha-incorreta'
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.message).to.eq('Email e/ou senha inválidos')
      expect(response.body).not.to.have.property('authorization')
    })
  })

  it('GET /produtos - retorna a lista de produtos com contrato valido', () => {
    cy.request(`${Cypress.env('apiUrl')}/produtos`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.quantidade).to.be.a('number').and.at.least(0)
      expect(response.body.produtos).to.be.an('array')

      if (response.body.produtos.length) {
        expect(response.body.produtos[0]).to.include.all.keys(
          '_id', 'nome', 'preco', 'descricao', 'quantidade'
        )
      }
    })
  })
})
