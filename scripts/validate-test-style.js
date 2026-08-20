const fs = require('fs')
const path = require('path')

const root = path.resolve('cypress')
const files = fs.readdirSync(root, { recursive: true }).filter((file) => (
  file.endsWith('.js') && fs.statSync(path.join(root, file)).isFile()
))
const forbidden = [
  { pattern: /\b(?:it|describe)\.only\s*\(/g, message: 'teste exclusivo (.only)' },
  { pattern: /\b(?:it|describe)\.skip\s*\(/g, message: 'teste ignorado (.skip)' },
  { pattern: /cy\.wait\(\s*\d+/g, message: 'espera fixa' },
  { pattern: /cy\.url\(\)\.should\(['"]include['"]/g, message: 'asserção parcial de URL' }
]
const problems = []

for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  for (const rule of forbidden) {
    if (rule.pattern.test(source)) problems.push(`${file}: ${rule.message}`)
    rule.pattern.lastIndex = 0
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}

console.log(`Estilo Cypress validado em ${files.length} arquivos.`)
