const { defineConfig } = require('cypress')
const { generateTestReport } = require('./cypress/plugins/testReport')

const frontUrl = process.env.SERVEREST_FRONT_URL || 'https://front.serverest.dev'
const apiUrl = process.env.SERVEREST_API_URL || 'https://serverest.dev'

module.exports = defineConfig({
  allowCypressEnv: false,
  expose: {
    apiUrl
  },
  e2e: {
    setupNodeEvents(on) {
      on('after:run', generateTestReport)
    },
    baseUrl: frontUrl,
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    retries: {
      runMode: 2,
      openMode: 0
    }
  }
})
