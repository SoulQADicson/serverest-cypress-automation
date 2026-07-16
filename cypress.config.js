const { defineConfig } = require('cypress')
const { generateTestReport } = require('./cypress/plugins/testReport')

module.exports = defineConfig({
  allowCypressEnv: false,
  expose: {
    apiUrl: 'https://serverest.dev'
  },
  e2e: {
    setupNodeEvents(on) {
      on('after:run', generateTestReport)
    },
    baseUrl: 'https://front.serverest.dev',
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
