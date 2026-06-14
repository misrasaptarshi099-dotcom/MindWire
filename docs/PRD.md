# Product Requirements Document
## MindWire — AI & Robotics Summer Workshop Landing Page
**Version:** 1.0.0 | **Status:** Active | **Author:** Engineering Team  
**Last Updated:** June 2026

---

## 1. Executive Summary

A high-conversion, enterprise-grade workshop landing page for MindWire's **AI & Robotics Summer Workshop** targeting parents of children aged 8–14. The page must tell a compelling story through scroll-driven animation, convert visitors to paid registrations (₹2,999/child), and handle backend enquiry + payment processing with zero data loss.

**Business Goal:** ≥ 12% registration conversion rate from landing page traffic.

**AESTHETIC INSPIRATION:** The website should take strong visual and experiential inspiration from the premium **Kidrove website**. We will utilize high-end 'taste-skill' design patterns, dark mode, and smooth animations to capture a similar premium vibe, while applying our own creative changes for the MindWire brand.

---

## 2. Product Vision

> "A child's first encounter with AI should feel like discovering a superpower."

The page is not a brochure — it's an **experience**. Each scroll section reveals a chapter of the workshop's story: curiosity → discovery → mastery → impact. Parents leave understanding exactly what their child will build and why it matters. Children leave wanting to sign up immediately.

---

## 3. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Conversion Rate | ≥ 12% | (Form submissions / Unique visitors) × 100 |
| Avg. Time on Page | ≥ 2.5 min | Google Analytics 4 |
| Form Completion Rate | ≥ 70% of form starters | Analytics funnel |
| Payment Success Rate | ≥ 95% | Stripe dashboard |
| Page Load (LCP) | < 1.8s | Lighthouse / Web Vitals |
| CLS Score | < 0.1 | Lighthouse |
| API Response Time | < 300ms p95 | APM monitoring |
| Uptime | ≥ 99.9% | Uptime monitoring |

---

## 4. User Personas

### Primary: The Engaged Parent (Decision Maker)
- **Name:** Priya, 34, software engineer
- **Goal:** Find a structured, credible program to develop her 10-year-old's STEM skills over summer
- **Pain Points:** Too many "low-quality" online programs, unclear curriculum, unsure if child will stay engaged
- **Needs from page:** Trust signals (credentials, outcomes), clear curriculum breakdown, simple payment
- **Device:** Desktop 60% / Mobile 40%

### Secondary: The Curious Kid (Influencer)
- **Name:** Aryan, 11, loves Minecraft and YouTube tech videos
- **Goal:** Learn how to "make robots" and "teach computers"
- **Needs from page:** Visual excitement, relatable outcomes ("you'll build this!"), peer social proof
- **Device:** Mobile-first

### Tertiary: The Skeptical Parent
- **Name:** Rajesh, 41, non-technical background
- **Goal:** Understand ROI of ₹2,999 for 4 weeks
- **Needs from page:** FAQ clarity, refund policy, what exactly is taught, certificates

---

## 5. User Flows

### Flow A: Discovery → Registration (Primary)
```
Landing → Hero (hook) → Scroll story sections → 
Workshop Details → Learning Outcomes → FAQ → 
Registration Form → Payment → Confirmation Email
```

### Flow B: Direct Link → Payment (Return visitor)
```
Landing → "Enroll Now" CTA (sticky) → Form → Payment
```

### Flow C: Mobile Parent
```
Landing → Hero → Sticky "Enroll" bar → Form Modal → 
Payment → Confirmation SMS + Email
```

---

## 6. Feature Requirements

### 6.1 MUST HAVE (P0)

#### Frontend
| ID | Feature | Description |
|----|---------|-------------|
| F-01 | Hero Section | Full-viewport hero with workshop title, animated tagline, particle/robot animation, CTA button |
| F-02 | Scroll Storytelling | 5–6 scroll-triggered story sections with animations (Framer Motion / GSAP) |
| F-03 | Workshop Details | Age group, duration, mode, fee, start date — structured, scannable |
| F-04 | Learning Outcomes | Minimum 5 outcomes with icons, animated in on scroll |
| F-05 | FAQ Section | Minimum 3 FAQs, accordion with smooth animation |
| F-06 | Registration Form | Name, email, phone — validated, with loading states |
| F-07 | Sticky CTA | Floating "Enroll Now" button/bar on scroll past hero |
| F-08 | Responsive Design | Pixel-perfect on mobile (375px), tablet (768px), desktop (1440px) |
| F-09 | Dark/Light Modes | System preference + toggle |

#### Backend
| ID | Feature | Description |
|----|---------|-------------|
| B-01 | POST /api/enquiry | Accept, validate, store registration form data |
| B-02 | Input Validation | Zod schemas, sanitize all inputs |
| B-03 | MongoDB Storage | Persist enquiry with timestamps |
| B-04 | Email Confirmation | Send confirmation email on successful enquiry |
| B-05 | Rate Limiting | Prevent spam/abuse on form submission endpoint |
| B-06 | CORS | Strict origin whitelist |
| B-07 | Security Headers | Helmet.js, CSP, HSTS |

### 6.2 SHOULD HAVE (P1)

| ID | Feature | Description |
|----|---------|-------------|
| F-10 | Payment Integration | Stripe payment gateway, ₹2,999 fee collection |
| F-11 | Social Proof | Testimonials/rating section with scroll animation |
| F-12 | Progress Indicator | Scroll progress bar or section indicator |
| B-08 | Redis Caching | Cache static content, rate limit state |
| B-09 | Payment Webhook | Stripe webhook handler for payment verification |
| B-10 | Admin Notifications | Email/Slack alert on new registration |

### 6.3 NICE TO HAVE (P2)

