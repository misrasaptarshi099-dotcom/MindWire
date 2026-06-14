# System Architecture
## MindWire — AI & Robotics Summer Workshop
**Version:** 1.0.0 | **Stack:** React + Express + MongoDB + Redis + Stripe

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└──────────────────────┬──────────────────────┬───────────────────┘
                       │                      │
              ┌────────▼────────┐    ┌────────▼────────┐
              │   Vercel CDN    │    │   Stripe PG   │
              │  (Frontend)     │    │  (Payments)      │
              └────────┬────────┘    └────────┬────────┘
                       │                      │ webhook
              ┌────────▼────────┐    ┌────────▼────────┐
              │  React SPA      │    │  Railway Server  │
              │  TypeScript     │◄──►│  Express + TS   │
              │  Tailwind CSS   │    │  Port 8080       │
              │  Framer Motion  │    └────────┬────────┘
              └─────────────────┘             │
                                    ┌─────────┼──────────┐
                                    │         │          │
                               ┌────▼───┐ ┌───▼───┐ ┌───▼────┐
                               │MongoDB │ │ Redis │ │Resend  │
                               │Atlas   │ │Cloud  │ │(Email) │
                               │Cluster │ │Cache  │ │        │
                               └────────┘ └───────┘ └────────┘
                                                         │
                                                   ┌─────▼─────┐
                                                   │ Sentry    │
                                                   │ (Errors)  │
                                                   └───────────┘
```

---

## 2. Frontend Architecture

### 2.1 Technology Stack
```
React 18 (with concurrent features)
TypeScript 5.4
Vite 5 (build tool, dev server)
Tailwind CSS 3.4
Framer Motion 11 (scroll animations)
React Hook Form + Zod (forms + validation)
Zustand (global state — form, payment, UI)
TanStack Query (data fetching + caching)
Axios (HTTP client)
tsparticles (hero particle background)
React Hot Toast (notifications)
Lucide React (icons)
```

### 2.2 State Management (Zustand)
```typescript
// stores/useWorkshopStore.ts
interface WorkshopStore {
  // UI State
  stickyCtaVisible: boolean
  activeSection: string
  isMenuOpen: boolean
  
  // Registration Flow
  registrationStep: 'idle' | 'form' | 'payment' | 'success'
  formData: RegistrationFormData | null
  paymentOrderId: string | null
  
  // Workshop Data
  seatsAvailable: number
  
  // Actions
  setRegistrationStep: (step: RegistrationStep) => void
  setFormData: (data: RegistrationFormData) => void
  setStickyCtaVisible: (visible: boolean) => void
}
```

### 2.3 Component Architecture
```
src/
├── components/
│   ├── ui/                    # Atomic components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.types.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Spinner/
│   │   └── ScrollProgress/
│   │
│   ├── sections/              # Page sections (each is a "scene")
│   │   ├── HeroSection/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── TerminalBoot.tsx
│   │   │   ├── RobotAnimation.tsx
│   │   │   └── ParticleBackground.tsx
│   │   ├── SparkSection/
│   │   ├── CurriculumSection/
│   │   ├── ProjectsSection/
│   │   ├── OutcomesSection/
│   │   ├── WorkshopDetailsSection/
│   │   ├── TestimonialsSection/
│   │   ├── FaqSection/
│   │   └── RegisterSection/
│   │       ├── RegisterSection.tsx
│   │       ├── RegistrationForm.tsx
│   │       └── PaymentPanel.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── StickyCtaBar.tsx
│   │   ├── Footer.tsx
│   │   └── SectionWrapper.tsx   # Scroll trigger HOC
│   │
│   └── common/
│       ├── ScrollReveal.tsx     # Reusable scroll animation wrapper
│       ├── CountdownTimer.tsx
│       ├── SeatCounter.tsx
│       └── MetaTags.tsx
│
├── hooks/
│   ├── useScrollProgress.ts
│   ├── useIntersectionObserver.ts
│   ├── useRegistration.ts       # Form + payment orchestration
│   └── useWorkshopData.ts       # TanStack Query hook
│
├── lib/
│   ├── api.ts                   # Axios instance + interceptors
│   ├── stripe.ts              # Payment helpers
│   ├── validators.ts            # Zod schemas (shared with backend)
│   └── analytics.ts             # GA4 event helpers
│
├── store/
│   └── useWorkshopStore.ts
│
├── types/
│   ├── api.types.ts
│   ├── workshop.types.ts
│   └── stripe.d.ts            # Type declaration for Stripe SDK
│
└── utils/
    ├── cn.ts                    # clsx + tailwind-merge helper
    ├── formatCurrency.ts
    └── formatDate.ts
