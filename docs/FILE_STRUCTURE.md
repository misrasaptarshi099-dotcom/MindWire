 an# File Structure
## MindWire — Enterprise-Grade Monorepo
**Workspace:** npm workspaces | **Style:** feature-first, co-located tests

---

```
mindwire-workshop/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Runs on ALL PRs — lint + test + build
│   │   ├── deploy-frontend.yml       # Vercel deploy on main merge
│   │   ├── deploy-backend.yml        # Railway deploy on main merge
│   │   └── lighthouse.yml            # Lighthouse CI on main merge
│   ├── PULL_REQUEST_TEMPLATE.md      # PR checklist template
│   └── CODEOWNERS                    # Auto-assign reviewers
│
├── apps/
│   │
│   ├── web/                          # React Frontend (Vite + TypeScript)
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   ├── robots.txt
│   │   │   ├── sitemap.xml
│   │   │   └── manifest.webmanifest
│   │   │
│   │   ├── src/
│   │   │   │
│   │   │   ├── assets/
│   │   │   │   ├── fonts/            # Subset font files (.woff2)
│   │   │   │   ├── images/           # Static images
│   │   │   │   │   ├── hero-bg.webp
│   │   │   │   │   ├── kids-coding.webp
│   │   │   │   │   └── certificate.webp
│   │   │   │   └── lottie/
│   │   │   │       └── robot.json    # Lottie robot animation JSON
│   │   │   │
│   │   │   ├── components/
│   │   │   │   │
│   │   │   │   ├── ui/               # Pure atomic components
│   │   │   │   │   ├── Button/
│   │   │   │   │   │   ├── Button.tsx
│   │   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── Input/
│   │   │   │   │   │   ├── Input.tsx         # Controlled + error state
│   │   │   │   │   │   ├── Input.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── Card/
│   │   │   │   │   │   ├── Card.tsx          # Glassmorphic card base
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── Badge/
│   │   │   │   │   │   ├── Badge.tsx         # e.g. "4 Weeks" pill
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── Spinner/
│   │   │   │   │   │   └── Spinner.tsx       # Animated loading indicator
│   │   │   │   │   ├── Skeleton/
│   │   │   │   │   │   └── Skeleton.tsx      # Shimmer placeholder
│   │   │   │   │   ├── Accordion/
│   │   │   │   │   │   ├── Accordion.tsx     # FAQ accordion
│   │   │   │   │   │   └── AccordionItem.tsx
│   │   │   │   │   ├── ScrollProgress/
│   │   │   │   │   │   └── ScrollProgress.tsx # Top progress bar
│   │   │   │   │   └── index.ts              # Barrel export all UI
│   │   │   │   │
│   │   │   │   ├── sections/         # Full page sections (one per scene)
│   │   │   │   │   │
│   │   │   │   │   ├── HeroSection/
│   │   │   │   │   │   ├── HeroSection.tsx       # Orchestrates the scene
│   │   │   │   │   │   ├── TerminalBoot.tsx       # Typing animation sequence
│   │   │   │   │   │   ├── RobotAnimation.tsx     # Lottie/SVG robot
│   │   │   │   │   │   ├── ParticleBackground.tsx # tsparticles wrapper
│   │   │   │   │   │   └── HeroStats.tsx          # Age / Duration / Mode pills
│   │   │   │   │   │
│   │   │   │   │   ├── SparkSection/
│   │   │   │   │   │   └── SparkSection.tsx       # "What if they built a robot?"
│   │   │   │   │   │
│   │   │   │   │   ├── CurriculumSection/
│   │   │   │   │   │   ├── CurriculumSection.tsx
│   │   │   │   │   │   ├── WeekCard.tsx            # Individual week detail
│   │   │   │   │   │   └── TimelineConnector.tsx   # SVG animated line
│   │   │   │   │   │
│   │   │   │   │   ├── ProjectsSection/
│   │   │   │   │   │   ├── ProjectsSection.tsx
│   │   │   │   │   │   └── ProjectCard.tsx         # What kids will build
│   │   │   │   │   │
│   │   │   │   │   ├── OutcomesSection/
│   │   │   │   │   │   ├── OutcomesSection.tsx
│   │   │   │   │   │   └── OutcomePill.tsx         # "Skill unlocked" pill
│   │   │   │   │   │
│   │   │   │   │   ├── WorkshopDetailsSection/
│   │   │   │   │   │   ├── WorkshopDetailsSection.tsx
│   │   │   │   │   │   ├── DetailItem.tsx          # Icon + label + value
│   │   │   │   │   │   └── CountdownTimer.tsx      # Days to July 15
│   │   │   │   │   │
│   │   │   │   │   ├── TestimonialsSection/
│   │   │   │   │   │   ├── TestimonialsSection.tsx
│   │   │   │   │   │   └── TestimonialCard.tsx     # Parent/kid quote
│   │   │   │   │   │
│   │   │   │   │   ├── FaqSection/
│   │   │   │   │   │   ├── FaqSection.tsx
│   │   │   │   │   │   └── FaqItem.tsx             # Uses Accordion
│   │   │   │   │   │
│   │   │   │   │   └── RegisterSection/
│   │   │   │   │       ├── RegisterSection.tsx     # Full enrollment section
│   │   │   │   │       ├── RegistrationForm.tsx    # RHF + Zod form
│   │   │   │   │       ├── PaymentPanel.tsx        # Stripe integration
│   │   │   │   │       ├── SuccessScreen.tsx       # Confetti + confirmation
│   │   │   │   │       └── SeatCounter.tsx         # "X seats left"
│   │   │   │   │
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Navbar.tsx                  # Transparent → solid on scroll
│   │   │   │   │   ├── StickyCtaBar.tsx            # Bottom bar (mobile) / top-right (desktop)
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   └── SectionWrapper.tsx          # Scroll trigger HOC wrapper
│   │   │   │   │
│   │   │   │   └── common/
│   │   │   │       ├── ScrollReveal.tsx            # Framer Motion scroll wrapper
│   │   │   │       ├── MetaTags.tsx                # OG tags, JSON-LD Event schema
│   │   │   │       ├── ErrorBoundary.tsx           # React error boundary
│   │   │   │       └── LazyImage.tsx               # Intersection-observer lazy load
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useScrollProgress.ts            # 0–1 scroll position
│   │   │   │   ├── useIntersectionObserver.ts      # Generic IO hook
│   │   │   │   ├── useCountdown.ts                 # Countdown to start date
│   │   │   │   ├── useRegistration.ts              # Orchestrates form → payment → confirm
│   │   │   │   ├── useWorkshopData.ts              # TanStack Query for /api/workshop
│   │   │   │   └── useStripe.ts                  # Load Stripe SDK dynamically
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                          # Axios instance + interceptors + retry
│   │   │   │   ├── stripe.ts                     # openStripeCheckout() helper
│   │   │   │   ├── analytics.ts                    # GA4 event wrappers
│   │   │   │   └── sentry.ts                       # Sentry init
│   │   │   │
│   │   │   ├── store/
│   │   │   │   └── useWorkshopStore.ts             # Zustand store
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── api.types.ts                    # Request/response interfaces
│   │   │   │   ├── workshop.types.ts               # Workshop domain types
│   │   │   │   └── stripe.d.ts                   # Window.Stripe type declaration
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── cn.ts                           # clsx + tailwind-merge
│   │   │   │   ├── formatCurrency.ts               # ₹2,999 formatter
│   │   │   │   └── formatDate.ts                   # "15 July 2026" formatter
│   │   │   │
│   │   │   ├── App.tsx                             # Root component, QueryClient
│   │   │   ├── main.tsx                            # ReactDOM.createRoot entry
│   │   │   └── index.css                           # Tailwind imports + CSS vars
│   │   │
│   │   ├── .env.example
│   │   ├── .eslintrc.json
│   │   ├── index.html                              # Vite entry HTML + preloads
│   │   ├── jest.config.ts
│   │   ├── package.json
│   │   ├── playwright.config.ts                    # E2E config
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   └── vite.config.ts
│   │
│   └── api/                          # Express Backend (TypeScript)
│       ├── src/
│       │   │
│       │   ├── config/
│       │   │   ├── database.ts       # Mongoose connection + retry logic
│       │   │   ├── redis.ts          # ioredis client + reconnect
│       │   │   ├── stripe.ts       # Stripe SDK init
│       │   │   ├── email.ts          # Resend client init
│       │   │   ├── sentry.ts         # Sentry init (must be first import)
│       │   │   └── env.ts            # Zod-parsed env validation
│       │   │
│       │   ├── controllers/
│       │   │   ├── enquiry.controller.ts   # POST /api/enquiry logic
│       │   │   ├── payment.controller.ts   # POST /api/payment/* logic
│       │   │   ├── webhook.controller.ts   # POST /api/webhooks/stripe
│       │   │   └── workshop.controller.ts  # GET /api/workshop/*
│       │   │
│       │   ├── middleware/
│       │   │   ├── auth.ts             # JWT verification (admin routes)
│       │   │   ├── rateLimit.ts        # Redis-backed rate limiters
│       │   │   ├── validate.ts         # Zod schema validation middleware
│       │   │   ├── sanitize.ts         # DOMPurify HTML strip + trim
│       │   │   ├── errorHandler.ts     # Global Express error handler
│       │   │   ├── notFound.ts         # 404 handler
│       │   │   └── requestLogger.ts    # Winston HTTP logger
│       │   │
│       │   ├── models/
│       │   │   ├── Enquiry.ts          # Mongoose enquiry schema + model
│       │   │   └── Workshop.ts         # Mongoose workshop schema + model
│       │   │
│       │   ├── routes/
│       │   │   ├── index.ts            # Mount all routers
│       │   │   ├── enquiry.routes.ts   # POST /api/enquiry
│       │   │   ├── payment.routes.ts   # POST /api/payment/*
│       │   │   ├── webhook.routes.ts   # POST /api/webhooks/*
│       │   │   ├── workshop.routes.ts  # GET /api/workshop/*
│       │   │   └── health.routes.ts    # GET /api/health
│       │   │
│       │   ├── services/
│       │   │   ├── enquiry.service.ts      # Business logic for registration
│       │   │   ├── payment.service.ts      # Stripe order + verify
│       │   │   ├── email.service.ts        # Confirmation emails (templates)
│       │   │   ├── cache.service.ts        # Redis get/set/invalidate helpers
│       │   │   └── workshop.service.ts     # Workshop data + seat management
│       │   │
│       │   ├── templates/
│       │   │   ├── email-confirmation.html # Registration confirmation email HTML
│       │   │   ├── email-receipt.html      # Payment receipt email HTML
│       │   │   └── email-admin.html        # Admin new-registration alert
│       │   │
│       │   ├── types/
│       │   │   ├── express.d.ts        # Extends Express.Request type
│       │   │   └── index.ts            # Domain types
│       │   │
│       │   ├── utils/
│       │   │   ├── asyncHandler.ts     # (req, res, next) error catcher wrapper
│       │   │   ├── generateRef.ts      # KDR-2026-XXXX reference code generator
│       │   │   ├── logger.ts           # Winston logger config
│       │   │   └── hmac.ts             # HMAC-SHA256 helpers for Stripe
│       │   │
│       │   ├── validators/
│       │   │   ├── enquiry.schema.ts   # Zod schema for POST /api/enquiry
│       │   │   └── payment.schema.ts   # Zod schema for payment routes
│       │   │
│       │   ├── app.ts                  # Express app factory (no listen)
│       │   └── server.ts               # Entry: connect DB/Redis then listen
│       │
│       ├── tests/
│       │   ├── unit/
│       │   │   ├── enquiry.controller.test.ts
│       │   │   ├── payment.service.test.ts
│       │   │   └── validators.test.ts
│       │   ├── integration/
│       │   │   ├── enquiry.routes.test.ts   # Supertest against real DB (test container)
│       │   │   └── payment.routes.test.ts
│       │   └── fixtures/
│       │       └── mockData.ts
│       │
│       ├── .env.example
│       ├── .eslintrc.json
│       ├── jest.config.ts
│       ├── nodemon.json
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   │
│   └── shared/                  # Shared between web + api (types, validators)
│       ├── src/
│       │   ├── types/
│       │   │   ├── enquiry.ts    # EnquiryRequest, EnquiryResponse
│       │   │   └── workshop.ts   # Workshop, Batch types
│       │   ├── validators/
│       │   │   └── enquiry.ts    # Zod schema (imported by both apps)
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── PRD.md                   # This document's companion
│   ├── DESIGN.md
│   ├── ARCHITECTURE.md
│   └── FILE_STRUCTURE.md        # This file
│
├── e2e/                         # Playwright end-to-end tests
│   ├── tests/
│   │   ├── landing.spec.ts      # Page loads, hero visible
│   │   ├── form.spec.ts         # Form validation + submit
│   │   └── payment.spec.ts      # Stripe test mode flow
│   └── playwright.config.ts
│
├── scripts/
│   ├── seed-db.ts               # Seed MongoDB with workshop data
│   └── check-env.ts             # Validate all env vars before deploy
│
├── .dockerignore
├── .eslintrc.json               # Root ESLint (TypeScript + React rules)
├── .gitignore
├── .prettierrc
├── docker-compose.yml           # Local dev: MongoDB + Redis
├── docker-compose.test.yml      # CI test containers
├── package.json                 # npm workspaces root
├── tsconfig.base.json           # Shared TS config (strict: true)
└── README.md
```

