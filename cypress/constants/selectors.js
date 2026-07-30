export const byTestId = (value) => `[data-testid="${value}"]`

export const TEST_IDS = Object.freeze({
  auth: {
    name: 'nome',
    email: 'email',
    loginPassword: 'senha',
    registrationPassword: 'password',
    adminCheckbox: 'checkbox',
    login: 'entrar',
    register: 'cadastrar',
    logout: 'logout'
  },
  admin: {
    createProducts: 'cadastrarProdutos',
    createUsers: 'cadastrarUsuarios',
    listProducts: 'listarProdutos',
    listUsers: 'listarUsuarios'
  },
  productForm: {
    name: 'nome',
    price: 'preco',
    description: 'descricao',
    quantity: 'quantity',
    submit: 'cadastarProdutos'
  },
  catalog: {
    search: 'pesquisar',
    searchButton: 'botaoPesquisar',
    addToList: 'adicionarNaLista'
  },
  navigation: {
    shoppingList: 'lista-de-compras'
  },
  shoppingList: {
    emptyMessage: 'shopping-cart-empty-message',
    productName: 'shopping-cart-product-name',
    productQuantity: 'shopping-cart-product-quantity',
    increase: 'product-increase-quantity',
    decrease: 'product-decrease-quantity',
    clear: 'limparLista'
  }
})
