import { MESSAGES } from '../../constants/messages'
import { expectCreatedResourceContract, expectUserContract, expectUserListContract } from '../../schemas/user.schema'
import { usersApi } from '../../services/usersApi'
import { createUser } from '../../utils/dataFactory'

describe('ServeRest API - Users', () => {
  const idsToDelete = new Set()

  afterEach(() => {
    const ids = [...idsToDelete]
    idsToDelete.clear()
    ids.forEach((id) => usersApi.remove(id))
  })

  it('CT-API-USR-001 - Create and retrieve a user by id', () => {
    const user = createUser()

    usersApi.create(user).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.message).to.eq(MESSAGES.CREATED_SUCCESSFULLY)
      expectCreatedResourceContract(response.body)
      idsToDelete.add(response.body._id)

      usersApi.getById(response.body._id).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expectUserContract(getResponse.body)
        expect(getResponse.body).to.include(user)
      })
    })
  })

  it('CT-API-USR-002 - Filter users by email and validate the list contract', () => {
    const user = createUser()

    usersApi.create(user).then(({ body }) => {
      idsToDelete.add(body._id)
      usersApi.list({ email: user.email }).then((response) => {
        expect(response.status).to.eq(200)
        expectUserListContract(response.body)
        expect(response.body.quantidade).to.eq(1)
        expect(response.body.usuarios[0]).to.include({ email: user.email })
      })
    })
  })

  it('CT-API-USR-003 - Reject a duplicated email', () => {
    const user = createUser()

    usersApi.create(user).then(({ body }) => {
      idsToDelete.add(body._id)
      usersApi.create({ ...user, nome: 'Duplicated user' }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq(MESSAGES.EMAIL_ALREADY_USED)
        expect(response.body).not.to.have.property('_id')
      })
    })
  })

  it('CT-API-USR-004 - Update an existing user', () => {
    const user = createUser()
    const updatedUser = { ...user, nome: 'QA Automation Updated' }

    usersApi.create(user).then(({ body }) => {
      idsToDelete.add(body._id)
      usersApi.update(body._id, updatedUser).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.message).to.eq(MESSAGES.UPDATED_SUCCESSFULLY)
      })
      usersApi.getById(body._id).its('body').should('include', updatedUser)
    })
  })

  it('CT-API-USR-005 - Delete a user and prevent subsequent retrieval', () => {
    const user = createUser()

    usersApi.create(user).then(({ body }) => {
      usersApi.remove(body._id).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.message).to.eq(MESSAGES.DELETED_SUCCESSFULLY)
      })
      usersApi.getById(body._id).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq('Usuário não encontrado')
      })
    })
  })

  it('CT-API-USR-006 - Reject missing and invalid user fields', () => {
    usersApi.create({ nome: '', email: 'invalid-email', password: '', administrador: 'invalid' })
      .then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.include.all.keys('nome', 'email', 'password', 'administrador')
        Object.values(response.body).forEach((message) => {
          expect(message).to.be.a('string').and.not.be.empty
        })
      })
  })

  it('CT-API-USR-007 - Return not found for an unknown user id', () => {
    usersApi.getById('ZZZZZZZZZZZZZZZZ').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.deep.eq({ message: 'Usuário não encontrado' })
    })
  })

  it('CT-API-USR-008 - Reject updating a user with an email owned by another user', () => {
    const firstUser = createUser()
    const secondUser = createUser()

    usersApi.create(firstUser).then(({ body }) => idsToDelete.add(body._id))
    usersApi.create(secondUser).then(({ body }) => {
      idsToDelete.add(body._id)
      usersApi.update(body._id, { ...secondUser, email: firstUser.email }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq(MESSAGES.EMAIL_ALREADY_USED)
      })
    })
  })

  it('CT-API-USR-009 - Create a user when updating an unknown id as documented', () => {
    const user = createUser()

    usersApi.update('usuario-inexistente', user).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.message).to.eq(MESSAGES.CREATED_SUCCESSFULLY)
      expectCreatedResourceContract(response.body)
      idsToDelete.add(response.body._id)
    })
  })

  it('CT-API-USR-010 - Reject an invalid administrator filter', () => {
    usersApi.list({ administrador: 'invalid' }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.administrador).to.be.a('string').and.not.be.empty
    })
  })

  it('CT-API-USR-011 - Reject a malformed user id', () => {
    usersApi.getById('invalid-id').then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.id).to.include('16 caracteres alfanuméricos')
    })
  })
})
