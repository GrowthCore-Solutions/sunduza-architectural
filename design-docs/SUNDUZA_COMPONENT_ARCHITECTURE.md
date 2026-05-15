# SUNDUZA ARCHITECTURAL & PROJECTS
## Component Architecture
### Every Frontend Component · Props · State · Behaviour · Rules

---

> A component has one job.
> It renders UI from props and local state.
> It never knows about the database.
> It never calls the API directly.
> It never contains business logic.
> Everything else flows from these rules.

---

## CONTEXT

We have 18 endpoints fully specified with typed request/response
shapes. The component architecture consumes those shapes and turns
them into a user interface.

Every component in this document maps to a file in
`src/client/components/`. Every component follows these laws:

```
LAW 1 — Single responsibility: one component, one job
LAW 2 — Data comes from props or hooks, never fetched internally
LAW 3 — API calls only through hooks, hooks only through services
LAW 4 — No business logic — that lives in use cases on the server
LAW 5 — No direct Prisma, no direct fetch to /api — only service layer
LAW 6 — Every loading state handled — no blank screens
LAW 7 — Every error state handled — no silent failures
LAW 8 — Every empty state handled — no missing UI branches
```

---

## COMPONENT TREE OVERVIEW

```
src/client/components/
│
├── ui/                     shadcn/ui primitives — never modified
│   └── (button, card, input, dialog, table, badge, skeleton, toast, tooltip)
│
├── layout/                 Structural — wrap every page
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── whatsapp-button.tsx
│   └── admin-sidebar.tsx
│
├── home/                   Homepage sections — static + ISR data
│   ├── hero.tsx
│   ├── services-preview.tsx
│   ├── portfolio-preview.tsx
│   ├── testimonials.tsx
│   ├── stats-bar.tsx
│   └── cta-section.tsx
│
├── booking/                Lead capture
│   ├── booking-form.tsx
│   └── booking-success.tsx
│
├── contact/                General inquiry
│   ├── contact-form.tsx
│   └── contact-info.tsx
│
├── projects/               Portfolio display
│   ├── project-card.tsx
│   ├── project-grid.tsx
│   └── project-filter.tsx
│
├── admin/                  Admin dashboard components
│   ├── dashboard-stats.tsx
│   ├── conversion-funnel.tsx
│   ├── bookings-table.tsx
│   ├── booking-detail-modal.tsx
│   ├── booking-status-badge.tsx
│   ├── lead-score-badge.tsx
│   ├── projects-manager.tsx
│   ├── project-form-modal.tsx
│   ├── messages-table.tsx
│   └── settings-form.tsx
│
└── seo/
    ├── page-metadata.tsx
    └── local-business-schema.tsx
```

---
---

## SECTION 1 — LAYOUT COMPONENTS

These wrap every page. They are loaded once and persist across
navigation. They must never cause layout shift.

---

### COMPONENT: navbar.tsx

**Job:** Top navigation bar. Responsive. Mobile menu toggle.

**Props:**
```typescript
// No props — reads from SiteSettings via hook, navigation from config
interface NavbarProps {}
```

**State:**
```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
```

**Data dependencies:**
```typescript
// Navigation links from config/navigation.json — build-time
// No API calls — navbar must render instantly
const navLinks = [
  { label: 'Home',     href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact',  href: '/contact' },
]
```

**Renders:**
```
Desktop (≥768px):
  [Logo]  [Home] [Services] [Projects] [Contact]  [Book Consultation →]

Mobile (<768px):
  [Logo]                                           [☰ Menu icon]
  
  When open:
  ┌─────────────────────┐
  │ Home                │
  │ Services            │
  │ Projects            │
  │ Contact             │
  │ [Book Consultation] │
  └─────────────────────┘
```

**Rules:**
```
- Logo links to /
- "Book Consultation" is always a filled primary button, never a link
- Mobile menu closes on route change (usePathname() effect)
- Mobile menu closes on outside click
- Active route is highlighted (usePathname() comparison)
- No auth state in navbar — admin nav is separate (AdminSidebar)
```

---

### COMPONENT: footer.tsx

**Job:** Site footer. Links, contact info, legal, social.

**Props:**
```typescript
interface FooterProps {}
// Reads WhatsApp number and contact email from useSettings() hook
```

**Data dependencies:**
```typescript
const { data: settings } = useSettings()
// whatsapp_number, contact_email, business_address
```

**Renders:**
```
┌────────────────────────────────────────────────────────┐
│  [Logo + tagline]                                      │
│                                                        │
│  Services          Company         Contact             │
│  House Planning    About           0867233640          │
│  Arch Drawings     Projects        email@gmail.com     │
│  Drafting          Book Now        South Africa        │
│  Dev Planning      Contact                             │
│                                                        │
│  [WhatsApp] [Facebook] [Instagram]                     │
│                                                        │
│  © 2024 Sunduza Architectural · Privacy Policy         │
└────────────────────────────────────────────────────────┘
```

**Rules:**
```
- Privacy Policy links to /privacy — POPIA requirement
- WhatsApp link uses settings.whatsapp_number — not hardcoded
- Social links open in new tab with rel="noopener noreferrer"
- If settings not loaded, show skeleton for dynamic values
```

---

### COMPONENT: whatsapp-button.tsx

