"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type ThemeId = "lighter" | "light" | "dark" | "darker";

type ThemeOption = {
  id: ThemeId;
  label: string;
  blurb: string;
};

const themeOptions: ThemeOption[] = [
  { id: "lighter", label: "Lighter", blurb: "Bright, airy, minimal." },
  { id: "light", label: "Light", blurb: "Clean and balanced." },
  { id: "dark", label: "Dark", blurb: "Focused, low glare." },
  { id: "darker", label: "Darker", blurb: "High contrast, bold." },
];

const fallbackTheme: ThemeId = "light";

function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(fallbackTheme);
  const skipNextPersist = useRef(true);

  useLayoutEffect(() => {
    // Prefer what the inline init script already set on <html>
    const preApplied = document.documentElement.dataset.theme as ThemeId | undefined;
    const stored = window.localStorage.getItem("portfolio-theme") as ThemeId | null;
    const nextTheme =
      (preApplied && ["lighter", "light", "dark", "darker"].includes(preApplied)
        ? preApplied
        : stored) ?? fallbackTheme;
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    window.localStorage.setItem("portfolio-theme", theme);
    applyTheme(theme);
  }, [theme]);

  const activeIndex = useMemo(
    () => themeOptions.findIndex((option) => option.id === theme),
    [theme]
  );

  return (
    <div className="rounded-base border border-border bg-surface/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Theme slider
          </p>
          <h2 className="text-2xl font-semibold">Dial the mood</h2>
          <p className="text-sm text-muted">
            Four steps, no noise. Choose the tone that fits the story.
          </p>
        </div>

        <input
          aria-label="Theme slider"
          className="w-full accent-[rgb(var(--accent))]"
          type="range"
          min={0}
          max={themeOptions.length - 1}
          step={1}
          value={activeIndex}
          onChange={(event) => {
            const next = themeOptions[Number(event.target.value)]?.id ?? fallbackTheme;
            setTheme(next);
          }}
        />

        <div className="flex flex-wrap gap-2">
          {themeOptions.map((option) => {
            const isActive = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={
                  "rounded-full border px-4 py-2 text-sm transition " +
                  (isActive
                    ? "border-accent bg-accent text-bg"
                    : "border-border bg-transparent text-text hover:border-accent")
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-base border border-border bg-bg/70 p-4 text-sm text-muted">
          <span className="font-semibold text-text">{themeOptions[activeIndex]?.label}</span>{" "}
          {themeOptions[activeIndex]?.blurb}
        </div>
      </div>
    </div>
  );
}
