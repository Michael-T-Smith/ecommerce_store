# Lamb's Florist — Complete Project Reference
# Last updated: March 2026 — authoritative file map

## Prerequisites
```bash
node --version   # 18+
docker --version # Desktop running
npm install
```

## .env.local
```
DATABASE_URL=postgresql://lambs:lambs@127.0.0.1:5432/lambsflorist
JWT_SECRET=your-secret-here-change-this-before-go-live
NODE_ENV=development
```

## First-time Database Setup
```bash
# Start Postgres
docker compose up -d

# Create schema
docker exec -i lambs_postgres psql -U lambs -d lambsflorist < sql/init.sql

# Run migrations
docker exec -i lambs_postgres psql -U lambs -d lambsflorist < sql/migrations/002_customers.sql
docker exec -i lambs_postgres psql -U lambs -d lambsflorist < sql/migrations/003_variants_locations.sql

# Create staff accounts (Cecelia admin1234, Frank manager1234)
node scripts/seed-admin.js

# Optional — load sample inventory and orders
node scripts/seed-dev.js
```

---

## Auth Architecture (production-ready, no SKIP_AUTH)

```
Browser → GET /dashboard
  ↓
middleware.js          (Edge)
  Checks lambs_session cookie exists → if absent, redirect to /dashboard/login
  Cookie present → NextResponse.next() — no JWT parse needed here

  ↓
src/app/dashboard/(shell)/layout.js   (Server Component)
  Calls getSession() → reads lambs_session cookie, verifies JWT via jose
  If null/invalid → redirect("/dashboard/login")
  Builds user = { id, name, email, role }
  Renders <DashboardShell initialUser={user}>

  ↓
DashboardShell.js      (Client Component)
  Wraps children in <DashboardSessionProvider initialUser={user}>

  ↓
SessionContext.js      (Client)
  Context.Provider value = { user, logout }
  NO useState, NO client fetch, NO mock fallback

  ↓
useDashboardSession()  (any child client component)
  Returns { user, logout }
```

### Files that MUST NOT exist
- `src/app/dashboard/layout.js` — **DELETE THIS FILE**
  Was a client-only wrapper from early development that shadows the (shell) layout
  and injects a broken SessionProvider with no user. Causes the "Unknown user" bug.

---

## Complete File Map

Every file the project needs, where to find it in the outputs folder,
and where to place it in your project.

### Project Root
| Output file | → Project path |
|---|---|
| `middleware.js` | `middleware.js` |
| `docker-compose.yml` | `docker-compose.yml` |

### src/lib/
| Output file | → Project path |
|---|---|
| `brand.js` | `src/lib/brand.js` |
| `auth.js` | `src/lib/auth.js` |
| `customerAuth.js` | `src/lib/customerAuth.js` |
| `db.js` | `src/lib/db.js` |
| `permissions.js` | `src/lib/permissions.js` |
| `apiHelpers.js` | `src/lib/apiHelpers.js` |
| `getRequestUser.js` | `src/lib/getRequestUser.js` |
| `dashboardApi.js` | `src/lib/dashboardApi.js` |
| `deliveryZones.js` | `src/lib/deliveryZones.js` |
| `shop-components.js` → section `src/lib/data.js` | `src/lib/data.js` |
| `occasions-components.js` → section `src/lib/occasions.js` | `src/lib/occasions.js` |

### src/app/
| Output file | → Project path |
|---|---|
| `layout.js` | `src/app/layout.js` |
| `CartContext.js` | `src/app/CartContext.js` |

### src/app/api/auth/
| Output file | → Project path |
|---|---|
| `api-auth-login.js` | `src/app/api/auth/login/route.js` |
| `api-auth-logout-session.js` *(first section)* | `src/app/api/auth/logout/route.js` |
| `api-auth-logout-session.js` *(second section)* | `src/app/api/auth/session/route.js` |

### src/app/api/inventory/
| Output file | → Project path |
|---|---|
| `api-inventory-route.js` | `src/app/api/inventory/route.js` |
| `api-inventory-id-route.js` | `src/app/api/inventory/[id]/route.js` |

### src/app/api/orders/
| Output file | → Project path |
|---|---|
| `api-orders-route.js` | `src/app/api/orders/route.js` |
| `api-orders-id-route.js` | `src/app/api/orders/[id]/route.js` |

### src/app/api/deliveries/
| Output file | → Project path |
|---|---|
| `api-deliveries-routes.js` | `src/app/api/deliveries/route.js` |
| `api-deliveries-id-route.js` | `src/app/api/deliveries/[id]/route.js` |

