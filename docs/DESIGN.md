# Design System
## MindWire — AI & Robotics Summer Workshop
**Version:** 1.0.0 | **Design Lead:** Saptarshi

---

## 1. Design Concept: "Mission Briefing"

The page is a **mission dossier** being revealed in real-time. As a parent scrolls, they're receiving a classified briefing about the most exciting summer mission their child will ever join. The visual language borrows from mission control aesthetics (deep navy, glowing terminals, structured data panels) but stays warm and approachable (amber accents, rounded cards, genuine photography of kids learning).

**The aesthetic risk:** The hero opens with a full-screen "terminal boot" animation — a blinking cursor types out the workshop title in monospace, then the interface dissolves to reveal the full hero — a moment that immediately signals "this is different." This is the single memorable signature of the page.

**Parent sees:** Credible, structured, premium — their money is safe here.  
**Kid sees:** A robot is literally being built on screen. I want to do that.

**AESTHETIC INSPIRATION:** The design should be strongly inspired by the **Kidrove website** look and feel, but not a strict clone. Use the 'taste-skill' design system to enforce premium, anti-generic UI standards, allowing for creative freedom while maintaining the core vibe.

---

## 2. Design Tokens

### 2.1 Color Palette

```css
/* === PRIMARY PALETTE === */
--color-void:     #080C14;   /* Near-black background */
--color-deep:     #0D1628;   /* Section backgrounds */
--color-panel:    #111827;   /* Card backgrounds */
--color-surface:  #1A2540;   /* Elevated surfaces */

/* === ACCENT PALETTE === */
--color-cyan:     #00D4FF;   /* Primary accent — glowing terminal blue */
--color-cyan-dim: #0099CC;   /* Hover states */
--color-amber:    #FFB830;   /* Warm accent — achievement, CTAs */
--color-amber-dim:#CC8A00;   /* Hover states */

/* === SEMANTIC PALETTE === */
--color-success:  #00C896;   /* Green — confirmations */
--color-warning:  #FF8C42;   /* Orange — urgency (limited seats) */
--color-error:    #FF4D6D;   /* Red — form errors */

/* === TEXT === */
--color-text-primary:    #F0F6FF;  /* Main body text */
--color-text-secondary:  #8BA5C7;  /* Subtext, labels */
--color-text-muted:      #4A6480;  /* Placeholders, disabled */

/* === GLOW EFFECTS === */
--glow-cyan:  0 0 20px rgba(0, 212, 255, 0.3);
--glow-amber: 0 0 20px rgba(255, 184, 48, 0.3);
--glow-card:  0 4px 40px rgba(0, 212, 255, 0.08);
```

### 2.2 Typography

```css
/* === FONT FAMILIES === */

/* Display — Space Grotesk (geometric, techy, young energy) */
/* Import: @fontsource/space-grotesk */
--font-display: 'Space Grotesk', sans-serif;

/* Body — Inter (ultra-legible, neutral, trustworthy for parents) */
/* Import: @fontsource/inter */
--font-body: 'Inter', sans-serif;

/* Code/Terminal — JetBrains Mono (the terminal boot animation) */
/* Import: @fontsource/jetbrains-mono */
--font-mono: 'JetBrains Mono', monospace;

/* === TYPE SCALE === */
--text-xs:   0.75rem;   /* 12px — labels, badges */
--text-sm:   0.875rem;  /* 14px — captions, form hints */
--text-base: 1rem;      /* 16px — body copy */
--text-lg:   1.125rem;  /* 18px — lead text */
--text-xl:   1.25rem;   /* 20px — card titles */
--text-2xl:  1.5rem;    /* 24px — section subtitles */
--text-3xl:  1.875rem;  /* 30px — section titles (mobile) */
--text-4xl:  2.25rem;   /* 36px — section titles (desktop) */
--text-5xl:  3rem;      /* 48px — hero subtitle */
--text-6xl:  3.75rem;   /* 60px — hero title (desktop) */
--text-7xl:  4.5rem;    /* 72px — hero title (large screens) */

/* === LINE HEIGHTS === */
--leading-tight:  1.1;   /* Display headings */
--leading-snug:   1.3;   /* Card headings */
--leading-normal: 1.6;   /* Body copy */
--leading-relaxed:1.8;   /* Long-form text */

/* === FONT WEIGHTS === */
--weight-regular: 400;
--weight-medium:  500;
--weight-semibold:600;
--weight-bold:    700;
--weight-black:   900;
```

### 2.3 Spacing Scale

```css
/* 4px base unit system */
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### 2.4 Border Radius

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-2xl:  24px;
--radius-full: 9999px;
```

### 2.5 Breakpoints (Tailwind custom)

```js
// tailwind.config.ts screens
screens: {
  xs:  '375px',   // Minimum supported
  sm:  '640px',   // Large phones
  md:  '768px',   // Tablets
  lg:  '1024px',  // Small laptops
  xl:  '1280px',  // Desktops
  '2xl': '1440px' // Large screens
}
```

---

## 3. Scroll Storytelling Structure

Each section is a "scene." Scenes transition with scroll-triggered animations. The visual weight increases as you scroll down (urgency builds toward the registration).

