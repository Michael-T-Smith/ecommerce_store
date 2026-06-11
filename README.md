# Ecommerce Platform

A full-stack ecommerce platform built with Next.js for small-business storefronts, including product management, checkout, payments (Stripe), shipping validation (USPS), and an administrative dashboard.

The system was originally designed as a self-hosted Docker-based deployment and later migrated to managed cloud infrastructure for operational simplicity.

---

## Live System

The application is deployed and accessible online.

- Frontend + Backend: Vercel
- Database: Neon PostgreSQL
- Payments: Stripe (test mode)
- Email: Resend

---

## Core Features

<img src="./assets/demo.gif" width="800" />

### Storefront
- Product catalog and product detail pages
- Responsive mobile and desktop UI
- Seasonal / scheduled theme variations
- Store announcements / notes system

### Shopping Cart
- Persistent cart for guest users (cookies)
- Account-linked cart behavior for authenticated users
- Cross-session continuity

### Authentication
- User registration and login
- Persistent user accounts
- Order history access

### Checkout System
- Full checkout workflow
- Stripe payment integration (currently test mode)
- Order creation after payment confirmation

### Address Validation
- USPS address verification during checkout
- Ensures standardized and valid shipping addresses before order creation

### Email System
- Transactional emails via Resend
- Order confirmation and receipt delivery

### Admin Dashboard
- Product and inventory management
- Order visibility
- Store content management (notes, announcements)
- Basic sales analytics

---

## Architecture Overview

### Tech Stack

- Next.js (full-stack React framework)
- Tailwind CSS
- PostgreSQL (Neon)
- Stripe (payments)
- Resend (email)
- Vercel (hosting)
- GitHub (version control)

---

### System Flow


Customer
  → Browse Products
  → Add to Cart
  → Checkout
  → USPS Address Validation
  → Stripe Payment
  → Order Creation
  → Email Confirmation
  
# Deployment Architecture

Client
  ↓
Vercel (Next.js App)
  ↓
Neon PostgreSQL //Optional Docker Configuration for local hosting.

External Services:
- Stripe (Payments)
- Resend (Emails)
- USPS API (Address Validation)

# Design Notes

Cart system supports both guest and authenticated users
Checkout includes address validation prior to payment processing
System is designed to be reusable as a configurable ecommerce template
Admin dashboard separates operational control from customer-facing UI
Architecture prioritizes simplicity and deployability for small businesses
Deployment History

The system was originally designed for a fully self-hosted Docker deployment:

Next.js application container
PostgreSQL database container
Local or low-cost hardware deployment

It was later migrated to managed services (Vercel + Neon) due to real-world operational constraints, including lack of suitable end-user hardware and the need for simplified maintenance.

The architecture remains portable and could be re-containerized if required.

# Current Limitations
- Payment processing is in Stripe test mode
- Limited production traffic testing
- No automated test suite
- Analytics system is partially implemented
- Template-based multi-business configuration is not fully completed
- Future Improvements
- Full production Stripe integration
- Expanded analytics dashboard
- Automated testing coverage
- Config-driven multi-business template system
- Improved observability and logging
- Enhanced inventory and reporting tools

# Summary

This project is a production-style ecommerce system with:

- Full checkout pipeline
- Payment integration
- Shipping validation
- Admin tooling
- Persistent data layer
- Cloud deployment infrastructure

It is designed to be both a functioning storefront and a reusable ecommerce foundation for small businesses. 
