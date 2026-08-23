"use client";

import { THEMES, type ThemeKey } from "@/lib/utils";

interface ThemePickerProps {
  value: ThemeKey;
  onChange: (theme: ThemeKey) => void;
}

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.entries(THEMES) as [ThemeKey, (typeof THEMES)[ThemeKey]][]).map(
        ([key, theme]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={theme.label}
            className={`theme-swatch ${value === key ? "theme-swatch-active" : ""}`}
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              boxShadow:
                value === key
                  ? `0 0 0 3px white, 0 0 0 5px ${theme.primary}`
                  : "none",
            }}
          >
            <span className="sr-only">{theme.label}</span>
            {value === key && (
              <span className="text-white text-xs font-bold">✓</span>
            )}
          </button>
        )
      )}
    </div>
  );
}
