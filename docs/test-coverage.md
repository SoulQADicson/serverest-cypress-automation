# Test Strategy and Coverage Matrix

## Objective

This suite protects the critical ServeRest store journeys through a risk-based approach. The API layer covers most business rules and service contracts, while the frontend layer covers essential customer and administrator journeys.

The executable catalogue is maintained in `cypress/fixtures/testCatalog.json`. Every automated test includes:

- a stable identifier;
- a test layer (`API` or `UI`);
- a functional domain;
- a risk-based priority (`P0` critical, `P1` high, or `P2` supplementary);
- a CTFL-aligned test design technique;
- the mitigated product risk.

This metadata is incorporated automatically into the HTML report.

## Coverage by domain

| Domain | API | UI | Principal rules covered |
|---|---:|---:|---|
| Authentication and security | 5 | 8 | Valid login, invalid credentials, malformed and revoked tokens, mandatory fields, registration, effective authorisation, role-based routing, and logout |
| Users | 11 | Integrated into authentication | CRUD, invalid fields, identifiers, unknown resources, uniqueness, documented upsert behaviour, and filters |
| Products | 15 | 3 | CRUD, boundaries, identifiers, unknown resources, authentication, authorisation, duplicates, active carts, and filters |
| Carts | 17 | 0 | Creation, totals, stock, authentication, identifiers, invalid or duplicate products, missing carts, cancellation, and completion |
| Catalogue | 0 | 2 | Exact product search and unknown search result |
| Shopping list | 0 | 3 | Addition, quantity changes, clearing, and empty state |
| **Total** | **48** | **16** | **64 automated scenarios** |

## P0 critical paths

The executable catalogue currently identifies 35 P0 scenarios. They protect the following critical capabilities:

1. customer registration and authentication;
2. rejection of invalid credentials;
3. secure session termination;
4. correct role-based routing;
5. administrator-only product maintenance;
6. product publication and catalogue discovery;
7. product selection and quantity transitions;
8. cart creation and total calculation;
9. stock reduction upon reservation;
10. prevention of purchases above available stock;
11. stock restoration following cancellation;
12. purchase completion without inappropriate stock restoration;
13. protection against unauthenticated or unauthorised state changes;
14. prevention of orphaned carts and invalid product deletion.

## CTFL-aligned techniques

| Technique | Application |
|---|---|
| Equivalence partitioning | Credentials, filters, valid data, invalid data, and unknown resources |
| Boundary value analysis | Product price, stock, cart totals, malformed identifiers, and quantities immediately above stock |
| Decision-table testing | Missing token, standard user, administrator, duplicate resources, and role-based outcomes |
| State-transition testing | Create, update, delete, reserve, restore, consume, add, change quantity, and clear |
| Use-case testing | End-to-end registration, login, product, cart, and purchase journeys |

## Maintainability principles

- Mutable test data receives unique identifiers to support repeatability and reduce collisions.
- Users, products, and carts created by automation are removed through teardown hooks.
- Immutable prerequisites may be shared within a specification when test independence is preserved.
- API services centralise routes, requests, and authentication headers.
- Page Objects encapsulate stable `data-testid` selectors.
- Reusable schemas validate response structure, types, and invariants.
- Tests verify HTTP status, contract, business rule, and persisted effects where applicable.
- The report distinguishes catalogued coverage from scenarios executed in a selected run.
- Retries are enabled only in headless mode; every attempt is reported and a recovered test is classified as flaky.
- Performance optimisations must not remove cases, assertions, or independent mutable state.

## Current validation baseline

- Automated scenarios: 64.
- API scenarios: 48.
- Frontend scenarios: 16.
- P0 critical scenarios: 35.
- Latest complete result: 64/64 passed, 35/35 P0 passed, and zero flaky tests.
- Latest recorded duration after first-layer optimisation: 186.4 seconds.

## Known limitations

The `serverest.dev` environment is public and shared. Data may be affected by concurrent executions, and network availability is outside the suite's control. Critical pipelines, reproducible benchmarks, and release evidence should use an isolated and version-controlled ServeRest instance.

Functional Cypress automation does not replace accessibility, load, visual-regression, penetration, or exploratory testing. Those activities require separate objectives, environments, and specialised tools.