### src/app/api/employees/
| Output file | → Project path |
|---|---|
| `api-employees-routes.js` | `src/app/api/employees/route.js` |
| `api-employees-id-route.js` | `src/app/api/employees/[id]/route.js` |

### src/app/api/customers/
*All routes are in one bundle — split by the `FILE:` comment headers*
| Output file | → Project path |
|---|---|
| `customers-api-routes.js` *(FILE: register)* | `src/app/api/customers/register/route.js` |
| `customers-api-routes.js` *(FILE: login)* | `src/app/api/customers/login/route.js` |
| `customers-api-routes.js` *(FILE: logout)* | `src/app/api/customers/logout/route.js` |
| `customers-api-routes.js` *(FILE: me)* | `src/app/api/customers/me/route.js` |
| `customers-api-routes.js` *(FILE: orders)* | `src/app/api/customers/orders/route.js` |
| `customers-api-routes.js` *(FILE: addresses)* | `src/app/api/customers/addresses/route.js` |
| `customers-api-routes.js` *(FILE: addresses/[id])* | `src/app/api/customers/addresses/[id]/route.js` |
| `api-customers-session.js` | `src/app/api/customers/session/route.js` |

### src/app/dashboard/
| Output file | → Project path |
|---|---|
| `SessionContext.js` | `src/app/dashboard/SessionContext.js` |
| `dashboard-login-page.js` | `src/app/dashboard/login/page.js` |
| `dashboard-shell-layout.js` | `src/app/dashboard/(shell)/layout.js` |
| `dashboard-main-page.js` | `src/app/dashboard/(shell)/page.js` |
| `dashboard-inventory-page.js` | `src/app/dashboard/(shell)/inventory/page.js` |
| `dashboard-orders-page.js` | `src/app/dashboard/(shell)/orders/page.js` |
| `dashboard-delivery-page.js` | `src/app/dashboard/(shell)/delivery/page.js` |
| `dashboard-employees-page.js` | `src/app/dashboard/(shell)/employees/page.js` |
| `analytics-page.js` | `src/app/dashboard/(shell)/analytics/page.js` |

### src/app/components/dashboard/
| Output file | → Project path |
|---|---|
| `DashboardShell.js` | `src/app/components/dashboard/DashboardShell/DashboardShell.js` |
| `DashboardSidebar.js` | `src/app/components/dashboard/DashboardSidebar/DashboardSidebar.js` |
| `DashboardTopbar.js` | `src/app/components/dashboard/DashboardTopbar/DashboardTopbar.js` |
| `StatCard.js` | `src/app/components/dashboard/StatCard/StatCard.js` |
| `StatusBadge.js` | `src/app/components/dashboard/StatusBadge/StatusBadge.js` |
| `InventoryTable.js` | `src/app/components/dashboard/InventoryTable/InventoryTable.js` |
| `InventoryModal.js` | `src/app/components/dashboard/InventoryModal/InventoryModal.js` |
| `OrderModal.js` | `src/app/components/dashboard/OrderModal/OrderModal.js` |
| `EmployeeModal.js` | `src/app/components/dashboard/EmployeeModal/EmployeeModal.js` |
| `PageStates.js` | `src/app/components/dashboard/PageStates/PageStates.js` |

### src/app/components/ (storefront)
| Output file | → Project path |
|---|---|
| `Navbar.js` | `src/app/components/Navbar/Navbar.js` |
| `Footer.js` | `src/app/components/Footer/Footer.js` |
| `ShopGrid.js` | `src/app/components/ShopGrid/ShopGrid.js` |
| `ShopBanner.js` | `src/app/components/ShopBanner/ShopBanner.js` |
| `ShopFilters.js` | `src/app/components/ShopFilters/ShopFilters.js` |
| `CatalogSection.js` | `src/app/components/Catalog/CatalogSection.js` |
| `FeaturedArrangements.js` | `src/app/components/FeaturedArrangements/FeaturedArrangements.js` |
| `ProductCardActions.js` | `src/app/components/ProductCardActions/ProductCardActions.js` |
| `storefront-micro-components.js` *(FILE: AnnouncementBar)* | `src/app/components/AnnouncementBar/AnnouncementBar.js` |
| `storefront-micro-components.js` *(FILE: PromoBand)* | `src/app/components/PromoBand/PromoBand.js` |
| `storefront-micro-components.js` *(FILE: OccasionsTicker)* | `src/app/components/OccasionsTicker/OccasionsTicker.js` |
| `about-delivery-components.js` *(FILE: AboutStory)* | `src/app/components/AboutStory/AboutStory.js` |
| `about-delivery-components.js` *(FILE: AboutValues)* | `src/app/components/AboutValues/AboutValues.js` |
| `about-delivery-components.js` *(FILE: AboutLocations)* | `src/app/components/AboutLocations/AboutLocations.js` |
| `about-delivery-components.js` *(FILE: DeliveryPolicy)* | `src/app/components/DeliveryPolicy/DeliveryPolicy.js` |
| `about-delivery-components.js` *(FILE: DeliveryZones)* | `src/app/components/DeliveryZones/DeliveryZones.js` |
| `about-delivery-components.js` *(FILE: DeliveryFAQ)* | `src/app/components/DeliveryFAQ/DeliveryFAQ.js` |
| `occasions-components.js` *(FILE: OccasionsIntro)* | `src/app/components/OccasionsIntro/OccasionsIntro.js` |
| `occasions-components.js` *(FILE: OccasionCard)* | `src/app/components/OccasionCard/OccasionCard.js` |

