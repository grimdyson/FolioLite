# FolioLite

A free, lightweight, one-page portfolio built with Next.js, TypeScript, and Tailwind CSS. No CMS, no subscriptions — just edit a few content files, push, and you're live.

![MIT License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Single page, section-based layout** — Hero, About, Experience, Education, Contact, and Open Source sections
- **Four adaptive themes** — lighter, light, dark, darker — with a slider in the sticky nav
- **Time-based auto-theming** — theme picks itself based on your local sunrise/sunset on first visit
- **Scroll-reveal animations** — subtle fade + slide inspired by linear.app, with `prefers-reduced-motion` support
- **Sticky navigation** — pills-style nav with a sliding indicator, responsive for mobile and desktop
- **Accessibility out of the box** — skip-to-content link, semantic landmarks, descriptive alt text, focus states, aria labels
- **SEO ready** — Open Graph / Twitter Card meta, robots.txt, sitemap.xml, canonical URL, favicons + web manifest
- **Zero runtime dependencies** beyond Next.js, React, and Tailwind

## Quick Start

```bash
git clone https://github.com/grimdyson/FolioLite.git
cd portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

All content lives in plain TypeScript objects — no CMS, no markdown:

| File | What it controls |
|------|-----------------|
| `content/profile.ts` | Tagline, headline, intro, about paragraphs |
| `content/work.ts` | Experience entries + education |
| `content/contact.ts` | Contact links + open source CTA |

Update the data, and the page updates. You shouldn't need to touch layout code.

## Project Structure

```
app/
  layout.tsx          — Root layout, fonts, metadata, theme init script
  page.tsx            — All page sections
  globals.css         — Theme tokens, typography utilities
  robots.ts           — Crawler rules
  sitemap.ts          — Sitemap generation
  favicon.ico         — Browser tab icon
  apple-icon.png      — iOS home screen icon
components/
  StickyChips.tsx     — Sticky nav with pill indicator + theme toolbar
  ThemeToolbar.tsx     — Theme slider (compact, in nav bar)
  ThemeSwitcher.tsx    — Theme slider (standalone, full-width)
  Reveal.tsx          — Scroll-reveal animation wrapper
  Section.tsx         — Section layout with label + border
  Button.tsx          — Styled anchor button
content/              — All page content as TS objects
public/
  illustrations/      — SVG + PNG illustrations
  og-image.png        — Open Graph preview image
  icon-192.png        — PWA icon
  icon-512.png        — PWA icon
  site.webmanifest    — Web app manifest
```

## Theming

Four themes controlled by CSS custom properties on `data-theme`:

- **lighter** — warm off-white
- **light** — neutral light
- **dark** — dark zinc
- **darker** — near-black

On first load, an inline blocking script estimates your local sunrise/sunset and picks a theme. Users can override manually via the slider — the choice persists in localStorage.

Token values live in `app/globals.css` under each `[data-theme="..."]` block.

## Deploy

Built for free-tier Vercel:

```bash
npm run build   # static export, no server needed
```

Push to GitHub, connect to [Vercel](https://vercel.com), and you're live. Update the domain in `app/layout.tsx` (`metadataBase`), `app/robots.ts`, and `app/sitemap.ts` to match yours.

## License

MIT. Attribution appreciated but not required.