```

---

## 3. Backend Architecture

### 3.1 Technology Stack
```
Node.js 20 LTS
Express.js 4.18 + TypeScript
Mongoose 8 (MongoDB ODM)
ioredis (Redis client)
Zod (server-side validation)
Stripe Node SDK
Resend (email delivery)
Helmet (security headers)
express-rate-limit + rate-limit-redis
express-validator (secondary validation)
DOMPurify + jsdom (HTML sanitization)
Sentry Node SDK
Winston (logging)
```

### 3.2 Express App Structure
```typescript
// Layer order (middleware chain)
app
  .use(helmet())           // Security headers
  .use(cors(corsOptions))  // CORS whitelist
  .use(express.json())     // Body parser
  .use(requestLogger)      // Winston request log
  .use(rateLimiter)        // Global rate limiter
  .use('/api/health', healthRouter)
  .use('/api/enquiry', enquiryRouter)
  .use('/api/payment', paymentRouter)
  .use('/api/workshop', workshopRouter)
  .use('/api/webhooks', webhookRouter)     // Stripe webhook (raw body)
  .use(errorHandler)       // Global error handler
  .use(notFoundHandler)
```

### 3.3 API Endpoints (Full Specification)

#### Health Check
```
GET /api/health
Response: { status: 'ok', db: 'connected', cache: 'connected', uptime: number }
Auth: None
Rate limit: None
```

#### Enquiry / Registration
```
POST /api/enquiry
Purpose: Accept + validate + store workshop registration form

Headers:
  Content-Type: application/json
  x-csrf-token: <token>  (optional, for browser)

Request Body:
  {
    name:        string  (2–100 chars)
    email:       string  (valid email)
    phone:       string  (10-digit Indian mobile)
    childName:   string? (optional, 2–60 chars)
    childAge:    number? (8–14)
    message:     string? (max 500 chars)
    hp:          string  (honeypot — must be empty)
  }

Response 201:
  {
    success: true,
    message: "Registration received! Check your email for confirmation.",
    data: {
      enquiryId: string,
      referenceCode: string
    }
  }

Response 400 (Validation error):
  {
    success: false,
    error: "VALIDATION_ERROR",
    details: [{ field: "email", message: "Invalid email address" }]
  }

Response 409 (Duplicate):
  {
    success: false,
    error: "ALREADY_REGISTERED",
    message: "This email is already registered."
  }

Response 429 (Rate limit):
  {
    success: false,
    error: "TOO_MANY_REQUESTS",
    retryAfter: 60
  }

Middleware chain:
  [rateLimiter(5/min)] → [validateBody(enquirySchema)] → 
  [sanitizeInputs] → [checkDuplicate] → [enquiryController]

Side effects on success:
  → Store in MongoDB (enquiries collection)
  → Send confirmation email (Resend, async)
  → Send admin notification (async)
  → Cache enquiry ID in Redis (for dedup, 24h TTL)
```

#### Payment — Create Order
```
POST /api/payment/create-order
Purpose: Create Stripe order for ₹2,999

Request Body:
  {
    enquiryId: string  (from /api/enquiry response)
    email:     string
    name:      string
  }

Response 200:
  {
    success: true,
    orderId:    string,  // Stripe order_id
    amount:     299900,  // Amount in paise
    currency:   "INR",
    key:        string,  // Stripe public key
    prefill: {
      name:  string,
      email: string,
      contact: string
    }
  }

Validation:
  - enquiryId must exist in DB
  - enquiryId must not already have a completed payment
