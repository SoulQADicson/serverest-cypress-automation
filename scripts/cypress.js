const { spawnSync } = require('child_process')

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const command = process.platform === 'win32' ? 'cypress.cmd' : 'cypress'
const result = spawnSync(command, process.argv.slice(2), {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

if (result.error) {
  console.error(`Não foi possível iniciar o Cypress: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
