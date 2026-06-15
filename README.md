# 🧠 MindWire Monorepo

Welcome to the **MindWire** codebase — a premium, high-performance web application designed for a futuristic AI & Robotics Summer Workshop platform. The system facilitates course listings, student registrations, secure mock/live Stripe checkouts, user progress tracking, and a fully interactive, anonymized parent rating and review feedback loop.

---

## 🚀 Key Features

* **Visual AI & Robotics Branding:** Customized dark-tech, high-fidelity landing visuals (`hero_robotics.png` & `robotics_outcomes.png`) with animated neon-glowing accents.
* **Student Registration Pipeline:** Interactive forms for workshop enrollment with anti-spam honeypots and validation.
* **Secure Payment Flow:** Dual live/mock Stripe checkout integration with automated background webhook processing.
* **Admin Dashboard CMS:** Comprehensive panel for managing active workshops, student registrations, collected revenues, and user access.
* **Self-Healing Seat Counter:** Automatic real-time synchronization between active database registrations and available workshop seat counts, with robust seat restoral on registration deletion.
* **Interactive Reviews & Ratings:** Enrolled users can rate workshops (1-5 stars) and write comments directly from their dashboards.
* **Minor Privacy Controls:** Anonymized public reviews API safeguarding student PII (hides name, childName, and childAge) to ensure compliance.

---

## 📂 Project Architecture

This project is organized as a TypeScript-focused monorepo using npm workspaces:

```text
├── apps/
│   ├── api/             # Express.js REST API (Node.js, MongoDB, Redis)
│   └── web/             # React SPA (Vite, TailwindCSS, Framer Motion)
├── packages/
│   └── shared/          # Shared Zod schemas, TypeScript types, and constants
├── package.json         # Workspace scripts & devDependencies
└── .env.local           # Environment variables (Root directory, ignored by Git)
```

---

## 🛠️ Technology Stack

### Frontend (`apps/web`)
* **React 19** & **TypeScript**
* **Vite** (Module bundler & dev server)
* **TailwindCSS v4** (Modern styling engine)
* **Framer Motion** (Subtle, hardware-accelerated animations)
* **Lucide React** (Consistent iconography)
* **Zustand** (Ultra-lightweight state management)
* **Playwright** (End-to-End browser test suite)

### Backend (`apps/api`)
* **Express.js** & **TypeScript**
* **MongoDB (Mongoose)** (Document database)
* **Redis** (Atomic locking & caching layer)
* **Stripe SDK** (Payment processing)
* **Resend SDK** (Transaction & confirmation emails)
* **Winston** (Structured JSON logger)

---

## 🚦 Quick Start Guide

### Prerequisites
Ensure you have the following installed on your machine:
* [Node.js v20+](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas cluster)
* [Redis](https://redis.io/downloads/) (Local server or Cloud Redis instance)

### 1. Installation
Clone the repository and install all workspace dependencies from the monorepo root:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the **monorepo root directory**:
```env
# Database & Caching
MONGODB_URI="mongodb://localhost:27017/mindwire"
REDIS_URL="redis://localhost:6379"

# Stripe Checkout
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"

# Server Ports & URLs
NODE_ENV="development"
PORT=8080
FRONTEND_URL="http://localhost:5173"
VITE_API_URL="http://localhost:8080/api"
```

### 3. Run Development Servers
Start all workspaces concurrently (Shared package, Backend API, and Frontend Vite server):
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173` (or `http://localhost:5174` if port 5173 is in use)
* **Backend API:** `http://localhost:8080`


---

## 🧪 Testing, Linting & Building

### Run Code Quality Gates
Run ESLint verification across the workspace codebases:
```bash
npm run lint
```

### Production Build
Compile TypeScript resources and package frontend static assets into production bundles:
```bash
npm run build
```

---

## 🔒 Security & Privacy Practices

* **Child Privacy Protection:** Public endpoints omit names and ages of registered minors.
* **Honeypot Shielding:** The checkout and registration endpoints are protected with honeypot parameters to intercept bot scripts without adding UI friction.