```

#### Payment — Verify Signature
```
POST /api/payment/verify
Purpose: Verify Stripe payment signature after client-side completion

Request Body:
  {
    stripe_order_id:   string,
    stripe_payment_id: string,
    stripe_signature:  string,
    enquiryId:           string
  }

Process:
  1. HMAC-SHA256(order_id + "|" + payment_id, secret)
  2. Compare with stripe_signature
  3. If match: mark payment complete in DB
  4. Send confirmation email with receipt
  5. Return success

Response 200:
  {
    success: true,
    message: "Payment confirmed! You're enrolled.",
    receiptUrl: string  // Downloadable PDF receipt link
  }

Response 400:
  { success: false, error: "SIGNATURE_MISMATCH" }
```

#### Payment — Webhook (Stripe → Server)
```
POST /api/webhooks/stripe
Headers: x-stripe-signature: <hmac>
Body: Raw JSON (Stripe event payload)

Events handled:
  payment.captured  → Confirm enrollment, trigger email
  payment.failed    → Mark enquiry as failed, alert admin
  refund.created    → Update DB, notify user

Security: HMAC-SHA256 signature verification BEFORE processing
```

#### Workshop Data (Cached)
```
GET /api/workshop/info
Cache: Redis, TTL 3600s
Response:
  {
    title, subtitle, ageGroup, duration, mode,
    fee, startDate, seatsAvailable, seatsTotal
  }

GET /api/workshop/seats
Cache: Redis, TTL 60s (shorter for accuracy)
Response: { seatsAvailable: number }
```

---

## 4. Database Design (MongoDB)

### 4.1 Connection
```typescript
// config/database.ts
const options: ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
}
```

### 4.2 Collections & Schemas

#### enquiries
```typescript
const enquirySchema = new Schema({
  // Identity
  enquiryId:     { type: String, unique: true, index: true },
  referenceCode: { type: String, unique: true },  // e.g. KDR-2026-0042
  
  // Registrant
  name:      { type: String, required: true, trim: true, maxlength: 100 },
  email:     { type: String, required: true, lowercase: true, index: true },
  phone:     { type: String, required: true },
  childName: { type: String, trim: true },
  childAge:  { type: Number, min: 8, max: 14 },
  message:   { type: String, maxlength: 500 },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'payment_initiated', 'enrolled', 'waitlisted', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Payment
  payment: {
    orderId:    String,
    paymentId:  String,
    status:     { type: String, enum: ['pending', 'captured', 'failed', 'refunded'] },
    amount:     Number,
    currency:   { type: String, default: 'INR' },
    capturedAt: Date,
  },
  
  // Workshop reference
  workshopId:  { type: String, default: 'AI_ROBOTICS_SUMMER_2026' },
  batchId:     { type: String, default: 'BATCH_01' },
  
  // System
  ipAddress:   { type: String, select: false },  // Hidden by default
  userAgent:   { type: String, select: false },
  source:      { type: String, enum: ['organic', 'paid', 'referral'] },
  utmParams:   Schema.Types.Mixed,
  
  // Timestamps
  createdAt:  { type: Date, default: Date.now, index: true },
  updatedAt:  { type: Date, default: Date.now },
  enrolledAt: Date,
},
{
  timestamps: true,
  toJSON: { virtuals: true },
})

