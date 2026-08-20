# ServeRest Test Automation with Cypress

A maintainable, risk-based Cypress and JavaScript test suite for the [ServeRest frontend](https://front.serverest.dev/) and [ServeRest API](https://serverest.dev/).

## Quality scope

The suite contains 64 catalogued and automated scenarios:

- 48 API scenarios covering positive and negative contracts for authentication, security, users, products, and carts;
- 16 frontend scenarios covering registration, authentication, effective authorisation, role-based routing, product administration, catalogue search, and shopping-list behaviour;
- 35 P0 critical-path scenarios.

Every scenario is classified by layer, domain, priority, product risk, and CTFL-aligned test design technique. The detailed strategy is available in the [test coverage matrix](docs/test-coverage.md), while frontend-specific coverage and selector decisions are described in the [frontend coverage assessment](docs/frontend-coverage.md).

Mutable test data uses unique identifiers to reduce collisions in the public environment. Test-created users, products, and carts are removed through verified teardown routines. Immutable fixtures may be reused within a specification when this does not compromise test isolation.

## Prerequisites

- Node.js 20 or later;
- npm;
- internet access to the public ServeRest environments.

No credentials or secret environment variables are required. Public application URLs are centralised in `cypress.config.js`.

The same suite can target an isolated or staging environment without code changes:

```bash
SERVEREST_API_URL=http://localhost:3000 SERVEREST_FRONT_URL=http://localhost:3001 npm test
```

On PowerShell, set `$env:SERVEREST_API_URL` and `$env:SERVEREST_FRONT_URL` before running the command. When omitted, the public ServeRest URLs remain the defaults.

## Installation

```bash
npm ci
```

## Execution

Run the complete suite:

```bash
npm test
```

Available commands:

```bash
npm run test:e2e      # Run frontend tests only
npm run test:api      # Run API tests only
npm run test:report   # Run the complete suite and generate the report
npm run cy:open       # Open the interactive Cypress interface
npm run lint          # Run static analysis
npm run quality:static # Validate lint, catalogue traceability, and Cypress anti-patterns
npm run quality       # Run lint and the complete suite
npm run quality:api   # Run lint and API tests only
npm run quality:front # Run lint and frontend tests only
```

## Test reporting

Every headless execution generates:

- `reports/test-report.html`: a self-contained visual report;
- `reports/test-results.json`: structured execution results for integrations and analysis.

The report presents the P0 pass rate, domain coverage, CTFL techniques, product risks, execution errors, duration, retry count, flaky tests, and catalogued scenarios outside the selected execution scope. After a local headless execution, the HTML report opens in the default browser. Automatic opening is disabled in CI environments.

GitHub Actions validates source code, catalogue/spec synchronisation, Cypress anti-patterns, and dependency vulnerabilities before executing API and frontend suites independently. Each layer publishes its own HTML/JSON evidence and failure screenshots, while the job summary shows totals, P0 pass rate, duration, flaky tests, and failed scenario IDs. A weekly scheduled run monitors the shared public environment.

## Project structure

```text
cypress/
  constants/        # Routes, selectors, and business messages
  e2e/api/          # API specifications
  e2e/frontend/     # Frontend specifications
  fixtures/         # Executable test catalogue
  pages/            # Page Objects and shared UI components
  plugins/          # Test report generation
  schemas/          # Reusable response contracts
  services/         # Domain-specific API clients
  support/          # Commands and global Cypress configuration
  utils/            # Dynamic test-data factories
docs/               # Coverage, design decisions, and performance evidence
reports/            # Generated HTML and JSON reports
.github/workflows/  # Continuous integration pipeline
```

Headless failures generate screenshots in `cypress/screenshots/`. Video recording is disabled to keep executions lightweight.

## Performance and reliability

The first optimisation layer removed redundant setup calls without weakening coverage. Repeated non-authentication UI scenarios use validated `cy.session()` caches, while authentication tests continue through the complete UI flow. Its implementation and benchmark limitations are documented in [performance optimisation](docs/performance-optimization.md).

Because `serverest.dev` is public and shared, network latency and concurrent activity can materially affect duration. For critical pipelines and reproducible benchmarks, use an isolated, version-controlled ServeRest instance.

Latest complete validation: 64/64 scenarios passed, 35/35 P0 passed, zero flaky tests, and zero known npm dependency vulnerabilities (97.8 seconds on the recorded Electron run).

## Security and known external limitations

- Positive API clients fail immediately on unexpected HTTP errors; negative scenarios must explicitly use an `attempt*` operation.
- Credentials and bearer tokens are suppressed from the Cypress command log where requests carry sensitive data.
- The suite verifies malformed and revoked tokens, administrative API authorisation, and that a standard user cannot persist catalogue changes through a directly opened admin page.
- The educational ServeRest API currently returns plaintext passwords from user queries. Safe schema validation rejects this by default; compatibility checks against the public service must explicitly acknowledge `allowSensitiveFields`. This is a documented external security risk, not an accepted production design.
- The public frontend currently renders `/admin/home` to an authenticated standard user, although protected product mutations are rejected with HTTP 403. The suite validates the effective server-side boundary and retains the visible route as a known defence-in-depth limitation.

## Git workflow

Development is performed on dedicated feature or performance branches. Local commits preserve stable checkpoints before integration. A commit does not modify the remote repository; publication occurs only through an explicit `git push`, followed by review before merging into the main branch.
