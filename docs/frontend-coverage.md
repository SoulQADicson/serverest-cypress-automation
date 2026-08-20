# Frontend Test Coverage

## Scope and approach

The assessment covers the user journeys currently available at `https://front.serverest.dev/`. Scenarios are prioritised by product risk and designed in accordance with CTFL principles. The suite applies equivalence partitioning, boundary value analysis, decision tables, state-transition testing, and use-case testing.

Within this project, complete coverage means covering relevant behavioural classes, critical paths, and representative positive and negative outcomes. It does not mean testing every theoretical combination of input values.

## Executable coverage matrix

| Domain | Positive | Negative | Total | Principal coverage |
|---|---:|---:|---:|---|
| Authentication, registration, and security | 3 | 5 | 8 | Registration, login, logout, roles, effective authorisation, invalid credentials, duplicate identity, and mandatory fields |
| Product administration | 1 | 2 | 3 | Product creation, mandatory fields, and duplicate names |
| Product catalogue | 1 | 1 | 2 | Exact search and unknown product |
| Shopping list | 3 | 0 | 3 | Addition, quantity transition, removal, and empty state |
| **Frontend total** | **8** | **8** | **16** | Critical journeys available through the user interface |

Authorisation rules, complete CRUD contracts, stock limits, and cart rules are covered in greater depth at the API layer. This distribution avoids unnecessary UI duplication and supports a sustainable test pyramid.

## Selector strategy

Selectors follow this order of preference:

1. `data-testid`, centralised in `cypress/constants/selectors.js`;
2. unique, visible business data, such as a generated product name;
3. visible message text when the message itself is the expected result;
4. a CSS class only to delimit a component for which no stable identifier exists.

The catalogue does not expose a `data-testid` on the product title or a unique identifier on each product card. The automation therefore locates the unique product name and uses `.closest('.card')` solely to associate the relevant “Add to list” action with that product. The recommended product improvement is to expose an identifier such as `data-testid="product-card-<id>"`.

The suite does not use positional selectors such as `:nth-child`, XPath expressions, styling classes as direct action targets, arbitrary fixed waits, or dynamically generated DOM identifiers.

## Test isolation and data management

- Browser cookies and local storage are cleared before every frontend scenario.
- Unique mutable data is created through factories.
- Shared spec-level fixtures are limited to immutable prerequisites.
- Products, users, and carts created by the suite are removed through teardown hooks.
- UI authentication remains part of scenarios that explicitly validate login or role-based navigation.
- Other repeated UI journeys restore a validated Cypress session to reduce login overhead without sharing business state.

## Known limitations outside functional UI automation

- Administrative reporting is presented by the application as a feature under construction.
- A standard user can render the public frontend administration route directly. Server-side protected mutations still return HTTP 403 and are covered end to end; route hiding remains a recommended defence-in-depth improvement.
- Not every row-level administrative action exposes a stable selector.
- Detailed cart, stock, and authorisation rules remain at the faster and more deterministic API layer.
- Accessibility, performance, visual responsiveness, and specialised security testing require dedicated criteria and tools; Cypress functional tests do not replace those disciplines.
