
# Small-Business Ecommerce Platform

<img src="./assets/demo.gif" width="800" />

A deployed full-stack ecommerce application built with Next.js and PostgreSQL. The platform supports storefront management, persistent shopping carts, customer accounts, address validation, Stripe checkout, order administration, transactional email, and traffic analytics.

The application was designed as a configurable ecommerce foundation for small businesses. It was initially architected for self-hosted Docker deployment and later migrated to Vercel and Neon after evaluating the hardware, maintenance, and operational requirements of the intended store owner.

## Project Status

The application is deployed and publicly accessible as a functional demonstration environment.

It is not currently operating as an active commercial storefront because the intended merchant has not launched store operations. As a result:

* Stripe remains configured in test mode.
* No real customer payments are processed.
* The application does not yet have meaningful commercial order volume.
* Traffic and visitor behavior are monitored through Vercel Web Analytics and traffic insights.

The lack of active sales reflects the merchant’s operational status, not an inability to deploy or operate the software.

## System Capabilities

### Customer Storefront

* Product catalog and product detail pages
* Responsive mobile and desktop layouts
* Seasonal and scheduled visual themes
* Store announcements and customer-facing notes
* Persistent product and store data

### Shopping Cart

* Persistent guest carts using browser cookies
* Account-associated carts for authenticated customers
* Cross-session cart continuity
* Quantity management and cart updates
* Transition between anonymous and authenticated shopping

### Customer Accounts

* User registration
* Login and persistent sessions
* Account-linked shopping behavior
* Customer order-history access

### Checkout

* Complete cart-to-checkout workflow
* Server-integrated Stripe payment processing
* USPS address verification
* Standardized shipping-address collection
* Order creation following payment confirmation
* Transactional confirmation emails

### Address Validation

The checkout system integrates with USPS to validate and standardize shipping addresses before an order is finalized.

This helps identify incomplete or incorrectly formatted addresses before they enter the order-management workflow.

### Transactional Email

Resend is used to deliver customer-facing transactional email, including:

* Order confirmations
* Purchase receipts
* Order-related notifications

### Administrative Dashboard

The administrative interface provides operational control over the storefront.

Current capabilities include:

* Product creation and editing
* Inventory management
* Order visibility
* Store announcements
* Customer-facing content management
* Basic sales reporting
* Store configuration controls

### Analytics and Traffic Insights

Vercel Web Analytics and platform traffic insights are enabled.

The deployment provides visibility into areas such as:

* Page and route traffic
* Visitor sources and referrers
* Browser and device patterns
* Geographic traffic patterns
* Deployment traffic
* Application usage trends

Because the store is not commercially active, current analytics primarily represent demonstration, development, automated, and incidental visitor traffic rather than established customer behavior.

## Architecture

### Primary Technology Stack

* Next.js
* React
* TypeScript / JavaScript
* Tailwind CSS
* PostgreSQL
* Neon
* Stripe
* USPS API
* Resend
* Vercel
* Docker
* Git and GitHub

### Application Architecture

```
Customer Browser
       |
       v
Vercel — Next.js Application
       |
       +------ Neon PostgreSQL
       |
       +------ Stripe
       |
       +------ USPS Address Validation
       |
       +------ Resend Transactional Email
```

Next.js provides both the customer-facing application and server-side application functionality.

PostgreSQL stores persistent commerce data, including products, users, carts, and orders.

External service integrations are separated by responsibility:

* Stripe handles payment processing.
* USPS validates shipping addresses.
* Resend delivers transactional emails.
* Vercel hosts the application and provides deployment and traffic insights.
* Neon provides managed PostgreSQL infrastructure.

## Checkout Workflow

```text
Browse Products
      |
      v
Add Products to Cart
      |
      v
Enter Customer Information
      |
      v
Validate Shipping Address
      |
      v
Initiate Stripe Payment
      |
      v
Confirm Payment
      |
      v
Create Order
      |
      v
Send Confirmation Email
```

The workflow coordinates multiple external and internal systems while maintaining the separation between customer interaction, payment processing, order persistence, and email delivery.

## Cart State Design

The platform supports two cart states:

### Guest Cart

Anonymous customers can retain cart contents between page visits using cookie-based persistence.

### Authenticated Cart