### src/app/components/account/
| Output file | → Project path |
|---|---|
| `account-context-shell-nav.js` *(FILE: AccountShell)* | `src/app/components/account/AccountShell/AccountShell.js` |
| `account-context-shell-nav.js` *(FILE: AccountNav)* | `src/app/components/account/AccountNav/AccountNav.js` |
| `AddressModal.js` | `src/app/components/account/AddressModal/AddressModal.js` |

### src/app/ (pages)
| Output file | → Project path |
|---|---|
| `shop-page.js` | `src/app/shop/page.js` |
| `shop-id-page.js` *(FILE: server page)* | `src/app/shop/[id]/page.js` |
| `ProductDetail.js` | `src/app/shop/[id]/ProductDetail.js` |
| `bag-page.js` | `src/app/bag/page.js` |
| `checkout-page.js` | `src/app/checkout/CheckoutPageClient.js` |
| `order-confirmation-page.js` | `src/app/order/[number]/page.js` |
| `account-login-page.js` | `src/app/account/login/page.js` |
| `account-portal-layout.js` | `src/app/account/(portal)/layout.js` |
| `account-portal-pages.js` *(FILE: portal/page)* | `src/app/account/(portal)/page.js` |
| `account-portal-pages.js` *(FILE: orders)* | `src/app/account/(portal)/orders/page.js` |
| `account-portal-pages.js` *(FILE: orders/[id])* | `src/app/account/(portal)/orders/[id]/page.js` |
| `account-portal-pages.js` *(FILE: addresses)* | `src/app/account/(portal)/addresses/page.js` |
| `account-portal-pages.js` *(FILE: settings)* | `src/app/account/(portal)/settings/page.js` |
| `CustomerContext.js` | `src/app/account/CustomerContext.js` |
| `about-delivery-components.js` *(FILE: about/page)* | `src/app/about/page.js` |
| `about-delivery-components.js` *(FILE: delivery/page)* | `src/app/delivery/page.js` |
| `occasions-components.js` *(FILE: occasions/page)* | `src/app/occasions/page.js` |

### SQL & Scripts
| Output file | → Project path |
|---|---|
| `sql/init.sql` | `sql/init.sql` |
| `sql/migrations/002_customers.sql` | `sql/migrations/002_customers.sql` |
| `sql/migration-003.sql` | `sql/migrations/003_variants_locations.sql` |
| `scripts/seed-admin.js` | `scripts/seed-admin.js` |
| `scripts/seed-dev.js` | `scripts/seed-dev.js` |

---

## Files to DELETE from the project

| File | Reason |
|---|---|
| `src/app/dashboard/layout.js` | Client wrapper from early dev — causes "Unknown user" loop |
| `src/lib/mockSession.js` | Replaced by live DB auth |
| `src/lib/inventoryData.js` | Replaced by `/api/inventory` |
| `src/lib/ordersData.js` | Replaced by `/api/orders` |
| `src/lib/employeeData.js` | Replaced by `/api/employees` |
| `src/lib/deliveryData.js` | Replaced by `/api/deliveries` |

---

## Default Staff Accounts (after seed-admin.js)

| Name | Email | Password | Role |
|---|---|---|---|
| Cecelia Bates | cecelia@lambsflorist.com | admin1234 | admin |
| Frank Bates | frank@lambsflorist.com | manager1234 | manager |

---

## Known Pending Work
- Stripe Connect integration (PaymentIntent before order POST)
- Inventory variants UI — InventoryModal + ProductDetail + ProductCardActions
  still use `sizes TEXT[]`, not the `inventory_variants` table from migration 003
- Dashboard delivery page — Google Maps routing link per driver
- Dashboard customers page (`/dashboard/customers`) — marked "soon" in sidebar
- Images replacing emojis — `image_path` column added in migration 003, UI not wired