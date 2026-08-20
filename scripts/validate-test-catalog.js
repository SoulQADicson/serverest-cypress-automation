const fs = require('fs')
const path = require('path')

const root = path.resolve('cypress', 'e2e')
const catalog = JSON.parse(fs.readFileSync(path.resolve('cypress', 'fixtures', 'testCatalog.json'), 'utf8'))
const requiredFields = ['id', 'layer', 'domain', 'priority', 'technique', 'risk']
const problems = []
const ids = catalog.map(({ id }) => id)

for (const entry of catalog) {
  for (const field of requiredFields) {
    if (!entry[field]) problems.push(`${entry.id || 'SEM-ID'}: campo obrigatório ausente: ${field}`)
  }
}

for (const id of new Set(ids)) {
  if (ids.filter((candidate) => candidate === id).length > 1) problems.push(`ID duplicado no catálogo: ${id}`)
}

const specFiles = fs.readdirSync(root, { recursive: true })
  .filter((file) => file.endsWith('.cy.js') && fs.statSync(path.join(root, file)).isFile())
const implementedIds = specFiles.flatMap((file) => {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  return [...source.matchAll(/\bit\(['"](CT-[A-Z]+-[A-Z]+-\d+)\s+-/g)].map((match) => match[1])
})

for (const id of new Set(implementedIds)) {
  if (implementedIds.filter((candidate) => candidate === id).length > 1) problems.push(`ID duplicado nas specs: ${id}`)
  if (!ids.includes(id)) problems.push(`Teste sem metadados no catálogo: ${id}`)
}

for (const id of ids) {
  if (!implementedIds.includes(id)) problems.push(`Cenário catalogado sem teste: ${id}`)
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}

console.log(`Catálogo validado: ${ids.length} IDs únicos e sincronizados com as specs.`)
