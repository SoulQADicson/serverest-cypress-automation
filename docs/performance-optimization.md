# Test Suite Performance Optimisation

## Objective

The first optimisation layer reduces infrastructure work without removing or weakening tests, assertions, response contracts, product-risk coverage, or CTFL techniques. The suite continues to contain 61 scenarios, including 32 P0 critical-path checks.

## Implemented changes

- Cart tests now create a complete administrator, product, and customer context only when the scenario requires it.
- Product tests create an administrator and authentication token only for authenticated operations.
- Catalogue and shopping-list specifications prepare immutable prerequisites once per specification while preserving browser-state isolation before every test.
- Product-registration tests reuse one administrator within the specification and continue to remove mutable products after each applicable scenario.
- Global browser cleanup is restricted to frontend specifications and no longer adds irrelevant commands to 46 API tests.
- Dependent operations are explicitly chained so that tokens and identifiers are resolved before use, preventing race conditions in the Cypress command queue.

## Deterministic setup reduction

| Area | Before | After |
|---|---:|---:|
| Cart scenarios with complete setup | 17 | 8 |
| Cart scenarios requiring no fixture | 0 | 6 |
| Product administrators created | 15 | 8 |
| Complete catalogue/list fixture sets | 5 | 1 |
| Product-registration administrators | 3 | 1 |

## Validation evidence

- ESLint: passed.
- Cart and product specifications without retries: 32/32 passed.
- Consolidated suite: 61/61 passed.
- P0 critical scenarios: 32/32 passed.
- Removed, skipped, or weakened scenarios: zero.

The latest consolidated sample decreased from 219.8 seconds to 186.4 seconds, an improvement of approximately 15.2%. The tests use a shared public environment; therefore, network latency and concurrent load prevent the entire difference from being attributed to code changes. The reduction in setup requests is nevertheless deterministic and lowers execution load, cost, and exposure to environmental instability.

## Benchmark guidance

A reliable performance comparison should:

1. execute at least five baseline and five optimised runs;
2. use the same machine, browser, Cypress configuration, retry policy, and network conditions;
3. compare the median rather than a single result;
4. retain failure and retry information instead of excluding slow runs;
5. use an isolated ServeRest instance whenever reproducibility is required.

Parallel execution is intentionally outside this first layer. It requires safe result aggregation and controlled concurrency to avoid increasing contention in the public environment.