// Indexes
enquirySchema.index({ email: 1, workshopId: 1 }, { unique: true })
enquirySchema.index({ status: 1, createdAt: -1 })
enquirySchema.index({ 'payment.orderId': 1 })
```

#### workshops
```typescript
const workshopSchema = new Schema({
  workshopId:    { type: String, unique: true },
  title:         String,
  subtitle:      String,
  ageGroup:      { min: Number, max: Number },
  durationWeeks: Number,
  mode:          { type: String, enum: ['online', 'offline', 'hybrid'] },
  feeINR:        Number,
  startDate:     Date,
  endDate:       Date,
  seatsTotal:    Number,
  seatsAvailable: { type: Number, default: function() { return this.seatsTotal } },
  status:        { type: String, enum: ['upcoming', 'active', 'full', 'completed'] },
  batches: [{
    batchId:  String,
    name:     String,
    seats:    Number,
    enrolled: { type: Number, default: 0 }
  }]
},
{ timestamps: true })
```

---

## 5. Caching Strategy (Redis)

```
┌────────────────────────────────────────────────────┐
│                  REDIS CACHE MAP                   │
├──────────────────────┬────────┬────────────────────┤
│ Key Pattern          │  TTL   │ Purpose            │
├──────────────────────┼────────┼────────────────────┤
│ workshop:info        │ 3600s  │ Workshop details   │
│ workshop:seats       │  60s   │ Available seats    │
│ enquiry:dup:{email}  │ 86400s │ Duplicate check    │
│ ratelimit:{ip}       │  60s   │ Rate limit window  │
│ payment:order:{id}   │ 1800s  │ Order data         │
│ session:{token}      │ 3600s  │ User session       │
└──────────────────────┴────────┴────────────────────┘

Cache-Aside Pattern:
  read  → check Redis → miss → query MongoDB → set Redis → return
  write → write MongoDB → invalidate Redis key
```

---

## 6. Security Architecture

### 6.1 Security Layers
```
Layer 1: Transport
  → HTTPS enforced (Vercel + Railway auto TLS)
  → HSTS header (max-age=31536000)

Layer 2: Application (Helmet.js)
  → Content-Security-Policy: strict whitelist
  → X-Frame-Options: DENY
  → X-Content-Type-Options: nosniff
  → Referrer-Policy: strict-origin-when-cross-origin

Layer 3: API
  → CORS: whitelist [mindwire.com, www.mindwire.com, preview.mindwire.com]
  → Rate limiting: 5 req/min (enquiry), 3 req/min (payment)
  → Input validation: Zod schemas on all inputs
  → Input sanitization: strip HTML, trim whitespace, normalize email

Layer 4: Database
  → Mongoose strict mode (no extra fields)
  → No direct string interpolation in queries
  → Select false on sensitive fields (ip, userAgent)
  → MongoDB Atlas IP whitelist (Railway egress only)

Layer 5: Payment
  → Stripe signature verification (HMAC-SHA256)
  → Amount validated server-side before order creation
  → Payment data never logged
  → Webhook secret verification

Layer 6: Secrets
  → All secrets in Railway environment variables
  → No secrets in Git (enforced via .gitignore + pre-commit hook)
  → Rotate keys quarterly (documented procedure)
```

### 6.2 CORS Configuration
```typescript
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const whitelist = [
      'https://mindwire.com',
      'https://www.mindwire.com',
      process.env.FRONTEND_URL,  // Vercel preview URLs
    ].filter(Boolean)

    if (!origin || whitelist.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods:     ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-csrf-token'],
  credentials: true,
  maxAge:      86400,  // Cache preflight 24h
}
```

### 6.3 Rate Limiting
```typescript
// config/rateLimit.ts
const enquiryLimiter = rateLimit({
  windowMs:    60 * 1000,       // 1 minute
  max:         5,               // 5 requests per IP per minute
  standardHeaders: true,
  legacyHeaders:   false,
  handler:     rateLimitHandler, // Returns { success: false, error: 'TOO_MANY_REQUESTS' }
  store:       new RedisStore({ sendCommand: (...args) => redis.call(...args) })
})

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      3,
  store:    new RedisStore(...)
})
```

---

## 7. Payment Flow (Stripe)

```
CLIENT                           SERVER                    RAZORPAY
  │                                │                           │
  │── POST /api/enquiry ──────────►│                           │
  │◄── { enquiryId } ─────────────│                           │
  │                                │                           │
  │── POST /api/payment/create ───►│                           │
  │                                │── createOrder(₹2999) ────►│
  │                                │◄── { order_id } ─────────│
  │◄── { orderId, key } ──────────│                           │
  │                                │                           │
  │── Stripe.open(config) ──────────────────────────────────►│
  │                                │                           │
  │◄── onSuccess(payment_id, sig)──────────────────────────────│
  │                                │                           │
  │── POST /api/payment/verify ───►│                           │
  │                                │── HMAC verify ────────────│
  │                                │── updateDB(enrolled) ─────│
  │                                │── sendEmail(receipt) ─────│
  │◄── { success, receipt } ──────│                           │
  │                                │                           │
  │                    ALSO: Webhook ◄────────────────────────│
  │                    payment.captured event                   │
  │                    (backup confirmation)                    │
