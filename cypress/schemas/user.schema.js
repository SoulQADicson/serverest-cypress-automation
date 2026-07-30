export const expectCreatedResourceContract = (body) => {
  expect(body).to.have.all.keys('message', '_id')
  expect(body._id).to.be.a('string').and.not.be.empty
}

export const expectUserContract = (user) => {
  expect(user).to.have.all.keys('_id', 'nome', 'email', 'password', 'administrador')
  expect(user._id).to.be.a('string').and.not.be.empty
  expect(user.nome).to.be.a('string').and.not.be.empty
  expect(user.email).to.be.a('string').and.include('@')
  expect(user.password).to.be.a('string').and.not.be.empty
  expect(user.administrador).to.be.oneOf(['true', 'false'])
}

export const expectUserListContract = (body) => {
  expect(body).to.have.all.keys('quantidade', 'usuarios')
  expect(body.quantidade).to.eq(body.usuarios.length)
  body.usuarios.forEach(expectUserContract)
}
