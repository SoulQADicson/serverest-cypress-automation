# ServeRest Test Automation with Cypress

A maintainable, risk-based Cypress and JavaScript test suite for the [ServeRest frontend](https://front.serverest.dev/) and [ServeRest API](https://serverest.dev/).

## Quality scope

The suite contains 61 catalogued and automated scenarios:

- 46 API scenarios covering positive and negative contracts for authentication, users, products, and carts;
- 15 frontend scenarios covering registration, authentication, role-based routing, product administration, catalogue search, and shopping-list behaviour;
- 32 P0 critical-path scenarios.

Every scenario is classified by layer, domain, priority, product risk, and CTFL-aligned test design technique. The detailed strategy is available in the [test coverage matrix](docs/test-coverage.md), while frontend-specific coverage and selector decisions are described in the [frontend coverage assessment](docs/frontend-coverage.md).

Mutable test data uses unique identifiers to reduce collisions in the public environment. Test-created users, products, and carts are removed through teardown routines. Immutable fixtures may be reused within a specification when this does not compromise test isolation.

## Prerequisites

- Node.js 20 or later;
- npm;
- internet access to the public ServeRest environments.

No credentials or secret environment variables are required. Public application URLs are centralised in `cypress.config.js`.

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
npm run quality       # Run lint and the complete suite
npm run quality:api   # Run lint and API tests only
npm run quality:front # Run lint and frontend tests only
```

## Test reporting

Every headless execution generates:

- `reports/test-report.html`: a self-contained visual report;
- `reports/test-results.json`: structured execution results for integrations and analysis.

The report presents the P0 pass rate, domain coverage, CTFL techniques, product risks, execution errors, duration, and catalogued scenarios outside the selected execution scope. After a local headless execution, the HTML report opens in the default browser. Automatic opening is disabled in CI environments.

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

The first optimisation layer removed redundant setup calls without changing the number of tests, assertions, or coverage. The validated suite remains at 61/61 passing tests and 32/32 passing P0 scenarios. Its implementation and benchmark limitations are documented in [performance optimisation](docs/performance-optimization.md).

Because `serverest.dev` is public and shared, network latency and concurrent activity can materially affect duration. For critical pipelines and reproducible benchmarks, use an isolated, version-controlled ServeRest instance.

## Git workflow

Development is performed on dedicated feature or performance branches. Local commits preserve stable checkpoints before integration. A commit does not modify the remote repository; publication occurs only through an explicit `git push`, followed by review before merging into the main branch.
