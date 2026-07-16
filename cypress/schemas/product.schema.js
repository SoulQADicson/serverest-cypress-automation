export const expectProductContract = (product) => {
  expect(product).to.include.all.keys('_id', 'nome', 'preco', 'descricao', 'quantidade')
  expect(product._id).to.be.a('string').and.not.be.empty
  expect(product.nome).to.be.a('string').and.not.be.empty
  expect(product.descricao).to.be.a('string')
  expect(product.preco).to.be.a('number').and.at.least(0)
  expect(product.quantidade).to.be.a('number').and.at.least(0)
}

export const expectProductListContract = (body) => {
  expect(body).to.have.all.keys('quantidade', 'produtos')
  expect(body.quantidade).to.be.a('number').and.at.least(0)
  expect(body.produtos).to.be.an('array').and.have.length(body.quantidade)
  body.produtos.forEach(expectProductContract)
}
