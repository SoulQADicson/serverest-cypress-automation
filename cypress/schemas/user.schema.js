export const expectCreatedResourceContract = (body) => {
  expect(body).to.have.all.keys('message', '_id')
  expect(body._id).to.be.a('string').and.not.be.empty
}

export const expectUserContract = (user, { allowSensitiveFields = false } = {}) => {
  expect(user).to.include.all.keys('_id', 'nome', 'email', 'administrador')
  expect(user._id).to.be.a('string').and.not.be.empty
  expect(user.nome).to.be.a('string').and.not.be.empty
  expect(user.email).to.be.a('string').and.include('@')
  expect(user.administrador).to.be.oneOf(['true', 'false'])
  if (allowSensitiveFields) {
    // ServeRest is an educational API that currently exposes plaintext passwords.
    // Callers must acknowledge this known security risk explicitly.
    expect(user.password).to.be.a('string').and.not.be.empty
  } else {
    expect(user).not.to.have.property('password')
  }
}

export const expectUserListContract = (body, options) => {
  expect(body).to.have.all.keys('quantidade', 'usuarios')
  expect(body.quantidade).to.eq(body.usuarios.length)
  body.usuarios.forEach((user) => expectUserContract(user, options))
}