---

## Key File Contents (Quick Reference)

### `package.json` (root)
```json
{
  "name": "mindwire-workshop",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev":          "concurrently \"npm run dev -w apps/web\" \"npm run dev -w apps/api\"",
    "build":        "npm run build -w apps/web && npm run build -w apps/api",
    "test":         "npm run test -w apps/web && npm run test -w apps/api",
    "lint":         "eslint apps/*/src --ext .ts,.tsx",
    "type-check":   "tsc --noEmit -p apps/web/tsconfig.json && tsc --noEmit -p apps/api/tsconfig.json",
    "seed":         "ts-node scripts/seed-db.ts",
    "docker:up":    "docker-compose up -d"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "typescript":   "^5.4.0"
  }
}
```

### `docker-compose.yml` (local dev)
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo-data:/data/db]
    environment:
      MONGO_INITDB_DATABASE: mindwire

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

volumes:
  mongo-data:
```

### `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `RegistrationForm.tsx` |
| Hooks | camelCase + use prefix | `useRegistration.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types/Interfaces | PascalCase, no `I` prefix | `EnquiryRequest` |
| API Routes | kebab-case | `/api/create-order` |
| DB Collections | camelCase plural | `enquiries`, `workshops` |
| Env Variables | UPPER_SNAKE_CASE | `RAZORPAY_KEY_SECRET` |
| CSS Classes | Tailwind utilities only | `bg-panel border-cyan/20` |

---

*File Structure v1.0 | Maintained by Engineering Team*