```

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions — Frontend (`.github/workflows/deploy-frontend.yml`)
```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths: ['apps/web/**']
  pull_request:
    branches: [main]
    paths: ['apps/web/**']

jobs:
  quality:
    name: Quality Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run type-check --workspace=apps/web
      - run: npm run lint --workspace=apps/web
      - run: npm run test --workspace=apps/web
      - run: npm run build --workspace=apps/web

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 8.2 GitHub Actions — Backend (`.github/workflows/deploy-backend.yml`)
```yaml
name: Deploy Backend to Railway

on:
  push:
    branches: [main]
    paths: ['apps/api/**']

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports: ['27017:27017']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run type-check --workspace=apps/api
      - run: npm run lint --workspace=apps/api
      - run: npm run test --workspace=apps/api
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          REDIS_URL: redis://localhost:6379

  deploy:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: mindwire-api
```

### 8.3 CI Quality Gates
```
Every PR must pass:
  ✓ TypeScript type-check (tsc --noEmit)
  ✓ ESLint (zero errors, warnings as errors)
  ✓ Unit tests (Jest, ≥80% coverage on controllers)
  ✓ Build success (no bundle errors)
  ✓ Bundle size check (< 200KB gzipped)

On main merge:
  ✓ All above
  ✓ E2E smoke test (Playwright: load page, submit form, check DB)
  ✓ Lighthouse CI (score ≥ 90)
  ✓ Deploy to production
```

---

## 9. Environment Variables

### Frontend (`apps/web/.env`)
```env
VITE_API_URL=https://api.mindwire.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxxxxx@sentry.io/xxxxxx
```

### Backend (`apps/api/.env`)
```env
# Server
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://www.mindwire.com

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mindwire

# Redis
REDIS_URL=redis://default:pass@redis.railway.internal:6379

# Stripe
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@mindwire.com
ADMIN_EMAIL=admin@mindwire.com

# Security
CORS_ORIGINS=https://www.mindwire.com,https://mindwire.com

# Monitoring
SENTRY_DSN=https://xxxxxxxx@sentry.io/xxxxxx
```

---

## 10. Error Handling Strategy

```typescript
// Centralized error handler
// All errors flow here via next(err)

class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: string,
    public details?: unknown
  ) {
    super(message)
  }
}

// Error codes:
//  VALIDATION_ERROR       400
//  ALREADY_REGISTERED     409
//  NOT_FOUND              404
//  TOO_MANY_REQUESTS      429
//  PAYMENT_FAILED         402
//  SIGNATURE_MISMATCH     400
//  INTERNAL_ERROR         500

// Frontend: Axios interceptors catch all 4xx/5xx
// Show toast on error, retry on network failure (3x)
// Sentry captures 5xx automatically
```

---

## 11. Monitoring & Observability

```
Sentry:
  → Frontend: React error boundary + Sentry.captureException
  → Backend:  Sentry.setupExpressErrorHandler(app)
  → Alerts:   Email on P0 errors (5xx, payment failures)

Winston Logging (Backend):
  → Format: JSON in production, colorized in dev
  → Levels: error, warn, info, debug
  → Transports: Console + File (Railway logs)
  → Log: All requests, all errors, payment events (no PII)

Health Checks:
  → GET /api/health (DB + Redis status)
  → Railway native health check
  → Uptime Robot (external monitoring, 5min intervals)

Web Vitals (Frontend):
  → Send to GA4: LCP, FID, CLS, TTFB, INP
  → Alert if LCP > 3s (Sentry performance)
```

---

*Architecture reviewed by: Saptarshi | Last updated: June 2026*