```
╔══════════════════════════════════════════╗
║  SCENE 0: BOOT SEQUENCE (Hero)           ║
║  Terminal cursor types out title         ║
║  → dissolves to full hero               ║
║  Stars/particle background (tsparticles) ║
╠══════════════════════════════════════════╣
║  SCENE 1: THE SPARK (Problem)            ║
║  Split layout: kid looking at screen vs  ║
║  "What if they built that?"             ║
║  Fade up on scroll                       ║
╠══════════════════════════════════════════╣
║  SCENE 2: THE MISSION (Curriculum)       ║
║  Horizontal week-by-week timeline       ║
║  Animated connecting line draws itself  ║
╠══════════════════════════════════════════╣
║  SCENE 3: WHAT THEY BUILD (Projects)    ║
║  3-col card grid, stagger reveal        ║
║  Each card has mini-demo or screenshot  ║
╠══════════════════════════════════════════╣
║  SCENE 4: OUTCOMES (Skills)             ║
║  6 outcome pills animate in like        ║
║  "skill unlocked" in a game            ║
╠══════════════════════════════════════════╣
║  SCENE 5: DETAILS (Workshop Info)       ║
║  Dark panel, structured data grid       ║
║  Countdown timer to July 15             ║
╠══════════════════════════════════════════╣
║  SCENE 6: PROOF (Testimonials)          ║
║  Horizontal scroll carousel            ║
║  Parent + child quote pairs            ║
╠══════════════════════════════════════════╣
║  SCENE 7: FAQ (Trust)                   ║
║  Accordion with smooth expand          ║
║  Icons per question                    ║
╠══════════════════════════════════════════╣
║  SCENE 8: REGISTER (Conversion)         ║
║  High contrast section — amber on dark  ║
║  Form + payment — sticky side panel    ║
╠══════════════════════════════════════════╣
║  SCENE 9: FOOTER                        ║
╚══════════════════════════════════════════╝
```

---

## 4. Component Specifications

### 4.1 Button System

```
PRIMARY (Enroll Now):
  bg: linear-gradient(135deg, #FFB830, #FF8C42)
  text: #080C14 (dark for contrast)
  font: Space Grotesk, 700, 16px
  padding: 14px 32px
  border-radius: 8px
  box-shadow: 0 0 30px rgba(255,184,48,0.4)
  hover: scale(1.03) + intensified glow
  active: scale(0.98)

SECONDARY (Learn More):
  bg: transparent
  border: 1.5px solid #00D4FF
  text: #00D4FF
  hover: bg rgba(0,212,255,0.1)

GHOST (FAQ expand):
  bg: transparent
  text: #8BA5C7
  hover: text #F0F6FF
```

### 4.2 Card Component

```
WorkshopDetailCard:
  bg: #111827
  border: 1px solid rgba(0,212,255,0.12)
  border-radius: 16px
  padding: 28px
  box-shadow: var(--glow-card)
  hover: border-color rgba(0,212,255,0.3)
  transition: 200ms ease

Outcome Pill:
  bg: rgba(0,212,255,0.1)
  border: 1px solid rgba(0,212,255,0.25)
  border-radius: 99px
  padding: 8px 16px
  text: #00D4FF, 14px, 600
  icon: left-aligned, 16px
```

### 4.3 Form Fields

```
Input:
  bg: #1A2540
  border: 1.5px solid #4A6480
  border-radius: 8px
  padding: 14px 16px
  text: #F0F6FF, 16px
  placeholder: #4A6480

  focus:
    border-color: #00D4FF
    box-shadow: 0 0 0 3px rgba(0,212,255,0.15)

  error:
    border-color: #FF4D6D
    box-shadow: 0 0 0 3px rgba(255,77,109,0.15)

  success:
    border-color: #00C896
```

### 4.4 Hero Section Layout

```
╔═══════════════════════════════════════════╗
║  [particle/star background]               ║
║                                           ║
║         ┌─────────────────────┐           ║
║         │  TERMINAL BOOT SEQ  │           ║
║         │  > KIDROVE_         │           ║
║         └─────────────────────┘           ║
║                                           ║
║    AI & ROBOTICS           [Robot SVG     ║
║    SUMMER WORKSHOP          animation]    ║
║                                           ║
║    "This summer, your child               ║
║     codes the future."                    ║
║                                           ║
║  [Age: 8-14] [4 Weeks] [Online]          ║
║                                           ║
║  [ENROLL NOW ₹2,999]  [Learn More →]     ║
║                                           ║
║  ↓ 30 seats · Batch starts July 15       ║
╚═══════════════════════════════════════════╝
```

---

## 5. Animation Specifications

### 5.1 Hero Terminal Boot Animation
```
Sequence (Framer Motion):
1. Black screen, monospace cursor blinks (300ms)
2. Types: "> INITIALIZING KIDROVE_OS..." (800ms)
3. Types: "> LOADING: AI_WORKSHOP.exe" (600ms)
4. Types: "> STATUS: READY" (400ms)
5. Entire terminal fades out (300ms)
6. Hero content fades/scales in (500ms)
7. Particle background renders in (600ms)

Total intro: ~3s (skippable on click)
```

