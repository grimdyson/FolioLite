import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Roboto, Roboto_Mono } from "next/font/google";
import StickyChips from "@/components/StickyChips";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://timdyson.com"),
  title: "Tim Dyson — Designer & Design Engineer",
  description:
    "Portfolio of Tim Dyson — 10+ years in product design, design systems, and design engineering. Available for consulting.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tim Dyson — Designer & Design Engineer",
    description:
      "Portfolio of Tim Dyson — 10+ years in product design, design systems, and design engineering.",
    url: "/",
    siteName: "Tim Dyson",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Tim Dyson portfolio" }],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tim Dyson — Designer & Design Engineer",
    description:
      "Portfolio of Tim Dyson — 10+ years in product design, design systems, and design engineering.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
};

// Inline script that runs synchronously before paint to pick the correct theme
// based on the user's local time (or their stored manual choice).
// Mirrors the autoThemeForTime logic in ThemeToolbar but keeps it dependency-free.
const themeInitScript = `(function(){
  try {
    var stored = localStorage.getItem("portfolio-theme");
    var manual = localStorage.getItem("portfolio-theme-manual") === "true";
    var bgMap = { lighter: "#ffffff", light: "#d4d4d8", dark: "#27272a", darker: "#18181b" };
    if (stored && manual) {
      document.documentElement.dataset.theme = stored;
      var m2 = document.querySelector('meta[name="theme-color"]');
      if (m2) m2.setAttribute("content", bgMap[stored] || "#d4d4d8");
      return;
    }
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var t = h + m / 60;

    // Estimate sunrise/sunset from timezone offset (rough lat ~34)
    var offset = now.getTimezoneOffset() / -60;
    var lng = offset * 15;
    var lat = 34;
    var toRad = function(d){ return d * Math.PI / 180; };
    var toDeg = function(r){ return r * 180 / Math.PI; };
    var doy = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000);
    var decl = toRad(23.45 * Math.sin(toRad(360 / 365 * (doy - 81))));
    var cosH = -Math.tan(toRad(lat)) * Math.tan(decl);
    cosH = Math.max(-1, Math.min(1, cosH));
    var ha = toDeg(Math.acos(cosH));
    var noon = 12 - lng / 15 + offset;
    var sr = noon - ha / 15;
    var ss = noon + ha / 15;

    var theme = "light";
    if (t >= 21 || t < 4) theme = "darker";
    else if (t >= 4 && t < sr) theme = "dark";
    else if (t >= sr && t < (sr + ss) / 2) {
      theme = ((t - sr) / ((sr + ss) / 2 - sr)) > 0.5 ? "lighter" : "light";
    } else if (t >= (sr + ss) / 2 && t < ss) {
      theme = ((t - (sr + ss) / 2) / (ss - (sr + ss) / 2)) > 0.5 ? "light" : "lighter";
    } else if (t >= ss && t < 21) theme = "dark";

    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);

    // Sync theme-color meta tag with active theme
    var bgMap = { lighter: "#ffffff", light: "#d4d4d8", dark: "#27272a", darker: "#18181b" };
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", bgMap[theme] || "#d4d4d8");
  } catch(e) {}
})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${roboto.variable} ${robotoMono.variable}`}
    >
      <head>
        <meta name="theme-color" content="#d4d4d8" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Tim Dyson",
              url: "https://timdyson.com",
              jobTitle: "Designer & Design Engineer",
              description:
                "10+ years in product design, design systems, and design engineering. Available for consulting.",
              email: "mailto:hello@timdyson.com",
              sameAs: [
                "https://www.linkedin.com/in/timdyson/",
                "https://github.com/grimdyson",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-text focus:px-4 focus:py-2 focus:rounded-full focus:text-16 focus:font-body"
          style={{ color: "rgb(var(--chip-active-text))" }}
        >
          Skip to content
        </a>
        <StickyChips />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
