# ServeRest Test Automation with Cypress

A Cypress and JavaScript test suite for the [ServeRest frontend](https://front.serverest.dev/) and the [ServeRest API](https://serverest.dev/).

## Test coverage

### Frontend (3 test cases)

1. `CT01` - Successful registration of a standard user.
2. `CT02` - Login attempt with invalid credentials.
3. `CT03` - Product registration by an administrator.

### API (3 test cases)

1. `CT04` - `POST /usuarios`: successful user creation and response validation.
2. `CT05` - `POST /login`: rejection of invalid credentials.
3. `CT06` - `GET /produtos`: product listing and response contract validation.

Mutable test data uses unique identifiers. Users and products created during a test are removed by its teardown routine.

The test strategy and the mapping between test cases and CTFL techniques are documented in the [test coverage matrix](docs/test-coverage.md).

## Prerequisites

- Node.js 20 or later
- npm

## Installation and execution

```bash
npm ci
npm test
```

Every headless execution automatically generates:

- `reports/test-report.html`: a self-contained visual report with a chart for passed, failed, and skipped tests;
- `reports/test-results.json`: structured results for integration with other tools.

After a local headless run finishes, the updated HTML report opens automatically in the default browser. This step is skipped in CI environments.

Additional commands:

```bash
npm run test:e2e      # run frontend tests only
npm run test:api      # run API tests only
npm run test:report   # run the complete suite and generate the HTML report
npm run cy:open       # open the interactive Cypress interface
npm run lint          # run static analysis on the JavaScript code
npm run quality       # run lint and the complete test suite
npm run quality:api   # run lint and API tests only
npm run quality:front # run lint and frontend tests only
```

No credentials or secret environment variables are required. Public application URLs are centralized in `cypress.config.js`.

## Project structure

```text
cypress/
  e2e/api/          # API tests
  e2e/frontend/     # frontend tests
  pages/            # Page Objects and shared UI components
  services/         # API clients separated by domain
  schemas/          # reusable response contracts
  constants/        # routes and business messages
  support/          # reusable commands and global configuration
  utils/            # dynamic test data factories
docs/               # test strategy and CTFL coverage matrix
reports/            # HTML and JSON test reports
.github/workflows/  # continuous integration pipeline
```

Headless failures generate screenshots in `cypress/screenshots/`. Video recording is disabled to keep test runs lightweight. The report is recreated after every headless execution and requires no external services or additional reporting dependencies.