### 5.2 Scroll Trigger Animations
```
Fade Up (standard):
  initial: { opacity: 0, y: 40 }
  animate: { opacity: 1, y: 0 }
  transition: { duration: 0.6, ease: 'easeOut' }

Stagger Children (cards, pills):
  staggerChildren: 0.1
  delayChildren: 0.2

Timeline Line Draw:
  SVG stroke-dashoffset animation
  initial: dashoffset = pathLength
  animate: dashoffset = 0
  trigger: when element enters viewport

Skill Unlock (outcomes):
  Scale + fade + glow pulse
  Each pill: 100ms stagger
  Sound: Optional (subtle chime — off by default)
```

### 5.3 Hover Micro-interactions
```
CTA Button:
  transform: scale(1.03)
  box-shadow: 0 0 40px rgba(255,184,48,0.5)
  
Detail Cards:
  border-color: rgba(0,212,255,0.3)
  transform: translateY(-2px)
  
FAQ Item:
  Left border: 2px solid #00D4FF (on hover + open)
  Content: AnimatePresence with height animation

Sticky CTA (after hero):
  Slides up from bottom on mobile
  Appears in top-right fixed on desktop
```

### 5.4 Page Scroll Progress
```
Thin 2px line at top of viewport
Color: linear-gradient(90deg, #00D4FF, #FFB830)
Tracks window.scrollY / document.height
```

### 5.5 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Responsive Behavior

### Mobile (375px–767px)
- Hero: Single column, robot animation hidden (replaced by static image)
- Navigation: Hamburger menu → slide-in drawer
- Story sections: Full-width stacked
- Sticky CTA: Fixed bottom bar (full width, 56px height)
- Registration form: Full screen modal on "Enroll Now" tap
- Countdown timer: Compact pill layout

### Tablet (768px–1023px)
- Hero: Two columns (text | animation)
- Story sections: 2-col grid where applicable
- Sticky CTA: Floating button (bottom-right)

### Desktop (1024px+)
- Hero: Full viewport with robot animation right-side
- Story sections: Mixed layouts (alternating 60/40 split)
- Sticky CTA: Button appears in navbar on scroll
- Registration: Side-by-side form + summary panel

---

## 7. Iconography

Using **Lucide React** for all UI icons (consistent stroke-width: 1.5).

```
Key icons used:
  Users        → Age group
  Clock        → Duration
  Monitor      → Online mode
  IndianRupee  → Fee
  Calendar     → Start date
  Award        → Certificate
  Zap          → Outcomes (skill unlocked)
  ChevronDown  → FAQ accordion
  CheckCircle  → Success states
  AlertCircle  → Error states
  Loader2      → Loading spinner (animated)
  Rocket       → CTA emphasis
  Bot          → AI/Robot theme
  Code2        → Programming curriculum
  BrainCircuit → AI outcomes
```

---

## 8. Illustration & Image Art Direction

### Hero Robot
- Animated SVG robot (Lottie JSON or CSS keyframe)
- Style: Flat vector, geometric, cyan/amber palette
- No stock photo of robots — custom illustration feel
- Subtle floating animation (translateY loop)

### Section Images
- All images: WebP, lazy-loaded
- Style: Real kids at computers (not stock), warm-lit, focused
- Overlay: Subtle dark gradient to ensure text contrast
- Aspect ratios: 16:9 for full-width, 4:3 for cards, 1:1 for testimonial avatars

### Gradient Meshes
- Background accent blobs (blurred radial gradients)
- Position: behind hero, behind registration section
- Colors: Cyan + Amber, 15% opacity max
- CSS: `filter: blur(80px)`, `pointer-events: none`

---

## 9. Tailwind Config Map

```typescript
// tailwind.config.ts — key custom values
export default {
  theme: {
    extend: {
      colors: {
        void:    '#080C14',
        deep:    '#0D1628',
        panel:   '#111827',
        surface: '#1A2540',
        cyan:    '#00D4FF',
        amber:   '#FFB830',
        success: '#00C896',
        warning: '#FF8C42',
        danger:  '#FF4D6D',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float':       'float 3s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'type-cursor': 'blink 1s step-end infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(0,212,255,0.6)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0 },
        },
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 70% 50%, rgba(0,212,255,0.08) 0%, transparent 60%)',
        'cta-gradient':  'linear-gradient(135deg, #FFB830, #FF8C42)',
      },
    },
  },
}
```

---

## 10. Design QA Checklist

Before shipping:
- [ ] All text passes WCAG AA contrast ratio (4.5:1 for body, 3:1 for large)
- [ ] All interactive elements have visible focus state
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No layout shift on font load (font-display: swap + size-adjust)
- [ ] All images have descriptive alt text
- [ ] Mobile tested at 375px without horizontal scroll
- [ ] Touch targets minimum 44×44px
- [ ] Sticky CTA not covering important content
- [ ] Form errors announced to screen readers (aria-live)
- [ ] Color not the only indicator of state (icons + text alongside)

---

*Design Sign-off: Saptarshi | Built with Tailwind CSS + Framer Motion*