**Job:** Floating WhatsApp CTA. Always visible. Bottom-right.
The single most important conversion path after the booking form.

**Props:**
```typescript
interface WhatsAppButtonProps {}
// Reads whatsapp_number from useSettings()
```

**Data dependencies:**
```typescript
const { data: settings } = useSettings()
const number  = settings?.whatsapp_number ?? '27867233640' // fallback
const message = encodeURIComponent(
  "Hello, I'm interested in architectural services."
)
const href = `https://wa.me/${number}?text=${message}`
```

**Renders:**
```
Position: fixed, bottom-6, right-6, z-50

[WhatsApp icon — green]
  Tooltip on hover: "Chat with us on WhatsApp"
```

**Behaviour:**
```
- Opens wa.me link in new tab
- Always visible on scroll (fixed position)
- Fires GA4 event: whatsapp_click with page_path
- Pulse animation to draw attention (subtle, not annoying)
- Hidden on /admin/* routes — admin doesn't need it
```

**GA4 Event:**
```typescript
gtag('event', 'whatsapp_click', {
  page_path: window.location.pathname,
})
```

---

### COMPONENT: admin-sidebar.tsx

**Job:** Admin navigation sidebar. Shows on all /admin/* pages.
Displays unread message count badge.

**Props:**
```typescript
interface AdminSidebarProps {
  currentPath: string
}
```

**Data dependencies:**
```typescript
// Unread count badge
const { data: messages } = useMessages({ read: false })
const unreadCount = messages?.meta?.total ?? 0
```

**Renders:**
```
┌─────────────────────┐
│  [Logo]             │
│  Sunduza Admin      │
├─────────────────────┤
│  ◈ Dashboard        │
│  ◈ Bookings         │
│  ◈ Projects         │
│  ◈ Messages    [3]  │  ← unread badge
│  ◈ Settings         │
├─────────────────────┤
│  [Logout]           │
└─────────────────────┘
```

**Rules:**
```
- Active route highlighted with filled background
- Unread badge shows count — disappears when count = 0
- Logout button calls authService.logout() then router.push('/admin/login')
- On mobile: sidebar becomes a top bar with hamburger
- Sidebar width: 240px fixed on desktop
```

---
---

## SECTION 2 — HOME PAGE COMPONENTS

Homepage is ISR — revalidates every 60 seconds.
These components receive server-fetched data as props.
No client-side fetching on the homepage.

---

### COMPONENT: hero.tsx

**Job:** Above-the-fold section. First impression. Primary CTA.

**Props:**
```typescript
interface HeroProps {
  tagline: string          // From SiteSettings: hero_tagline
  yearsExperience: string  // From SiteSettings: years_experience
}
```

**Renders:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   [Hero background image — hero-desktop.webp]             │
│                                                            │
│   "Designing Spaces That Inspire"          [dark overlay] │
│                                                            │
│   Professional Architectural Services                      │
│   across South Africa · 5+ Years Experience               │
│                                                            │
│   [Book a Consultation →]    [View Our Work]              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Rules:**
```
- next/image with priority={true} — hero is LCP element
- priority={true} means no lazy loading — loads immediately
- Separate image for mobile (hero-mobile.webp) via srcSet
- Tagline from props — not hardcoded — admin can change it
- "Book a Consultation" → /booking
- "View Our Work" → /projects
- Both CTAs tracked in GA4: hero_cta_click with variant
- Min height: 90vh on desktop, 70vh on mobile
- Text must be readable over image — dark overlay required
```

**Accessibility:**
```
- Background image has aria-hidden="true"
- Heading is <h1> — one per page
- Both buttons are <a> tags styled as buttons — not <button>
  (they navigate, not submit)
```

---

### COMPONENT: services-preview.tsx

**Job:** Display 4 service cards with CTAs. Drive to /booking.

**Props:**
```typescript
interface ServicesPreviewProps {
  showHeading?: boolean  // false on services page (heading already exists)
}

// Service data from config/services.json — build-time, not API
```

**Renders:**
```
  "What We Offer"

  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │  🏠          │ │  📐          │ │  📄          │ │  🏗️          │
  │ House        │ │ Architectural│ │ Drafting     │ │ Development  │
  │ Planning     │ │ Drawings     │ │ Services     │ │ Planning     │
  │              │ │              │ │              │ │              │
  │ Thoughtful   │ │ Professional │ │ Accurate     │ │ Planning     │
  │ layouts...   │ │ drawings...  │ │ drafting...  │ │ support...   │
  │              │ │              │ │              │ │              │
  │ [Book Now →] │ │ [Book Now →] │ │ [Book Now →] │ │ [Book Now →] │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Rules:**
```
- Each "Book Now →" links to /booking?service=<service_key>
- Booking form reads the ?service param and pre-selects the dropdown
- Icons are Lucide React — no emojis in production
- 4-column grid on desktop, 2-column on tablet, 1-column on mobile
- Hover state: card lifts with subtle shadow
```

---

### COMPONENT: portfolio-preview.tsx

**Job:** Show 3 featured projects. Teaser for the full portfolio.

**Props:**
```typescript
interface PortfolioPreviewProps {
  projects: Project[]  // Max 3 — filtered is_featured = true server-side
}
```

**Renders:**
```
  "Our Work"    "See All Projects →"

  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ [image]      │ │ [image]      │ │ [image]      │
  │              │ │              │ │              │
  │ Sandton      │ │ Pretoria     │ │ Midrand      │
  │ Residence    │ │ Mixed-Use    │ │ Office       │
  │              │ │              │ │              │
  │ Residential  │ │ Development  │ │ Commercial   │
  └──────────────┘ └──────────────┘ └──────────────┘
```

**Rules:**
```
- Images via next/image with loading="lazy" (not LCP — below fold)
- If projects.length === 0: show placeholder message "Coming soon"
- "See All Projects →" links to /projects
- Each card is clickable — for now, no detail page (v2)
  Clicking shows project description in a modal (v1)
- 3-column on desktop, 2 on tablet, 1 on mobile
```

---

### COMPONENT: testimonials.tsx

**Job:** Display client testimonials. Social proof section.

**Props:**
```typescript
interface TestimonialsProps {
  testimonials: Testimonial[]  // Seeded data passed from server component
}
```

**State:**
```typescript
const [activeIndex, setActiveIndex] = useState(0)
// Simple dot-navigation carousel
```

**Renders:**
```
  "What Our Clients Say"

  ┌────────────────────────────────────────────────────────┐
  │                                                        │
  │  ★★★★★                                                 │
  │                                                        │
  │  "Kevin delivered architectural drawings that were     │
  │  precise, professional, and ready for council          │
  │  submission first time..."                             │
  │                                                        │
  │  — Thabo Mokoena                                       │
  │                                                        │
  │              ●  ○  ○                                   │
  └────────────────────────────────────────────────────────┘
```

**Rules:**
```
- Auto-advances every 5 seconds (clearInterval on unmount)
- Dot navigation for manual control
- Pause auto-advance on hover
- Rating renders as filled stars (Lucide Star icon)
- If testimonials.length === 0: section is hidden entirely
- Transition: fade (not slide — simpler, more elegant)
```

---

### COMPONENT: stats-bar.tsx

**Job:** Social proof numbers. "5+ years · 30 projects · South Africa"

**Props:**
```typescript
interface StatsBarProps {
  yearsExperience:    string
  projectsCompleted:  string
}
```

**Renders:**
```
┌──────────────────────────────────────────────────────────┐
│   5+ Years          30+ Projects        South Africa     │
│   Experience        Completed           Based             │
└──────────────────────────────────────────────────────────┘
```

**Rules:**
```
- Values from SiteSettings passed as props — admin can update
- 3-column layout — collapses to vertical on mobile
- Background: dark/brand colour — high contrast section break
- Numbers animate up on scroll into view (IntersectionObserver)
```

---

### COMPONENT: cta-section.tsx

**Job:** Bottom-of-page conversion push. Last chance before footer.

**Props:**
```typescript
interface CtaSectionProps {}
// No data dependencies — fully static
```

**Renders:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│         Ready to Build Something Great?                    │
│                                                            │
│   Let's discuss your project. No obligation.               │
│                                                            │
│         [Book Your Free Consultation →]                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Rules:**
```
- CTA button → /booking
- Background: brand accent colour (gold/premium tone)
- This section appears on: Homepage, Services page, Projects page
- It is a shared component — not page-specific
```

---
---

## SECTION 3 — BOOKING COMPONENTS

The most critical frontend components. Handle the primary
conversion flow. Every error state handled. No ambiguity.

---

### COMPONENT: booking-form.tsx

**Job:** 8-field consultation request form. The primary conversion
component of the entire system. Service-contextual description
prompts. POPIA consent. GA4 tracking.

**Props:**
```typescript
interface BookingFormProps {
  preSelectedService?: ServiceKey  // From ?service= URL param
}
```

**State:**
```typescript
// React Hook Form manages all form state
const form = useForm<CreateBookingInput>({
  resolver: zodResolver(publicBookingSchema),
  defaultValues: {
    service:       preSelectedService ?? '',
    consent_given: false,
  }
})

// Track submission state for GA4 and UI
const [submitState, setSubmitState] = useState<
  'idle' | 'submitting' | 'success' | 'error'
>('idle')
```

**Service-Contextual Prompts:**
```typescript
const DESCRIPTION_PROMPTS: Record<ServiceKey, string> = {
  house_planning:
    'Describe your plot size, number of rooms, preferred style ' +
    '(modern, traditional, contemporary), and any special requirements.',
  arch_drawings:
    'Describe the type of drawings needed, the stage of your ' +
    'project, and whether you have existing plans.',
  drafting_services:
    'Describe the scope of drafting work required and the type ' +
    'of project (residential, commercial, mixed-use).',
  dev_project_planning:
    'Describe the development type, total site size, number of ' +
    'units, and current planning stage.',
}

// In component:
const selectedService = form.watch('service')
const descriptionPlaceholder = selectedService
  ? DESCRIPTION_PROMPTS[selectedService]
  : 'Tell us about your project...'
```

**Renders:**
```
"Request a Consultation"

Full Name *                    Email Address *
[___________________________]  [___________________________]

Phone Number *                 Service Needed *
[___________________________]  [Select a service ▾]
                                 ├ House Planning
                                 ├ Architectural Drawings
                                 ├ Drafting Services
                                 └ Development Project Planning

Project Location *
[_______________________________________________________________]

Project Description *
[_______________________________________________________________]
[  (placeholder changes based on selected service)             ]
[_______________________________________________________________]
Min 20 characters · 0 / 2000

Preferred Meeting Date          Budget (Optional)
[Date picker            ]      [___________________________]

☐ I agree to be contacted by Sunduza Architectural regarding
  my enquiry. View our Privacy Policy.  *

[Request Consultation →]                (Powered by 256-bit SSL)
```

**Validation Behaviour:**
```
- Validation runs on blur (when user leaves a field)
- Not on every keystroke — avoids annoying red errors while typing
- On submit: validate all fields — show all errors simultaneously
- Error message appears directly under the field it belongs to
- Submit button disabled while submitting (prevent double-submit)
- Character counter shown on description field
```

**On Submit:**
```typescript
const onSubmit = async (data: CreateBookingInput) => {
  setSubmitState('submitting')

  // GA4: track form submission attempt
  gtag('event', 'booking_form_submit', { service: data.service })

  try {
    await bookingService.create(data)

    // GA4: track successful conversion
    gtag('event', 'booking_form_success', {
      service:    data.service,
      // GTM picks this up and fires Google Ads conversion pixel
    })

    setSubmitState('success')
  } catch (err) {
    if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
      // Map server validation errors back to form fields
      Object.entries(err.fields ?? {}).forEach(([field, messages]) => {
        form.setError(field as any, { message: messages[0] })
      })
    }

    // GA4: track failure
    gtag('event', 'booking_form_error', {
      error_code: err instanceof ApiError ? err.code : 'UNKNOWN',
    })

    setSubmitState('error')
  }
}
```

**States:**
```
idle:        Normal form display
submitting:  Button shows spinner, all fields disabled, "Submitting..."
success:     Form unmounts, BookingSuccess component mounts
error:       
  VALIDATION_ERROR → field errors shown inline, form stays
  RATE_LIMITED     → rate limit banner shown, form hidden
  500              → generic error shown, WhatsApp offered as alternative
```

**Rules:**
```
- consent_given must be z.literal(true) — form cannot submit without it
- meeting_date minimum: tomorrow (enforced client-side + server-side)
- Phone field: SA format hint shown in placeholder "e.g. 0781234567"
- Service dropdown: pre-selects if ?service= param is in URL
- On mount: check for ?service= param (from services page CTAs)
- Form resets to idle on component unmount
```

---

### COMPONENT: booking-success.tsx

**Job:** Post-submission success state. Replaces the form.
Reassures the visitor, tells them what happens next.

**Props:**
```typescript
interface BookingSuccessProps {
  service: ServiceKey   // Show which service they booked
  onBookAnother: () => void  // Reset to show form again
}
```

**Renders:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  ✓ (large green checkmark)                 │
│                                                            │
│           "Request Received!"                              │
│                                                            │
│  "Thank you for reaching out. We have received your        │
│  house planning enquiry and will contact you within        │
│  24 hours to discuss your project."                        │
│                                                            │
│  "In the meantime, feel free to chat with us on            │
│  WhatsApp for a faster response."                          │
│                                                            │
│  [Chat on WhatsApp]     [Submit Another Request]           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Rules:**
```
- Service name shown in message: "house planning enquiry"
- WhatsApp button uses settings.whatsapp_number — same as floating button
- "Submit Another Request" calls onBookAnother() — resets form
- No countdown, no redirect — visitor stays on /booking
```

---
---

## SECTION 4 — CONTACT COMPONENTS

---

### COMPONENT: contact-form.tsx

**Job:** General inquiry form. Simpler than booking form.
4 fields, no service selection, no POPIA consent required
(legitimate interest basis for general contact).

**Props:**
```typescript
interface ContactFormProps {}
```

**State:**
```typescript
const form = useForm<CreateMessageInput>({
  resolver: zodResolver(contactMessageSchema),
})
const [submitState, setSubmitState] = useState<
  'idle' | 'submitting' | 'success' | 'error'
>('idle')
```

**Renders:**
```
"Send a Message"

Full Name *                    Email Address *
[___________________________]  [___________________________]

Phone Number (Optional)
[___________________________]

Message *
[_______________________________________________________________]
[_______________________________________________________________]
Min 10 characters

[Send Message →]
```

**States:**
```
success: "Thank you for your message. We will reply soon."
error:   "Something went wrong. Please try WhatsApp instead."
         [Open WhatsApp]
```

---

### COMPONENT: contact-info.tsx

**Job:** Display business contact details. Static display only.

**Props:**
```typescript
interface ContactInfoProps {
  phone:    string  // From SiteSettings
  email:    string  // From SiteSettings
  address:  string  // From SiteSettings
  whatsappNumber: string  // From SiteSettings
}
```

**Renders:**
```
"Get In Touch"

📞 0867233640                (clickable — tel: link)
✉️ xivutiso@gmail.com        (clickable — mailto: link)
📍 South Africa
💬 Chat on WhatsApp           (clickable — wa.me link)

"Response time: within 24 hours"
```

**Rules:**
```
- All contact methods are clickable links
- Phone: tel: protocol (opens dialer on mobile)
- Email: mailto: protocol
- WhatsApp: wa.me link with pre-filled message
- Icons: Lucide React (Phone, Mail, MapPin, MessageCircle)
- Values from props — not hardcoded — admin changes via settings
```

---
---

## SECTION 5 — PROJECT COMPONENTS

---

### COMPONENT: project-card.tsx

**Job:** Single project display card. Used in grid and preview.

**Props:**
```typescript
interface ProjectCardProps {
  project:    Project
  onClick?:   (project: Project) => void  // Opens detail modal
  variant?:   'grid' | 'preview'          // preview = smaller, no category badge
}
```

**Renders:**
```
┌────────────────────────────┐
│  [Project image]           │
│  (aspect-ratio: 4/3)       │
├────────────────────────────┤
│  [Residential]  ← badge    │
│                            │
│  Modern Family Residence   │
│  — Sandton                 │
│                            │
│  A contemporary 4-bedroom  │
│  family home designed...   │
│  (truncated at 2 lines)    │
│                            │
│  [View Project →]          │
└────────────────────────────┘
```

**Rules:**
```
- Image via next/image — always specify width and height
- Image lazy loaded (below fold on portfolio page)
- Category badge: only shown in 'grid' variant
- Description truncated with CSS line-clamp: 2
- Hover: card scale(1.02), image subtle zoom
- No broken image state: fallback placeholder image if path fails
- "View Project →" calls onClick if provided, else no action in v1
  (project detail page is v2)
```

---

### COMPONENT: project-grid.tsx

**Job:** Responsive grid of project cards. Manages loading,
empty, and error states. Contains the filter.

**Props:**
```typescript
interface ProjectGridProps {
  initialProjects?: Project[]  // SSR data for immediate render
}
```

**State via hook:**
```typescript
const [activeCategory, setActiveCategory] = useState<string | null>(null)
const [selectedProject, setSelectedProject] = useState<Project | null>(null)

const { data, isLoading, isError } = useProjects({
  category: activeCategory ?? undefined,
})
```

**Renders:**
```
[All] [Residential] [Commercial] [Development]   ← ProjectFilter

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Project  │ │ Project  │ │ Project  │
│ Card     │ │ Card     │ │ Card     │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ Project  │ │ Project  │
│ Card     │ │ Card     │
└──────────┘ └──────────┘
```

**States:**
```
Loading:  Grid of 6 skeleton cards (same dimensions as real cards)
Error:    "Could not load projects. Please try refreshing."
Empty:    "No projects in this category yet. Check back soon."
          (Only possible if filter returns nothing)
Loaded:   Full project grid
```

**Rules:**
```
- initialProjects from SSR renders immediately — no loading flash
- Client-side filter via TanStack Query — instant switching
- Grid: 3 columns desktop · 2 tablet · 1 mobile
- Detail modal opens when project card is clicked
```

---

### COMPONENT: project-filter.tsx

**Job:** Category filter tabs for the projects page.

**Props:**
```typescript
interface ProjectFilterProps {
  categories:      string[]          // Derived from projects list
  activeCategory:  string | null
  onChange:        (category: string | null) => void
}
```

**Renders:**
```
[All]  [Residential]  [Commercial]  [Development]
```

**Rules:**
```
- "All" always first — clears filter (null)
- Categories derived from unique project.category values
- Active tab has filled background
- Smooth transition on active change
- If only one category exists, filter hidden (no point showing it)
```

---
---

## SECTION 6 — ADMIN COMPONENTS

Admin components receive data through TanStack Query hooks.
They are all protected by server-side session check
(admin layout wraps all admin pages).

---

### COMPONENT: dashboard-stats.tsx

**Job:** KPI cards at the top of the admin dashboard.
At-a-glance health of the business.

**Props:**
```typescript
interface DashboardStatsProps {}
// Fetches its own data via hooks
```

**Data:**
```typescript
const { data: bookings }   = useBookings({ limit: 1 })
const { data: messages }   = useMessages({ read: false })
const { data: pendingLeads } = useBookings({ status: 'PENDING', limit: 1 })
const { data: highPriority } = useBookings({
  status: 'PENDING',
  sort: 'lead_score',
  order: 'desc',
  limit: 1
})
```

**Renders:**
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Today's         │ │ Pending         │ │ Unread          │ │ High Priority   │
│ Bookings        │ │ Leads           │ │ Messages        │ │ Leads           │
│                 │ │                 │ │                 │ │                 │
│      3          │ │      12         │ │      2          │ │      4          │
│                 │ │                 │ │                 │ │                 │
│ ↑ 2 from        │ │ Awaiting        │ │ Need reply      │ │ Score ≥ 70      │
│ yesterday       │ │ contact         │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**States:**
```
Loading: Skeleton cards (4 of them, same size)
Error:   "Could not load stats" with retry button
```

---

### COMPONENT: conversion-funnel.tsx

**Job:** Visual pipeline showing booking counts at each status.
Tells the admin at a glance where leads are in the pipeline.

**Props:**
```typescript
interface ConversionFunnelProps {}
```

**Data:**
```typescript
// One query per status — or a single aggregated endpoint in v2
const statuses: BookingStatus[] = [
  'PENDING', 'CONTACTED', 'CONFIRMED', 'COMPLETED'
]
// Fetches count per status
```

**Renders:**
```
"Lead Pipeline"

PENDING      CONTACTED    CONFIRMED    COMPLETED
   12    →      7     →      4     →      2
[━━━━━━]   [━━━━━]     [━━━━]       [━━]
100%         58%          33%          17%
```

**Rules:**
```
- REJECTED not shown — not part of the success funnel
- Width of bar is proportional to PENDING count (100% baseline)
- Clicking a status → navigates to /admin/bookings?status=<status>
- Empty: "No bookings yet" placeholder
```

---

### COMPONENT: bookings-table.tsx

**Job:** Paginated, filterable, sortable table of all bookings.
The primary admin work surface.

**Props:**
```typescript
interface BookingsTableProps {}
// Manages its own filter/pagination state
```

**State:**
```typescript
const [filters, setFilters] = useState<BookingFilters>({
  status: undefined,
  sort:   'created_at',
  order:  'desc',
  page:   1,
  limit:  20,
})
const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

const { data, isLoading, isError } = useBookings(filters)
```

**Renders:**
```
"Bookings"   [PENDING ▾]  [Date ↕]             [Search...]

┌──────┬──────────┬──────────────┬──────────┬──────┬──────────┬─────────┐
│Score │ Name     │ Service      │ Location │ Date │ Status   │ Actions │
├──────┼──────────┼──────────────┼──────────┼──────┼──────────┼─────────┤
│ [85] │ T. Nkosi │ House Plan.  │ Sandton  │ Sep  │ [PENDING]│ [View]  │
│ [72] │ S. Dlamini│ Arch. Draw. │ Pretoria │ Sep  │[CONTACTED]│[View]  │
│ [60] │ R. van.. │ Drafting     │ Midrand  │ Aug  │[CONFIRMED]│[View]  │
└──────┴──────────┴──────────────┴──────────┴──────┴──────────┴─────────┘

  Showing 1–20 of 47    [← Prev]  Page 1 of 3  [Next →]
```

**States:**
```
Loading:  Table skeleton (5 rows of grey bars)
Error:    "Could not load bookings." with retry
Empty:    "No bookings found." with illustration
          If filter active: "No bookings match this filter."
Loaded:   Full table
```

**Rules:**
```
- Lead score badge: green (≥70), yellow (40-69), red (<40)
- Status badge: colour-coded per status (see BookingStatusBadge)
- Clicking "View" → opens BookingDetailModal
- Sort by clicking column headers (Score, Date)
- Filter by status via dropdown
- Pagination: previous/next + current page display
- Mobile: table collapses to card list (each booking is a card)
```

---

### COMPONENT: booking-detail-modal.tsx

**Job:** Full booking details in a modal dialog. Status update.
WhatsApp contact link. All attribution data visible.

**Props:**
```typescript
interface BookingDetailModalProps {
  booking:   Booking | null
  open:      boolean
  onClose:   () => void
  onStatusUpdate: (id: string, status: BookingStatus) => Promise<void>
}
```

**State:**
```typescript
const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(booking?.status)
const [updating, setUpdating] = useState(false)
```

**Renders:**
```
┌──────────────────────────────────────────────────────────────┐
│  Booking Details                                    [✕ Close]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [85] HIGH PRIORITY          [PENDING]                       │
│                                                              │
│  ── VISITOR ──────────────────────────────────────────────── │
│  Thabo Nkosi                                                 │
│  thabo.nkosi@email.co.za                                     │
│  [📞 0781234567 → Open WhatsApp]                             │
│                                                              │
│  ── PROJECT ────────────────────────────────────────────── │
│  Service:   House Planning                                   │
│  Location:  Sandton, Johannesburg                            │
│  Date:      15 October 2024, 10:00                           │
│  Budget:    R500 000 - R800 000                              │
│                                                              │
│  Description:                                                │
│  "I need a 4-bedroom family home designed for a 650sqm       │
│  plot in Sandton. Looking for a modern contemporary style    │
│  with open-plan living areas and a double garage."           │
│                                                              │
│  ── ATTRIBUTION ──────────────────────────────────────────── │
│  Source: google · Medium: cpc · Campaign: jhb_architects     │
│  Referrer: google.co.za                                      │
│                                                              │
│  ── STATUS ───────────────────────────────────────────────── │
│  [CONTACTED ▾]              [Update Status]                  │
│                                                              │
│  Received: 15 Sep 2024, 08:30                                │
│  Consent:  ✓ Given at 08:30                                  │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
```
- Phone number renders as WhatsApp deep link
  href="https://wa.me/27781234567?text=Hello+Thabo..."
  Opens WhatsApp with visitor's name pre-filled in message
- Status dropdown only shows VALID next transitions
  (not all 5 — only what is allowed from current status)
- "Update Status" disabled if selectedStatus === booking.status
- "Update Status" shows spinner while updating
- On update success: modal shows new status, parent table refreshes
- On update error (409): show "This transition is not allowed"
- Attribution section: hidden if all utm_* fields are null
  (direct/organic traffic — no attribution to show)
- Consent indicator: green tick if consent_given = true
```

**WhatsApp Message Pre-fill:**
```typescript
const whatsappMessage = encodeURIComponent(
  `Hello ${booking.name}, this is Xivutiso from Sunduza Architectural. ` +
  `I'm following up on your ${SERVICE_LABELS[booking.service]} enquiry.`
)
const whatsappLink = `https://wa.me/${adminPhone}?text=${whatsappMessage}`
// Note: this opens admin's WhatsApp to message the CLIENT
// The number here is the CLIENT's phone, not the admin's
const clientPhone = booking.phone.replace(/^0/, '27') // SA format conversion
const whatsappLink = `https://wa.me/${clientPhone}?text=${whatsappMessage}`
```

---

### COMPONENT: booking-status-badge.tsx

**Job:** Coloured status pill. Used in table and detail modal.

**Props:**
```typescript
interface BookingStatusBadgeProps {
  status: BookingStatus
}
```

**Renders:**
```
PENDING    → [PENDING]    yellow background
CONTACTED  → [CONTACTED]  blue background
CONFIRMED  → [CONFIRMED]  indigo background
COMPLETED  → [COMPLETED]  green background
REJECTED   → [REJECTED]   red background
```

**Rules:**
```
- Uses shadcn/ui Badge component
- Colour mapping is a const — not computed inline
- Text always uppercase
- No icons — text only for clarity
```

---

### COMPONENT: lead-score-badge.tsx

**Job:** Coloured numeric score badge. Signals lead priority.

**Props:**
```typescript
interface LeadScoreBadgeProps {
  score: number | null
}
```

**Renders:**
```
score >= 70  → [85]  green   — HIGH PRIORITY
score 40-69  → [55]  yellow  — MEDIUM
score < 40   → [25]  red     — LOW
score null   → [--]  grey    — Not scored
```

**Rules:**
```
- Tooltip on hover: "Lead score: 85/100 — High priority"
- Scores influence default sort order in bookings table
```

---

### COMPONENT: projects-manager.tsx

**Job:** Admin project list with add/edit/delete actions.
The admin's portfolio management surface.

**Props:**
```typescript
interface ProjectsManagerProps {}
```

**State:**
```typescript
const [modalState, setModalState] = useState<{
  open:    boolean
  mode:    'create' | 'edit'
  project: Project | null
}>({ open: false, mode: 'create', project: null })

const { data, isLoading } = useProjects()
```

**Renders:**
```
"Projects"          [+ Add New Project]

┌──────────────────────────────────────────────────────────────┐
│ [img] Modern Family Residence — Sandton         [✏️] [🗑️]  │
│       Residential · Sort: 1 · ★ Featured                    │
├──────────────────────────────────────────────────────────────┤
│ [img] Pretoria Mixed-Use Development            [✏️] [🗑️]  │
│       Development · Sort: 2                                  │
├──────────────────────────────────────────────────────────────┤
│ [img] Midrand Office Fitout                     [✏️] [🗑️]  │
│       Commercial · Sort: 3 · ★ Featured                      │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
```
- ✏️ Edit: opens ProjectFormModal in 'edit' mode
- 🗑️ Delete: shows confirmation dialog before calling API
  "Are you sure? This project will be removed from the portfolio."
  [Cancel]  [Delete Project]
- ★ Featured badge: shown if is_featured = true
- Delete confirmation prevents accidental deletion
- After delete: cache invalidated, project disappears from list
```

---

### COMPONENT: project-form-modal.tsx

**Job:** Add or edit a project. Modal form with validation.

**Props:**
```typescript
interface ProjectFormModalProps {
  open:      boolean
  mode:      'create' | 'edit'
  project?:  Project            // Populated in edit mode
  onClose:   () => void
  onSuccess: () => void
}
```

**State:**
```typescript
const form = useForm<CreateProjectInput>({
  resolver:      zodResolver(createProjectSchema),
  defaultValues: mode === 'edit' ? project : undefined,
})
```

**Renders:**
```
┌─────────────────────────────────────────┐
│  Add New Project               [✕ Close]│
├─────────────────────────────────────────┤
│                                         │
│  Project Title *                        │
│  [_____________________________________]│
│                                         │
│  Description *                          │
│  [_____________________________________]│
│  [_____________________________________]│
│                                         │
│  Image Path *                           │
│  [/images/projects/filename.webp       ]│
│  Must be a file in /public/images/      │
│                                         │
│  Category               Sort Order      │
│  [Residential       ]   [1           ]  │
│                                         │
│  ☑ Show on homepage (Featured)          │
│                                         │
│              [Cancel]  [Save Project →] │
└─────────────────────────────────────────┘
```

**Rules:**
```
- Title changes modal header: "Add New Project" vs "Edit Project"
- image_path field: helper text explains valid format
- Sort order: integer input, minimum 0
- is_featured: checkbox — max 3 featured projects enforced in UI
  (warn if trying to feature a 4th, still allow it)
- Save button: disabled while submitting, shows spinner
- On success: onSuccess() called → cache invalidated → modal closes
```

---

### COMPONENT: messages-table.tsx

**Job:** Admin inbox for contact messages. Read/unread tracking.

**Props:**
```typescript
interface MessagesTableProps {}
```

**State:**
```typescript
const [filter, setFilter] = useState<'all' | 'unread'>('unread')
const { data, isLoading } = useMessages({
  read:  filter === 'unread' ? false : undefined,
})
```

**Renders:**
```
"Messages"     [All]  [Unread (2)]

┌──────────────────────────────────────────────────────────────┐
│ ● Sipho Dlamini      Sep 15    Drafting services query...    │
│   sipho@email.co.za                              [View] [🗑️]│
├──────────────────────────────────────────────────────────────┤
│   Zanele Mokoena     Sep 12    General enquiry about...      │
│   zanele@email.co.za                             [View] [🗑️]│
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
```
- Unread messages: bold name, filled circle indicator (●)
- Read messages: normal weight, empty circle (○)
- "View" opens a detail panel/modal showing full message
- Viewing a message automatically calls PATCH to mark as read
- After marking read: unread badge in sidebar decrements
- Delete: soft delete with confirmation dialog
- Message preview: first 60 characters of message text
```

---

### COMPONENT: settings-form.tsx

**Job:** Edit all runtime site settings in one form.
Admin changes WhatsApp number, email, tagline — no deployment.

**Props:**
```typescript
interface SettingsFormProps {}
```

**Data:**
```typescript
const { data: settings } = useSettings()
// Returns { whatsapp_number, contact_email, business_phone,
//           business_address, hero_tagline, years_experience,
//           projects_completed }
```

**Renders:**
```
"Site Settings"

WhatsApp Number *              Contact Email *
[27867233640               ]  [admin@gmail.com            ]
Format: country code + number  Your public contact email

Business Phone                 Business Address
[0867233640                ]  [South Africa               ]

Hero Tagline
[Designing Spaces That Inspire                             ]
Shown in the homepage hero section. Keep under 6 words.

Years of Experience            Projects Completed
[5                         ]  [30                         ]
Shown in the stats bar         Shown in the stats bar

                               [Save All Settings →]
```

**Rules:**
```
- All fields pre-populated from useSettings() hook
- Save updates each changed field individually via PATCH
  (only sends changed values — not the whole form)
- On success: "Settings saved" toast, cache invalidated
- Validation: WhatsApp number format checked client-side
- No page reload required — settings update live in frontend cache
- WhatsApp floating button immediately reflects new number
```

---
---

## SECTION 7 — SEO COMPONENTS

---

### COMPONENT: page-metadata.tsx

**Job:** Dynamic metadata per page for SEO.
Implemented as a Next.js metadata export, not a rendered component.

```typescript
// Used as generateMetadata() in each page.tsx

const PAGE_METADATA = {
  home: {
    title:       'Sunduza Architectural & Projects | House Planning South Africa',
    description: 'Professional architectural services in South Africa. House planning, architectural drawings, drafting services, and development project planning. Book a consultation today.',
    keywords:    'architect south africa, house plans, architectural drawings, building plans',
  },
  services: {
    title:       'Architectural Services | Sunduza Architectural',
    description: 'House planning, architectural drawings, drafting services, and development project planning. 5+ years experience across South Africa.',
  },
  projects: {
    title:       'Portfolio | Sunduza Architectural Projects',
    description: 'Browse our portfolio of completed architectural projects — residential, commercial, and development across South Africa.',
  },
  booking: {
    title:       'Book a Consultation | Sunduza Architectural',
    description: 'Request a free architectural consultation. Fill in your project details and we will be in touch within 24 hours.',
  },
  contact: {
    title:       'Contact Us | Sunduza Architectural',
    description: 'Get in touch with Sunduza Architectural. Call, email, or send us a message about your project.',
  },
}
```

---

### COMPONENT: local-business-schema.tsx

**Job:** JSON-LD structured data for Google local business schema.
Helps Google show the business in local search and Maps results.

```typescript
// Injected into <head> on every public page

const schema = {
  '@context':   'https://schema.org',
  '@type':      'ProfessionalService',
  name:         'Sunduza Architectural & Projects',
  description:  'Professional architectural services in South Africa',
  url:          'https://sunduza.vercel.app',
  telephone:    settings.business_phone,
  email:        settings.contact_email,
  address: {
    '@type':         'PostalAddress',
    addressCountry:  'ZA',
    addressLocality: settings.business_address,
  },
  priceRange:     '$$',
  openingHours:   'Mo-Fr 08:00-17:00',
  sameAs: [
    'https://wa.me/27867233640',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name:    'Architectural Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'House Planning' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Architectural Drawings' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Drafting Services' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Development Project Planning' } },
    ]
  }
}
```

---
---

## COMPONENT SUMMARY

```
─────────────────────────────────────────────────────────────────
TOTAL COMPONENTS:         32
Layout:                    4  (navbar, footer, whatsapp-button,
                               admin-sidebar)
Homepage:                  6  (hero, services-preview,
                               portfolio-preview, testimonials,
                               stats-bar, cta-section)
Booking:                   2  (booking-form, booking-success)
Contact:                   2  (contact-form, contact-info)
Projects:                  3  (project-card, project-grid,
                               project-filter)
Admin:                    11  (dashboard-stats, conversion-funnel,
                               bookings-table, booking-detail-modal,
                               booking-status-badge, lead-score-badge,
                               projects-manager, project-form-modal,
                               messages-table, settings-form)
SEO:                       2  (page-metadata, local-business-schema)
UI primitives (shadcn):    9  (button, card, input, textarea,
                               select, dialog, table, badge,
                               skeleton, toast)
─────────────────────────────────────────────────────────────────
Every component: loading state ✓
Every component: error state   ✓
Every component: empty state   ✓
Every component: typed props   ✓
─────────────────────────────────────────────────────────────────
```

---

*Component Architecture Complete*
*Status: All 32 components specified · Props typed · States defined*
*GA4 events mapped · Rules documented*
*Next: Sprint 1 Build — Foundation code, actual implementation begins*
