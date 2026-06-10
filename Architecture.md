# Architecture Overview

## Project Purpose

This project is a full-stack ecommerce platform developed for a small business storefront.

The original goal was to provide a non-technical business owner with the ability to:

- Manage products and inventory
- Accept online orders
- Process payments
- Manage storefront content
- Review business analytics
- Operate without requiring technical assistance

The long-term goal is to evolve the platform into a reusable ecommerce template that can be customized and deployed for multiple small businesses with minimal configuration.

The platform is currently deployed and publicly accessible. Payment processing remains configured with Stripe test credentials while the business operates in a pre-launch state.

---

# System Overview

The application consists of:

- Next.js frontend and backend
- PostgreSQL relational database
- Stripe payment integration
- Resend email service
- Administrative dashboard
- Customer account management
- Product and inventory management
- Analytics reporting
- Responsive desktop and mobile interfaces

The system is designed to provide a complete ecommerce workflow for both customers and store administrators.

## Customer Flow

Customer
    ↓
Browse Products
    ↓
Add Items To Cart
    ↓
Checkout
    ↓
Stripe Payment
    ↓
Order Creation
    ↓
Email Confirmation

# Administrative Flow

Administrator
    ↓
Dashboard
    ↓
Manage Products
Manage Inventory
Manage Store Notes
View Analytics
Review Orders 

# Technology Stack
Component |	Technology
Frontend  |	Next.js
Styling	  | Tailwind CSS
Backend	  | Next.js Server Actions / Route Handlers
Database  |	PostgreSQL
Database Hosting  |	Neon
Hosting   |	Vercel
Payments  |	Stripe
Email Delivery  |	Resend
Version Control | 	GitHub

# Frontend Architecture

The frontend is implemented using Next.js and Tailwind CSS.

Key frontend capabilities include:

Responsive desktop support
Responsive mobile support
Product browsing
Shopping cart management
User authentication
Account management
Checkout workflows
Store announcements
Seasonal landing page themes

The storefront dynamically rotates visual themes based on scheduled holidays and seasonal events.

Store administrators can publish notes and community announcements that are displayed directly on the storefront without requiring code modifications.

# Authentication and User Accounts

The platform supports customer account creation and authentication.

Registered users can:

Create accounts
Log in
Save account preferences
View order information
Receive order confirmations

Account functionality exists to improve customer experience and provide a foundation for future account-based features.

# Shopping Cart Architecture

The shopping cart is designed to function independently of account authentication.

Cart state is persisted through browser cookies, allowing:

Guest checkout workflows
Session persistence
Reduced onboarding friction
Shopping without mandatory account creation

This design allows customers to begin purchasing immediately without requiring registration.

# Product and Inventory Management

The platform includes a management interface designed for non-technical store owners.

Administrative functionality includes:

Product creation
Product editing
Product image management
Inventory management
Store announcements
Community event management

The goal of the administrative interface is to allow routine business operations without requiring direct developer involvement.

# Payment Processing

Payment processing is implemented through Stripe.

The checkout process follows:

Cart
    ↓
Checkout
    ↓
Stripe Payment Session
    ↓
Payment Confirmation
    ↓
Order Creation
    ↓
Customer Receipt

The system is currently configured using Stripe development credentials.

Transitioning to production operation primarily requires replacing development credentials with production credentials and completing Stripe business onboarding requirements.

A platform fee is applied during checkout to offset ongoing maintenance and operational costs.

# Email System

Transactional email delivery is handled through Resend.

Current email functionality includes:

Order confirmations
Customer receipts

The email infrastructure was designed to support future notification workflows as additional platform functionality is added.

# Administrative Dashboard

The administrative dashboard provides operational visibility into store activity.

Current dashboard capabilities include:

Product management
Inventory management
Store content management
Community event management
Sales reporting
Revenue tracking

The dashboard is intended to provide a simple operational interface for non-technical users.

Analytics functionality is currently under active development.

# Database Architecture

The platform uses PostgreSQL as its primary persistent datastore.

The data model follows a traditional relational design using primary and foreign key relationships.

## Core Entities
Users
Products
ProductImages
Orders
OrderItems
StoreNotes

## Relationship Overview
Users
    ↔ Orders

Orders
    ↔ OrderItems

Products
    ↔ ProductImages

Products
    ↔ OrderItems

The relational structure provides consistency across customer, product, inventory, and order management workflows.

# Deployment Architecture

The application is deployed through Vercel.

Persistent data is hosted using Neon PostgreSQL.

Source control and project management are maintained through GitHub.

## Infrastructure Layout
Client Browser
        ↓
      Vercel
        ↓
Next.js Application
        ↓
Neon PostgreSQL

Checkout Requests
        ↓
Stripe

Transactional Emails
        ↓
Resend

# Hosting Strategy

The platform currently operates primarily on free-tier infrastructure.

Services include:

Vercel
Neon
Stripe Test Environment

The hosting strategy minimizes operational expenses during the pre-launch phase while maintaining a publicly accessible and functional deployment.

Infrastructure can be upgraded to paid tiers as traffic, storage, and operational requirements increase.

# Security Considerations

Current security measures include:

Account-based authentication
Password hashing
Server-side database access
Stripe-managed payment processing
Managed infrastructure providers

Sensitive payment information is not stored directly by the application and is handled through Stripe's payment infrastructure.

## Deployment Evolution

The system was initially designed and implemented as a self-hosted application using Docker.

### Initial Deployment Model (Self-Hosted)

The original deployment architecture consisted of:

- Next.js application running in a Docker container
- PostgreSQL database running in a separate Docker container
- Local execution environment intended for low-cost hardware (e.g., a laptop or small local server)

This configuration allowed the entire system to run independently of cloud infrastructure.

### Transition to Managed Infrastructure

The deployment model was later migrated to:

- Vercel (Next.js hosting) //easily revertable via .env.local setup
- Neon (managed PostgreSQL)

This change was driven by practical constraints:

- End-user did not have suitable hardware for local hosting
- Reduced operational complexity
- Improved reliability and accessibility
- Lower maintenance burden for a non-technical operator

### Current Architecture

The system is currently deployed as a cloud-hosted application while retaining a portable architecture that could be re-containerized if required in the future.

# Current Limitations

Known limitations include:

Limited production traffic testing
No dedicated QA team
Analytics functionality remains incomplete
Reusable business templating remains under development
Automated testing coverage remains limited

As a single-developer project, some edge cases may remain undiscovered until broader usage occurs.

# Future Improvements

Planned improvements include:

Expanded analytics reporting
Reusable business templates
Configuration-driven theming
Enhanced inventory reporting
Automated testing
Improved operational monitoring
Multi-business deployment support

The long-term vision is to provide a reusable ecommerce platform that can be configured for different small businesses while sharing a common architecture and feature set.