Logged-in customers can associate cart behavior with a persistent account and retain access across sessions.

This design reduces the need to create an account before browsing or building a cart while still supporting persistent customer relationships.

## Deployment Evolution

### Initial Architecture

The original deployment design used Docker containers for:

* The Next.js application
* PostgreSQL
* Local or low-cost hardware hosting

This approach provided infrastructure control and application portability.

### Operational Constraint

The intended store environment did not have appropriate hardware or a practical maintenance model for reliable self-hosting.

Continuing with the original architecture would have transferred server maintenance, database administration, backups, availability, and hardware support responsibilities to a nontechnical business owner.

### Migration Decision

The application was migrated to:

* Vercel for application hosting
* Neon for managed PostgreSQL

The revised architecture reduced operational complexity and removed the immediate requirement for dedicated end-user hardware.

### Trade-Offs

The managed deployment provides:

* Simpler maintenance
* Easier remote deployment
* Managed database availability
* Lower hardware dependency
* Faster application updates

The trade-offs include:

* External platform dependency
* Recurring service constraints
* Less direct infrastructure control
* Potential migration work if hosting requirements change

The application retains Docker support for development and can be re-containerized for another deployment environment if required.

## Engineering Decisions Demonstrated

This project required decisions across several areas:

* Guest versus authenticated application state
* Relational commerce data modeling
* Customer and administrator workflow separation
* Payment-service integration
* Shipping-address validation
* Transactional email handling
* Managed versus self-hosted infrastructure
* Operational simplicity versus infrastructure control
* Reusable platform design versus business-specific customization

## Current Testing and Validation

The application has been manually exercised through its primary workflows, including:

* Product browsing
* Cart persistence
* Customer authentication
* Address validation
* Stripe test-mode checkout
* Order creation
* Administrative product management
* Transactional email delivery
* Responsive layouts

Stripe test mode is used to simulate payment behavior without processing real funds.

An automated test suite is the next major engineering milestone. Planned coverage includes unit, integration, and end-to-end testing for the highest-risk commerce workflows.

## Current Limitations

* The intended merchant has not launched active store operations.
* Stripe remains in test mode.
* There is no established production transaction volume.
* Automated test coverage has not yet been implemented.
* Sales analytics have limited business value until commercial activity begins.
* The multi-business configuration system is not fully generalized.
* Some reporting and inventory tools can be expanded.

These limitations are documented to distinguish technical implementation from real-world commercial validation.

## Next Engineering Priorities

1. Add automated tests for cart, checkout, authorization, inventory, and order creation.
2. Test duplicate and failed Stripe payment events.
3. Expand administrative reporting.
4. Complete configuration-driven business customization.
5. Add custom commerce events to complement platform traffic analytics.
6. Validate the platform with an actively operating merchant.
7. Prepare the Stripe integration for live payment processing when a merchant is ready to launch.

## Skills Demonstrated

### Full-Stack Development

* Next.js application development
* React interface development
* Server-side application logic
* PostgreSQL data persistence
* Responsive UI implementation
* Customer and administrator workflows

### Systems Integration

* Stripe payment integration
* USPS address-validation integration
* Resend transactional-email integration
* Third-party API handling
* Multi-service workflow coordination

### Application State and Data

* Persistent guest carts
* Authenticated customer state
* Relational data modeling
* Customer accounts
* Orders and inventory
* Cross-session continuity

### Infrastructure and Deployment

* Docker architecture
* Managed cloud deployment
* Vercel hosting
* Neon PostgreSQL
* Environment configuration
* Deployment architecture migration

### Engineering Judgment

* Constraint-driven architecture
* Infrastructure trade-off analysis
* Operational simplification
* Maintainability considerations
* Reusable application design
* Honest documentation of system limitations

## Summary

This project is a publicly deployed ecommerce application designed around real small-business commerce requirements.

It demonstrates the ability to design and implement:

* A complete customer storefront
* Persistent customer state
* A multi-stage checkout pipeline
* Payment and shipping integrations
* Order-management workflows
* Administrative tooling
* Transactional communications
* Managed cloud infrastructure
* Traffic and usage analytics

The application is technically functional and deployed, but it is not represented as an active commercial store because the intended merchant has not begun operating the business.
