# SMMS Retail Premium + Tech Cockpit Redesign

## Goal

Refresh the full SMMS frontend so it feels like a polished retail product rather than a generic AI-generated admin template. The redesign should use realistic supermarket/product imagery, richer layout techniques, and tasteful animation while preserving operational clarity for staff, managers, and admins.

## Approved Direction

Use the **Retail Premium + Tech Retail Cockpit** direction.

- Public-facing pages should feel warm, credible, image-led, and premium.
- Internal app pages should feel like a modern retail operations cockpit: dense enough for daily work, clear for scanning, and visually distinct without becoming decorative.
- Motion should make the interface feel alive, but should not slow down common workflows.

## Visual System

### Palette

Move away from a one-note emerald/teal UI. Keep green as the commerce/accent color, but introduce a broader retail palette:

- Deep ink and charcoal for app surfaces.
- Warm cream or soft neutral only as small contrast surfaces, not as the dominant theme.
- Fresh green for revenue, success, active navigation, and primary actions.
- Amber for stock warnings and promotional moments.
- Blue/cyan for system intelligence, charts, and neutral operational data.
- Red only for destructive states and critical alerts.

### Typography And Density

- Keep the existing system font stack for reliability.
- Use larger expressive type only on landing/login hero areas.
- Use compact, scan-friendly type inside dashboard, tables, sidebars, POS, and product management.
- Avoid oversized marketing-style headings inside the admin app.

### Shape And Surface

- Reduce default roundedness from oversized rounded-xl/2xl where the UI is operational.
- Use 8px radius for most admin cards, tables, sidebars, and toolbars.
- Use richer surface layering through borders, subtle shadows, image overlays, and section bands.
- Avoid nested cards and decorative gradient blobs.

## Imagery Strategy

### Realistic Images

Use reliable remote images from Unsplash source URLs for visual richness without adding binary assets to the repo:

- Supermarket aisle / fresh produce image for landing hero.
- Product category/product photography for featured products.
- Checkout or retail operations image for login.
- Small product thumbnails for POS/product fallback visuals.

Images must have gradient overlays for text legibility and must not appear dark, blurred, or purely atmospheric when the user needs to inspect the thing being shown.

### Fallbacks

When backend products do not provide images:

- Avoid emoji-only fallbacks.
- Use structured visual placeholders with category-like color bands, product initials, and small iconography.
- Preserve the existing `imageUrls` behavior in POS/products.

## Motion System

Use CSS-only motion unless a component already has a better local pattern.

- Landing: entrance reveals, subtle image scale on hover, scrolling marquee/strip for credibility metrics, hero texture movement.
- Login: slow background image pan, floating operational badges, smooth form entrance.
- Admin: short hover transitions, active nav indicator movement, lightweight card lift, chart/panel reveal.
- POS/products: responsive hover/press feedback that feels fast and tactile.

Respect usability:

- Keep animations short for admin actions.
- Avoid constant distracting pulsing except for unread notifications or live/urgent status.
- Include `prefers-reduced-motion` fallbacks in global CSS.

## Page Designs

### Landing Page

Create a first viewport that immediately signals SuperMart:

- Full-bleed realistic supermarket imagery as the hero background.
- H1 should lead with the store name or category, not abstract slogan text.
- Supporting copy explains convenience, quality, and trusted service.
- Primary CTA goes to products/contact; secondary CTA goes to login.
- Leave a visible hint of the next section below the fold.

Main sections:

- Hero with image, live status, and compact trust metrics.
- Featured products as image-led product cards using `storeConfig.featuredProducts`.
- Store experience band with delivery/payment/return guarantees.
- Business hours redesigned as a practical schedule panel with today highlighted.
- Contact section with map and contact cards, visually grounded and less generic.

### Login Page

Redesign as a premium access screen:

- Left visual side uses realistic checkout/store operations imagery.
- Overlay live operational cards: orders today, stock health, active staff.
- Right side remains focused on the login form.
- Keep username/password, show password, remember login, forgot password message, theme toggle, and error/loading states.

### Admin Layout

Refresh shared layout for all protected pages:

- Sidebar with stronger brand block, role/user context, and a more tactile active state.
- Header with refined breadcrumb, search command affordance, notification button, theme toggle, and user menu.
- Main canvas gains subtle app background layering without sacrificing table readability.
- Mobile behavior is not currently implemented; keep desktop assumptions intact unless existing routes require otherwise.

### Dashboard

Make it a retail cockpit:

- Add a top operational hero strip with today summary, store pulse, and quick route actions.
- KPI cards should use visual hierarchy, small trend language, and color-coded indicators.
- Charts get richer tooltip styling and improved visual contrast.
- Recent orders and low-stock panels should look like live operational queues.
- Employee view should become a simple personal work hub with action cards for attendance, schedule/leave, and salary.

### POS

Keep the full-screen cashier workflow fast:

- Product grid gets richer thumbnail treatment and clearer price/SKU hierarchy.
- Cart panel becomes more premium and easier to scan.
- Payment dialog gets clearer method selection states.
- Checkout/processing states remain unchanged behaviorally.

### Products Page

Refresh product management:

- Header becomes a compact inventory command bar.
- Filters/search/export/add actions become visually cohesive.
- Table rows gain product thumbnails/fallbacks, stronger status badges, and clearer action buttons.
- Preserve pagination and export behavior.

## Components And Code Boundaries

Primary files expected to change:

- `smms-frontend/src/index.css`
- `smms-frontend/src/pages/landing/LandingPage.jsx`
- `smms-frontend/src/pages/auth/LoginPage.jsx`
- `smms-frontend/src/components/layout/AdminLayout.jsx`
- `smms-frontend/src/components/layout/Sidebar.jsx`
- `smms-frontend/src/components/layout/Header.jsx`
- `smms-frontend/src/pages/dashboard/DashboardPage.jsx`
- `smms-frontend/src/pages/pos/POSPage.jsx`
- `smms-frontend/src/pages/products/ProductsPage.jsx`
- `smms-frontend/src/config/storeConfig.js`

Possible supporting additions:

- Small local helper arrays/functions inside the touched pages.
- Global CSS utility classes and keyframes in `index.css`.

Avoid broad rewrites of backend services, API clients, auth logic, or data contracts.

## Data And Behavior

The redesign must preserve:

- All existing routes.
- Role-based access behavior.
- Login behavior and error handling.
- Dashboard API calls and fallback empty states.
- POS checkout, customer lookup, invoice preview/printing, and notification behavior.
- Product search, filters, pagination, export, create/edit/delete behavior.

Only presentation, layout, and UI micro-interactions are in scope.

## Verification

After implementation:

- Run `npm run build` in `smms-frontend`.
- Run `npm run lint` if build succeeds or if lint is already part of the local workflow.
- Start the Vite dev server and visually inspect at least landing, login, dashboard, POS, and products.
- Check desktop and a narrow viewport for text overlap, broken image layout, and unusable controls.
- Confirm product images still render from backend `imageUrls` and fallbacks render when missing.

## Risks

- Remote image URLs depend on network availability. This is acceptable for the visual refresh, but fallbacks must keep the UI usable.
- Existing mojibake observed in terminal output means edits must preserve UTF-8 text carefully.
- The repo already has unrelated dirty/staged changes. Implementation should avoid touching unrelated backend or CI files.
