export const expectCreatedResourceContract = (body) => {
  expect(body).to.have.all.keys('message', '_id')
  expect(body._id).to.be.a('string').and.not.be.empty
}
