"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";

type ThemeId = "lighter" | "light" | "dark" | "darker";

const themeOptions: { id: ThemeId; label: string }[] = [
  { id: "darker", label: "Darker" },
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "lighter", label: "Lighter" },
];

const fallbackTheme: ThemeId = "light";

function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

/* ── Sunrise / sunset calculation ─────────────────────────── */
// Simplified solar calculation — returns { sunrise, sunset } in fractional hours (local time)
function calcSunTimes(lat: number, lng: number, date: Date): { sunrise: number; sunset: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const dayOfYear =
    Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
    );

  // Solar declination (simplified)
  const declination = toRad(23.45 * Math.sin(toRad((360 / 365) * (dayOfYear - 81))));
  const latRad = toRad(lat);

  // Hour angle
  const cosH = -Math.tan(latRad) * Math.tan(declination);
  // Clamp for polar regions where sun never sets/rises
  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  const hourAngle = toDeg(Math.acos(clampedCosH));

  // Solar noon (approximate) — offset by longitude
  const tzOffset = date.getTimezoneOffset() / -60;
  const solarNoon = 12 - lng / 15 + tzOffset;

  const sunrise = solarNoon - hourAngle / 15;
  const sunset = solarNoon + hourAngle / 15;

  return { sunrise, sunset };
}

/* ── Determine auto theme from hour and sun times ────────── */
function autoThemeForTime(
  hour: number,
  minute: number,
  sunriseH: number,
  sunsetH: number,
): ThemeId {
  const t = hour + minute / 60;

  // 9pm (21:00) → 4am: darker
  if (t >= 21 || t < 4) return "darker";

  // 4am → sunrise: dark (pre-dawn)
  if (t >= 4 && t < sunriseH) return "dark";

  // sunrise → midpoint between sunrise and sunset: light → lighter
  const midday = (sunriseH + sunsetH) / 2;
  if (t >= sunriseH && t < midday) {
    // Transition from light to lighter over the morning
    const progress = (t - sunriseH) / (midday - sunriseH);
    return progress > 0.5 ? "lighter" : "light";
  }

  // midpoint → sunset: lighter → light
  if (t >= midday && t < sunsetH) {
    const progress = (t - midday) / (sunsetH - midday);
    return progress > 0.5 ? "light" : "lighter";
  }

  // sunset → 9pm: dark
  if (t >= sunsetH && t < 21) return "dark";

  return "light";
}

/* ── Extract city name from timezone ─────────────────────── */
const cityAcronyms: Record<string, string> = {
  Sydney: "SYD",
  Melbourne: "MEL",
  Brisbane: "BNE",
  Perth: "PER",
  Adelaide: "ADL",
  Hobart: "HBA",
  Darwin: "DRW",
  Canberra: "CBR",
  New_York: "NYC",
  Los_Angeles: "LAX",
  Chicago: "CHI",
  San_Francisco: "SFO",
  Denver: "DEN",
  Phoenix: "PHX",
  Dallas: "DFW",
  Houston: "HOU",
  Miami: "MIA",
  Atlanta: "ATL",
  Seattle: "SEA",
  Boston: "BOS",
  Detroit: "DTW",
  Minneapolis: "MSP",
  London: "LDN",
  Paris: "PAR",
  Berlin: "BER",
  Amsterdam: "AMS",
  Tokyo: "TYO",
  Shanghai: "SHA",
  Hong_Kong: "HKG",
  Singapore: "SIN",
  Dubai: "DXB",
  Mumbai: "BOM",
  Delhi: "DEL",
  Toronto: "YYZ",
  Vancouver: "YVR",
  Auckland: "AKL",
  Wellington: "WLG",
  Sao_Paulo: "GRU",
  Buenos_Aires: "BUE",
  Mexico_City: "MEX",
  Johannesburg: "JNB",
  Cairo: "CAI",
  Istanbul: "IST",
  Moscow: "MOW",
  Seoul: "ICN",
  Bangkok: "BKK",
  Jakarta: "JKT",
  Kolkata: "CCU",
  Lagos: "LOS",
  Nairobi: "NBO",
  Lima: "LIM",
  Bogota: "BOG",
  Santiago: "SCL",
  Zurich: "ZRH",
  Vienna: "VIE",
  Warsaw: "WAW",
  Prague: "PRG",
  Dublin: "DUB",
  Lisbon: "LIS",
  Rome: "ROM",
  Madrid: "MAD",
  Stockholm: "STO",
  Oslo: "OSL",
  Helsinki: "HEL",
  Copenhagen: "CPH",
  Taipei: "TPE",
  Kuala_Lumpur: "KUL",
  Manila: "MNL",
};

function cityFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g. "Australia/Sydney"
    const rawCity = tz.split("/").pop() ?? "";
    if (cityAcronyms[rawCity]) return cityAcronyms[rawCity];
    // Fallback: uppercase first 3 letters
    const name = rawCity.replace(/_/g, " ");
    return name.slice(0, 3).toUpperCase();
  } catch {
    return "";
  }
}

/** Compact theme toolbar for the sticky header. */
export default function ThemeToolbar({ compact = false }: { compact?: boolean } = {}) {
  const [theme, setTheme] = useState<ThemeId>(fallbackTheme);
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [sunTimes, setSunTimes] = useState<{ sunrise: number; sunset: number }>({
    sunrise: 6,
    sunset: 18,
  });
  const [isManual, setIsManual] = useState(false);

  /* ── Detect user's city + coordinates ──────────────────── */
  useEffect(() => {
    setCity(cityFromTimezone());

    // Try to get real lat/lng for accurate sunrise/sunset
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const times = calcSunTimes(
            pos.coords.latitude,
            pos.coords.longitude,
            new Date(),
          );
          setSunTimes(times);
        },
        () => {
          // Denied or unavailable — estimate from timezone offset
          // Use rough lat ~34 (temperate) and derive lng from offset
          const offset = new Date().getTimezoneOffset() / -60;
          const estLng = offset * 15;
          const times = calcSunTimes(34, estLng, new Date());
          setSunTimes(times);
        },
        { timeout: 5000 },
      );
    }
  }, []);

  const sunTimesRef = useRef(sunTimes);
  sunTimesRef.current = sunTimes;

  const skipNextPersist = useRef(true);

  /* ── Auto-pick theme on mount (unless user has manually chosen) */
  useLayoutEffect(() => {
    const stored = window.localStorage.getItem("portfolio-theme") as ThemeId | null;
    const wasManual = window.localStorage.getItem("portfolio-theme-manual") === "true";

    if (stored && wasManual) {
      setIsManual(true);
      setTheme(stored);
      applyTheme(stored);
    } else {
      // Read what the inline init script already applied so we stay in sync
      const preApplied = document.documentElement.dataset.theme as ThemeId | undefined;
      if (preApplied && ["lighter", "light", "dark", "darker"].includes(preApplied)) {
        setTheme(preApplied);
      } else {
        const now = new Date();
        const auto = autoThemeForTime(now.getHours(), now.getMinutes(), sunTimesRef.current.sunrise, sunTimesRef.current.sunset);
        setTheme(auto);
        applyTheme(auto);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Persist + apply (skip the first two calls: initial render + init setState) */
  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    window.localStorage.setItem("portfolio-theme", theme);
    applyTheme(theme);
  }, [theme]);

  /* ── Local clock ───────────────────────────────────────── */
  useEffect(() => {
    const tick = () => {
      const now = new Date().toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setTime(now);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const activeIndex = useMemo(
    () => themeOptions.findIndex((o) => o.id === theme),
    [theme],
  );

  const activeLabel = `${themeOptions[activeIndex]?.label ?? ""} Theme`;

  /* ── Helper: get current auto theme ─────────────────────── */
  const getCurrentAutoTheme = useCallback(() => {
    const now = new Date();
    return autoThemeForTime(now.getHours(), now.getMinutes(), sunTimes.sunrise, sunTimes.sunset);
  }, [sunTimes]);

  /* ── Helper: set theme, auto-clear manual if it matches auto */
  const applyManualTheme = useCallback((next: ThemeId) => {
    const auto = getCurrentAutoTheme();
    if (next === auto) {
      setIsManual(false);
      window.localStorage.removeItem("portfolio-theme-manual");
    } else {
      setIsManual(true);
      window.localStorage.setItem("portfolio-theme-manual", "true");
    }
    setTheme(next);
  }, [getCurrentAutoTheme]);

  /* ── Mark manual when user interacts ───────────────────── */
  const setManualTheme = useCallback((next: ThemeId) => {
    applyManualTheme(next);
  }, [applyManualTheme]);

  const stepDarker = () => {
    setTheme((prev) => {
      const idx = themeOptions.findIndex((o) => o.id === prev);
      const next = themeOptions[idx - 1]?.id ?? prev;
      const auto = getCurrentAutoTheme();
      if (next === auto) {
        setIsManual(false);
        window.localStorage.removeItem("portfolio-theme-manual");
      } else {
        setIsManual(true);
        window.localStorage.setItem("portfolio-theme-manual", "true");
      }
      return next;
    });
  };

  const stepBrighter = () => {
    setTheme((prev) => {
      const idx = themeOptions.findIndex((o) => o.id === prev);
      const next = themeOptions[idx + 1]?.id ?? prev;
      const auto = getCurrentAutoTheme();
      if (next === auto) {
        setIsManual(false);
        window.localStorage.removeItem("portfolio-theme-manual");
      } else {
        setIsManual(true);
        window.localStorage.setItem("portfolio-theme-manual", "true");
      }
      return next;
    });
  };

  const resetToAuto = () => {
    setIsManual(false);
    window.localStorage.removeItem("portfolio-theme-manual");
    const auto = getCurrentAutoTheme();
    setTheme(auto);
  };

  /* ── Shared: Slider pill ─────────────────────────────────── */
  const sliderPill = (fixedWidth?: boolean) => (
    <div
      className={`flex items-center ${fixedWidth ? "shrink-0" : ""}`}
      style={{
        height: 48,
        gap: 24,
        paddingLeft: 24,
        paddingRight: 32,
        paddingTop: 4,
        paddingBottom: 4,
        borderRadius: 9999,
        backgroundColor: "rgb(var(--text) / 0.08)",
        ...(fixedWidth ? { width: 316 } : {}),
      }}
    >
      {/* Moon / Sun icon */}
      {theme === "dark" || theme === "darker" ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="shrink-0"
          style={{ color: "rgb(var(--text))" }}
        >
          <path d="M11.7118 3.4497C11.8895 3.21255 11.9109 2.89301 11.7664 2.63429C11.6219 2.37557 11.3386 2.22619 11.0435 2.25309C5.62982 2.74666 2.60789 7.00461 2.28018 11.3577C1.95186 15.7191 4.31668 20.3328 9.73144 21.524C15.4167 22.7746 21.2026 18.6874 21.7467 12.878C21.7743 12.5843 21.6271 12.3019 21.3708 12.1561C21.1144 12.0103 20.7964 12.0283 20.5581 12.202C17.7211 14.2709 14.4772 13.5176 12.4219 11.4779C10.3676 9.43932 9.62171 6.23935 11.7118 3.4497Z" />
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="shrink-0"
          style={{ color: "rgb(var(--text))" }}
        >
          <path d="M12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V5C12.75 5.41421 12.4142 5.75 12 5.75C11.5858 5.75 11.25 5.41421 11.25 5V3C11.25 2.58579 11.5858 2.25 12 2.25Z" />
          <path d="M12 18.2539C12.4142 18.2539 12.75 18.5897 12.75 19.0039V21.0039C12.75 21.4181 12.4142 21.7539 12 21.7539C11.5858 21.7539 11.25 21.4181 11.25 21.0039V19.0039C11.25 18.5897 11.5858 18.2539 12 18.2539Z" />
          <path d="M2.24994 12C2.24994 11.5858 2.58573 11.25 2.99994 11.25H4.99994C5.41415 11.25 5.74994 11.5858 5.74994 12C5.74994 12.4142 5.41415 12.75 4.99994 12.75H2.99994C2.58573 12.75 2.24994 12.4142 2.24994 12Z" />
          <path d="M18.25 12C18.25 11.5858 18.5858 11.25 19 11.25H21C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75H19C18.5858 12.75 18.25 12.4142 18.25 12Z" />
          <path d="M19.5303 4.46967C19.8232 4.76256 19.8232 5.23744 19.5303 5.53033L17.5303 7.53033C17.2374 7.82322 16.7625 7.82322 16.4696 7.53033C16.1767 7.23744 16.1767 6.76256 16.4696 6.46967L18.4696 4.46967C18.7625 4.17678 19.2374 4.17678 19.5303 4.46967Z" />
          <path d="M4.46961 4.46967C4.7625 4.17678 5.23738 4.17678 5.53027 4.46967L7.53027 6.46967C7.82316 6.76256 7.82316 7.23744 7.53027 7.53033C7.23738 7.82322 6.7625 7.82322 6.46961 7.53033L4.46961 5.53033C4.17672 5.23744 4.17672 4.76256 4.46961 4.46967Z" />
          <path d="M7.53017 16.4698C7.82306 16.7627 7.82306 17.2375 7.53017 17.5304L5.53017 19.5304C5.23728 19.8233 4.7624 19.8233 4.46951 19.5304C4.17662 19.2375 4.17662 18.7627 4.46951 18.4698L6.46951 16.4698C6.7624 16.1769 7.23728 16.1769 7.53017 16.4698Z" />
          <path d="M16.4699 16.4696C16.7628 16.1768 17.2377 16.1768 17.5305 16.4697L19.5303 18.4698C19.8232 18.7627 19.8232 19.2375 19.5303 19.5304C19.2374 19.8233 18.7625 19.8233 18.4696 19.5303L16.4698 17.5303C16.1769 17.2374 16.177 16.7625 16.4699 16.4696Z" />
          <path d="M12 7.25C9.37664 7.25 7.24999 9.37665 7.24999 12C7.24999 14.6234 9.37664 16.75 12 16.75C14.6233 16.75 16.75 14.6234 16.75 12C16.75 9.37665 14.6233 7.25 12 7.25Z" />
        </svg>
      )}

      {/* Slider */}
      <input
        aria-label="Theme slider"
        type="range"
        min={0}
        max={themeOptions.length - 1}
        step={1}
        value={activeIndex}
        onChange={(e) => {
          const next =
            themeOptions[Number(e.target.value)]?.id ?? fallbackTheme;
          setManualTheme(next);
        }}
        className="theme-slider h-1 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, rgb(var(--text)) ${(activeIndex / (themeOptions.length - 1)) * 100}%, rgb(var(--text) / 0.2) ${(activeIndex / (themeOptions.length - 1)) * 100}%)`,
        }}
      />
    </div>
  );

  /* ── Shared: Sunset button (step darker) ───────────────── */
  const sunsetBtn = (
    <button
      type="button"
      aria-label="Step darker"
      onClick={stepDarker}
      className="flex shrink-0 items-start justify-center border-none bg-transparent p-0 cursor-pointer"
      style={{
        width: 48,
        height: 48,
        paddingTop: 10,
        borderRadius: 9999,
        backgroundColor: "rgb(var(--text) / 0.08)",
        opacity: activeIndex > 0 ? 1 : 0.3,
        transition: "opacity 200ms ease",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color: "rgb(var(--text))" }}
      >
        <path d="M23 21C23.5523 21 24 21.4477 24 22C24 22.5523 23.5523 23 23 23H1C0.447715 23 0 22.5523 0 22C0 21.4477 0.447715 21 1 21H23ZM3 17C3.55228 17 4 17.4477 4 18C4 18.5523 3.55228 19 3 19H1C0.447715 19 0 18.5523 0 18C0 17.4477 0.447715 17 1 17H3ZM12 12C13.5913 12 15.117 12.6326 16.2422 13.7578C17.3674 14.883 18 16.4087 18 18C18 18.5523 17.5523 19 17 19H7C6.73478 19 6.48051 18.8946 6.29297 18.707C6.10543 18.5195 6 18.2652 6 18C6 16.4087 6.63259 14.883 7.75781 13.7578C8.88303 12.6326 10.4087 12 12 12ZM23 17C23.5523 17 24 17.4477 24 18C24 18.5523 23.5523 19 23 19H21C20.4477 19 20 18.5523 20 18C20 17.4477 20.4477 17 21 17H23ZM3.5127 9.5127C3.90313 9.12227 4.53622 9.12244 4.92676 9.5127L6.34668 10.9326C6.7372 11.3231 6.73719 11.9562 6.34668 12.3467C5.95616 12.7372 5.32314 12.7372 4.93262 12.3467L3.5127 10.9268C3.12243 10.5362 3.12226 9.90313 3.5127 9.5127ZM19.0732 9.5127C19.4638 9.1225 20.0969 9.12232 20.4873 9.5127C20.8777 9.90312 20.8775 10.5362 20.4873 10.9268L19.0674 12.3467C18.6769 12.7372 18.0438 12.7372 17.6533 12.3467C17.2628 11.9562 17.2628 11.3231 17.6533 10.9326L19.0732 9.5127ZM12 1C12.5523 1 13 1.44772 13 2V6.58594L15.293 4.29297C15.6835 3.90244 16.3165 3.90244 16.707 4.29297C17.0976 4.68349 17.0976 5.31651 16.707 5.70703L12.707 9.70703C12.3409 10.0731 11.7619 10.0957 11.3691 9.77539L11.293 9.70703L7.29297 5.70703C6.90244 5.31651 6.90244 4.68349 7.29297 4.29297C7.68349 3.90244 8.31651 3.90244 8.70703 4.29297L11 6.58594V2C11 1.44772 11.4477 1 12 1Z" />
      </svg>
    </button>
  );

  /* ── Shared: Sunrise button (step brighter) ────────────── */
  const sunriseBtn = (
    <button
      type="button"
      aria-label="Step brighter"
      onClick={stepBrighter}
      className="flex shrink-0 items-start justify-center border-none bg-transparent p-0 cursor-pointer"
      style={{
        width: 48,
        height: 48,
        paddingTop: 10,
        borderRadius: 9999,
        backgroundColor: "rgb(var(--text) / 0.08)",
        opacity: activeIndex < themeOptions.length - 1 ? 1 : 0.3,
        transition: "opacity 200ms ease",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color: "rgb(var(--text))" }}
      >
        <path d="M23 20.9998C23.5523 20.9998 24 21.4475 24 21.9998C24 22.5521 23.5523 22.9998 23 22.9998H1C0.447715 22.9998 0 22.5521 0 21.9998C0 21.4475 0.447715 20.9998 1 20.9998H23ZM3 16.9998C3.55228 16.9998 4 17.4475 4 17.9998C4 18.5521 3.55228 18.9998 3 18.9998H1C0.447715 18.9998 0 18.5521 0 17.9998C0 17.4475 0.447715 16.9998 1 16.9998H3ZM12 11.9998C13.5913 11.9998 15.117 12.6324 16.2422 13.7576C17.3674 14.8828 18 16.4085 18 17.9998C18 18.5521 17.5523 18.9998 17 18.9998H7C6.73478 18.9998 6.48051 18.8943 6.29297 18.7068C6.10543 18.5193 6 18.265 6 17.9998C6 16.4085 6.63259 14.8828 7.75781 13.7576C8.88303 12.6324 10.4087 11.9998 12 11.9998ZM23 16.9998C23.5523 16.9998 24 17.4475 24 17.9998C24 18.5521 23.5523 18.9998 23 18.9998H21C20.4477 18.9998 20 18.5521 20 17.9998C20 17.4475 20.4477 16.9998 21 16.9998H23ZM3.5127 9.51246C3.90313 9.12204 4.53622 9.1222 4.92676 9.51246L6.34668 10.9324C6.7372 11.3229 6.73719 11.9559 6.34668 12.3464C5.95616 12.737 5.32314 12.737 4.93262 12.3464L3.5127 10.9265C3.12243 10.536 3.12226 9.9029 3.5127 9.51246ZM19.0732 9.51246C19.4638 9.12227 20.0969 9.12208 20.4873 9.51246C20.8777 9.90288 20.8775 10.536 20.4873 10.9265L19.0674 12.3464C18.6769 12.737 18.0438 12.7369 17.6533 12.3464C17.2628 11.9559 17.2628 11.3229 17.6533 10.9324L19.0732 9.51246ZM11.3691 1.22437C11.7619 0.904025 12.3409 0.926618 12.707 1.29273L16.707 5.29273C17.0976 5.68326 17.0976 6.31627 16.707 6.7068C16.3165 7.09732 15.6835 7.09732 15.293 6.7068L13 4.41383V8.99977C13 9.55205 12.5523 9.99977 12 9.99977C11.4477 9.99977 11 9.55205 11 8.99977V4.41383L8.70703 6.7068C8.31651 7.09732 7.68349 7.09732 7.29297 6.7068C6.90244 6.31627 6.90244 5.68326 7.29297 5.29273L11.293 1.29273L11.3691 1.22437Z" />
      </svg>
    </button>
  );

  /* ── Shared: Label / info row ──────────────────────────── */
  const labelRow = (
    <div
      className="flex flex-col"
      style={{
        fontSize: 10,
        lineHeight: 1.75,
        padding: compact ? "0" : "0 8px",
        color: "rgb(var(--text))",
        fontFamily: "var(--font-body, 'Roboto', sans-serif)",
        whiteSpace: "nowrap",
      }}
    >
      <span className="flex items-baseline" style={{ gap: 6 }}>
        <span>{activeLabel}</span>
        <span
          style={{
            textDecoration: isManual ? "line-through" : "none",
            opacity: isManual ? 0.3 : 1,
          }}
        >
          {city}{city && time ? " " : ""}{time}
        </span>
      </span>
      <div className="flex items-baseline" style={{ gap: 6 }}>
        <button
          type="button"
          onClick={isManual ? resetToAuto : undefined}
          className={`border-none bg-transparent p-0 uppercase underline ${isManual ? "cursor-pointer" : "cursor-not-allowed"}`}
          style={{
            fontSize: 10,
            lineHeight: 1.75,
            opacity: isManual ? 1 : 0.3,
            color: "rgb(var(--text))",
            fontFamily: "var(--font-mono, 'Roboto Mono', monospace)",
            fontWeight: 700,
            transition: "opacity 200ms ease",
          }}
        >
          Reset To Auto
        </button>
      </div>
    </div>
  );

  /* ─────────── COMPACT layout (desktop single row) ──────── */
  if (compact) {
    return (
      <div className="flex items-center" style={{ gap: 4 }}>
        {sliderPill(true)}
        {sunsetBtn}
        {sunriseBtn}
        <div style={{ marginLeft: 4 }}>{labelRow}</div>
      </div>
    );
  }

  /* ─────────── STANDARD layout (mobile stacked) ─────────── */
  return (
    <div className="flex w-full items-start" style={{ gap: 4 }}>
      {/* ── Slider pill + label column ──────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 2 }}>
        {sliderPill(false)}

        {/* Label row (below slider on mobile) */}
        <div
          className="flex items-baseline justify-between"
          style={{
            height: 19.5,
            fontSize: 10,
            lineHeight: 1.75,
            padding: "0 8px",
            color: "rgb(var(--text))",
            fontFamily: "var(--font-body, 'Roboto', sans-serif)",
          }}
        >
          <span className="flex items-center" style={{ gap: 6 }}>
            <span>{activeLabel}</span>
            <span
              style={{
                textDecoration: isManual ? "line-through" : "none",
                opacity: isManual ? 0.3 : 1,
              }}
            >
              {city}{city && time ? " " : ""}{time}
            </span>
          </span>
          <button
            type="button"
            onClick={isManual ? resetToAuto : undefined}
            className={`border-none bg-transparent p-0 uppercase underline ${isManual ? "cursor-pointer" : "cursor-not-allowed"}`}
            style={{
              fontSize: 10,
              lineHeight: 1.75,
              opacity: isManual ? 1 : 0.3,
              color: "rgb(var(--text))",
              fontFamily: "var(--font-mono, 'Roboto Mono', monospace)",
              fontWeight: 700,
              transition: "opacity 200ms ease",
            }}
          >
            Reset To Auto
          </button>
        </div>
      </div>

      {/* ── Sunset button (step darker) ──────────────────── */}
      {sunsetBtn}

      {/* ── Sunrise button (step brighter) ───────────────── */}
      {sunriseBtn}
    </div>
  );
}