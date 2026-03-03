# FolioLite — AI Setup Instructions

> **Purpose of this file:** Give this document to your AI assistant (Copilot, Cursor, Claude, ChatGPT, etc.) so it can walk you through personalising every piece of content in FolioLite after you've cloned the repo. Copy-paste it into a chat, or point your agent at this file.

---

## How this project is structured

FolioLite is a single-page Next.js (App Router) portfolio. **All user-facing content lives in three TypeScript files** inside `content/`. The layout, metadata, SEO, and structured data live in a handful of files inside `app/` and `public/`. There is no CMS — you edit plain objects and push.

```
content/
  profile.ts      ← name, tagline, headline, intro, about paragraphs
  work.ts         ← work experience entries + education entries
  contact.ts      ← email, social links, open-source blurb + CTA

app/
  layout.tsx      ← site metadata, Open Graph, Twitter Card, JSON-LD, fonts
  robots.ts       ← robots.txt (contains your domain)
  sitemap.ts      ← sitemap.xml (contains your domain)
  page.tsx         ← page layout (rarely needs editing for content)
  globals.css     ← theme tokens and typography (cosmetic tweaks only)

public/
  site.webmanifest ← PWA manifest (site name)
  og-image.png     ← Open Graph / social share image (1200×630)
  favicon.ico      ← 32×32 favicon
  icon-192.png     ← 192×192 app icon
  icon-512.png     ← 512×512 app icon
  apple-icon.png   ← Apple touch icon
  illustrations/   ← SVG/PNG illustrations shown on the page
```

---

## Step-by-step personalisation checklist

Work through each step in order. Every field that needs changing is listed with its exact file path and key name.

### 1. `content/profile.ts`

| Field | What it controls | Example value to replace |
|-------|-----------------|------------------------|
| `name` | Used nowhere in rendered HTML directly, but good to keep accurate | `"Tim"` |
| `tagline` | Bold uppercase line above the hero heading | `"Design systems, product design…"` |
| `headline` | Large display heading in the hero | `"Hi, I'm Tim."` |
| `intro` | Display body text below the headline | `"I'm a designer with 10+ years…"` |
| `about` | Array of paragraph strings in the About section | Three paragraphs — rewrite with your own background |

### 2. `content/work.ts`

**Work entries** — `work` array. Each entry has:
| Field | Notes |
|-------|-------|
| `role` | Job title |
| `company` | Company name |
| `period` | Date range string, e.g. `"2025 - Present"` |
| `description` | One-paragraph summary of the role |

Add, remove, or reorder entries as needed. The type is `WorkEntry[]`.

**Education entries** — `education` array. Each entry has:
| Field | Notes |
|-------|-------|
| `institution` | School / university name |
| `period` | Date range |
| `qualification` | Degree or certification title |

### 3. `content/contact.ts`

**`contact` object:**
| Field | What to change |
|-------|---------------|
| `email` | Your email address |
| `links` | Array of `{ label, url }` — update Email mailto, LinkedIn URL, GitHub URL. Add or remove links as needed. |

**`openSource` object** (the FolioLite promo section at the bottom):
| Field | What to change |
|-------|---------------|
| `heading` | Section heading |
| `body` | Array of paragraph strings |
| `cta.label` | Button label |
| `cta.url` | Button URL |

> **Tip:** If you don't want the open-source section, you can remove the `{/* ── Open Source */}` block from `app/page.tsx` entirely.

### 4. `app/layout.tsx` — Metadata, SEO, and structured data

This is the most important file for SEO. Update every field below.

**`metadataBase`** (line ~29):
```ts
metadataBase: new URL("https://yourdomain.com"),
```

**`title`**:
```ts
title: "Your Name — Your Title",
```

**`description`**:
```ts
description: "Portfolio of Your Name — short summary.",
```

**`openGraph`** object:
| Field | Update to |
|-------|----------|
| `title` | Same as `title` above |
| `description` | Same or slightly shorter |
| `siteName` | Your name or brand |
| `images[0].alt` | Descriptive alt text for your OG image |
| `locale` | Your locale, e.g. `"en_US"`, `"en_AU"`, `"en_GB"` |

**`twitter`** object:
| Field | Update to |
|-------|----------|
| `title` | Same as above |
| `description` | Same as above |

**JSON-LD structured data** (the `<script type="application/ld+json">` block near the bottom of `layout.tsx`):
| Field | Update to |
|-------|----------|
| `name` | Your full name |
| `url` | `"https://yourdomain.com"` |
| `jobTitle` | Your job title |
| `description` | Short professional summary |
| `email` | `"mailto:you@yourdomain.com"` |
| `sameAs` | Array of your social profile URLs |

### 5. `app/robots.ts`

Update the sitemap URL:
```ts
sitemap: "https://yourdomain.com/sitemap.xml",
```

### 6. `app/sitemap.ts`

Update the site URL:
```ts
url: "https://yourdomain.com",
```

### 7. `public/site.webmanifest`

Update:
```json
"name": "Your Name — Portfolio",
"short_name": "Portfolio",
```

### 8. `public/` — Static assets

Replace these files with your own:

| File | Size / format | Purpose |
|------|---------------|---------|
| `og-image.png` | 1200×630 PNG | Social share preview image |
| `favicon.ico` | 32×32 ICO | Browser tab icon |
| `icon-192.png` | 192×192 PNG | PWA / Android icon |
| `icon-512.png` | 512×512 PNG | PWA / Android splash |
| `apple-icon.png` | 180×180 PNG | iOS home screen icon |
| `illustrations/` | SVG or PNG | About section and Contact section images |

The page currently references `illustrations/v60.svg` (About section) and `illustrations/Banan.svg` (Contact section). To change these, either replace the files in-place or update the `src` paths in `app/page.tsx`.

### 9. Footer copyright

In `app/page.tsx`, near the bottom, update the copyright text:
```tsx
<p>© {new Date().getFullYear()} yourdomain.com</p>
```

### 10. Deployment — Vercel

1. Push your repo to GitHub.
2. Import it in [Vercel](https://vercel.com) (free tier works).
3. In **Project Settings → Domains**, add your custom domain.
4. Set it as the **Primary domain** so the `.vercel.app` URL auto-redirects.
5. On your GitHub repo page, click the gear icon next to **About** and set the **Website** field to your domain.

---

## Quick-start prompt for your AI

Copy and paste this into your AI assistant to kick off the process:

```
I just cloned FolioLite (https://github.com/grimdyson/FolioLite).
Read SETUP.md in the repo root, then walk me through each step
to personalise it with my details. Ask me for my info one section
at a time (profile, work history, contact, domain) and make the
edits directly. Once content is done, remind me about replacing
static assets and deploying.
```

---

## Notes

- **Fonts:** The site uses Manrope (display), Roboto (body), and Roboto Mono (mono/tagline), loaded via `next/font/google` in `layout.tsx`. To change fonts, update the imports and CSS variables there.
- **Themes:** FolioLite ships with four time-of-day themes (`lighter`, `light`, `dark`, `darker`). The theme logic lives in the inline script in `layout.tsx` and in `components/ThemeToolbar.tsx`. No changes needed unless you want to customise the palette — edit the CSS custom properties in `app/globals.css`.
- **Analytics:** Vercel Analytics is included via `@vercel/analytics`. It works automatically on Vercel. Remove the `<Analytics />` component in `layout.tsx` if you don't want it.