| ID | Feature | Description |
|----|---------|-------------|
| F-13 | Confetti on Enrollment | Micro-celebration animation post-registration |
| F-14 | Countdown Timer | Days until workshop starts |
| F-15 | Seat Counter | "Only X seats left" urgency (from DB) |
| B-11 | SMS Confirmation | Twilio/MSG91 SMS on registration |
| B-12 | Analytics Events | GA4 custom events for funnel tracking |
| B-13 | Waitlist System | When seats full, waitlist with auto-notify |

### 6.4 BONUS (Evaluation Score)
| ID | Feature | Points |
|----|---------|--------|
| BX-01 | TypeScript (end-to-end) | +5% |
| BX-02 | Tailwind CSS | +5% |
| BX-03 | Form validation (Zod + React Hook Form) | +5% |
| BX-04 | Loading states (skeleton + spinners) | +5% |
| BX-05 | Vercel + Railway deployment | +5% |
| BX-06 | GitHub Actions CI/CD | +5% |

---

## 7. Content Inventory

### Scroll Story Sections (in order)
```
1. HERO          — "This summer, your child codes the future."
2. SPARK         — "What if they built their own robot?" (problem/curiosity)
3. THE JOURNEY   — Week-by-week curriculum visual
4. WHAT THEY'LL BUILD — Project showcases (AI chatbot, robotic arm sim, etc.)
5. OUTCOMES      — Skills + certificate
6. DETAILS       — Age / Duration / Mode / Fee / Date
7. TESTIMONIALS  — Parent + kid quotes
8. FAQ           — 5 FAQs
9. REGISTER      — Form + payment
10. FOOTER       — Links, policies
```

### Workshop Details Content
- **Title:** AI & Robotics Summer Workshop
- **Subtitle:** A 4-week hands-on program where kids 8–14 build AI models and robotic simulations
- **Age Group:** 8–14 Years
- **Duration:** 4 Weeks (20 sessions × 90 min)
- **Mode:** Online (Live + Recorded)
- **Fee:** ₹2,999 (all-inclusive)
- **Start Date:** 15 July 2026
- **Seats:** 30 per batch
- **Certificate:** Yes — MindWire Certificate of Completion

### Learning Outcomes (6 points)
1. Build a working AI image classifier using Teachable Machine
2. Program a robotic arm simulation in Scratch + Python
3. Understand how neural networks learn (visual explainers)
4. Create a voice-activated smart assistant
5. Collaborate on a final showcase project
6. Receive a portfolio-ready project report

### FAQs (5 minimum)
1. Does my child need prior coding experience? → No, zero experience required
2. What tools/software will be used? → Browser-based (no installs needed)
3. Are sessions recorded? → Yes, 30-day replay access
4. What if we miss a class? → Recorded session + makeup slot available
5. Is there a refund policy? → Full refund within 48 hours of booking

---

## 8. Non-Functional Requirements

### Performance
- Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- LCP < 1.8s on 4G
- Images: WebP format, lazy loaded, responsive srcsets
- JS bundle: < 200KB gzipped (code splitting per route)
- Critical CSS inlined

### Security
- All inputs sanitized server-side (DOMPurify equivalent on backend)
- MongoDB injection prevention (Mongoose strict mode)
- Rate limiting: 5 requests/minute per IP on /api/enquiry
- Payment data never stored server-side (PCI compliance via Stripe)
- HTTPS enforced (HSTS)
- Environment variables never exposed to client

### Accessibility
- WCAG 2.1 AA compliance
- All images have alt text
- Keyboard navigable (focus rings visible)
- Screen reader friendly (ARIA labels)
- `prefers-reduced-motion` respected for all animations

### SEO
- Meta tags: title, description, OG tags
- Structured data (JSON-LD for Event schema)
- Canonical URLs
- Sitemap.xml

---

## 9. Out of Scope (v1.0)

- Multi-workshop catalog / browse page
- User authentication / account dashboard
- Live chat support
- Content Management System (CMS)
- Mobile app
- Multi-language support (Hindi, Tamil — v2 roadmap)

---

## 10. Dependencies & Third-Party Services

| Service | Purpose | Fallback |
|---------|---------|---------|
| MongoDB Atlas | Primary database | Retry + queue |
| Redis Cloud | Caching, rate limiting | In-memory fallback |
| Stripe | Payment gateway | Enquiry-only mode |
| Resend / Nodemailer | Transactional email | Queue for retry |
| Cloudinary | Image CDN & optimization | Local + Vercel CDN |
| Sentry | Error monitoring | Console logging |
| Vercel | Frontend hosting | Netlify |
| Railway | Backend hosting | Render |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Stripe payment failure | Medium | High | Show enquiry-only fallback, retry logic |
| MongoDB connection drop | Low | High | Connection pooling, retry mechanism |
| High traffic spike | Low | Medium | Redis caching, rate limiting, CDN |
| Spam form submissions | High | Medium | Rate limiting, honeypot field, CAPTCHA (v2) |
| Mobile scroll performance | Medium | High | will-change CSS, GSAP profiling, lazy load |

---

## 12. Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design System Setup | Day 1 | Tokens, components, storybook |
| Frontend Sections | Day 2–4 | All page sections, responsive |
| Animations & Scroll | Day 4–5 | GSAP/Framer Motion story |
| Backend API | Day 3–4 | Express + MongoDB + validation |
| Payment Integration | Day 5 | Stripe end-to-end |
| Email + Caching | Day 5–6 | Resend + Redis |
| CI/CD + Deploy | Day 6–7 | GitHub Actions + Vercel + Railway |
| QA + Lighthouse | Day 7 | Score ≥ 90, bug-free |

---

*PRD Owner: Engineering Lead | Reviewed by: Design, Backend, QA*
