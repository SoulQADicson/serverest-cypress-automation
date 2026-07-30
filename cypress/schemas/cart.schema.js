export const expectCartContract = (cart) => {
  expect(cart).to.have.all.keys('_id', 'produtos', 'precoTotal', 'quantidadeTotal', 'idUsuario')
  expect(cart._id).to.be.a('string').and.not.be.empty
  expect(cart.idUsuario).to.be.a('string').and.not.be.empty
  expect(cart.produtos).to.be.an('array').and.not.be.empty
  expect(cart.quantidadeTotal).to.eq(
    cart.produtos.reduce((total, product) => total + product.quantidade, 0)
  )
  expect(cart.precoTotal).to.eq(
    cart.produtos.reduce((total, product) => total + product.precoUnitario * product.quantidade, 0)
  )
  cart.produtos.forEach((product) => {
    expect(product).to.have.all.keys('idProduto', 'quantidade', 'precoUnitario')
    expect(product.idProduto).to.be.a('string').and.not.be.empty
    expect(product.quantidade).to.be.a('number').and.greaterThan(0)
    expect(product.precoUnitario).to.be.a('number').and.greaterThan(0)
  })
}

export const expectCartListContract = (body) => {
  expect(body).to.have.all.keys('quantidade', 'carrinhos')
  expect(body.quantidade).to.eq(body.carrinhos.length)
  body.carrinhos.forEach(expectCartContract)
}
