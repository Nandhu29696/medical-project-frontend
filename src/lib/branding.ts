/**
 * Runtime site theme. The Super Admin saves a theme on the server; every visitor loads it
 * from /public/theme/ and we write it into CSS variables that Tailwind's brand-* and
 * accent-* colours read (see tailwind.config.js and index.css).
 */

export type ThemePreset = "MEDIANCE_GREEN" | "ROSE_PLUM" | "LAVENDER_CALM" | "PEACH_TEAL" | "MAUVE_MINIMAL" | "CUSTOM";
export type CornerStyle = "STANDARD" | "ROUND";

export interface SiteTheme {
  preset: ThemePreset;
  primary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  corner_style: CornerStyle;
  updated_at?: string;
  updated_by_name?: string | null;
}

export const HEADING_FONTS = ["Plus Jakarta Sans", "Fraunces", "Quicksand", "DM Serif Display", "Playfair Display", "Poppins"];
export const BODY_FONTS = ["Plus Jakarta Sans", "Nunito", "Poppins"];

export const PRESET_INFO: Record<Exclude<ThemePreset, "CUSTOM">, { label: string; description: string }> = {
  MEDIANCE_GREEN: { label: "Mediance Green", description: "The original look: fresh green with violet accents." },
  ROSE_PLUM: { label: "Rose & Plum", description: "Elegant and warm. Recommended for a women-only site." },
  LAVENDER_CALM: { label: "Lavender Calm", description: "Soft and soothing, suits sleep and stress care." },
  PEACH_TEAL: { label: "Peach & Teal", description: "Friendly peach with a trustworthy teal edge." },
  MAUVE_MINIMAL: { label: "Mauve Minimal", description: "Quiet and premium, like a boutique studio." },
};

export const DEFAULT_THEME: SiteTheme = {
  preset: "MEDIANCE_GREEN",
  primary_color: "#0F9D78",
  accent_color: "#7C5CF6",
  heading_font: "Plus Jakarta Sans",
  body_font: "Plus Jakarta Sans",
  corner_style: "STANDARD",
};

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
// How far each shade moves from the base colour: toward white below 500, toward black above.
const MIX: Record<(typeof SHADES)[number], number> = {
  50: 0.93, 100: 0.84, 200: 0.66, 300: 0.46, 400: 0.24, 500: 0, 600: 0.16, 700: 0.32, 800: 0.46, 900: 0.6,
};
const CACHE_KEY = "mediance_site_theme";
const FONT_LINK_ID = "mediance-theme-fonts";

export function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** "r g b" triplets for shades 50–900 of `hex`. */
export function shadeScale(hex: string): Record<number, string> {
  const [r, g, b] = hexToRgb(hex);
  const out: Record<number, string> = {};
  for (const shade of SHADES) {
    const t = MIX[shade];
    const target = shade < 500 ? 255 : 0;
    const mix = (c: number) => Math.round(c + (target - c) * t);
    out[shade] = `${mix(r)} ${mix(g)} ${mix(b)}`;
  }
  return out;
}

export function themeVariables(theme: SiteTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  const brand = shadeScale(theme.primary_color);
  const accent = shadeScale(theme.accent_color);
  for (const shade of SHADES) {
    vars[`--brand-${shade}`] = brand[shade];
    vars[`--accent-${shade}`] = accent[shade];
  }
  vars["--font-display"] = `"${theme.heading_font}"`;
  vars["--font-body"] = `"${theme.body_font}"`;
  vars["--radius-card"] = theme.corner_style === "ROUND" ? "1.5rem" : "1rem";
  vars["--radius-control"] = theme.corner_style === "ROUND" ? "9999px" : "0.75rem";
  return vars;
}

export function fontStylesheetUrl(fonts: string[]) {
  const families = [...new Set(fonts)]
    .filter((f) => f !== "Plus Jakarta Sans") // already loaded by index.html
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`);
  return families.length ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}

function loadFonts(theme: SiteTheme) {
  const url = fontStylesheetUrl([theme.heading_font, theme.body_font]);
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!url) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== url) link.href = url;
}

/** Write the theme into CSS variables on <html>. `persist` caches it for the next page load. */
export function applyTheme(theme: SiteTheme, persist = true) {
  const root = document.documentElement;
  const vars = themeVariables(theme);
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  loadFonts(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.primary_color);
  if (persist) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ vars, fontUrl: fontStylesheetUrl([theme.heading_font, theme.body_font]), theme }));
    } catch {
      /* storage unavailable: the theme still applies for this visit */
    }
  }
}

export function cachedTheme(): SiteTheme | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw).theme as SiteTheme) : null;
  } catch {
    return null;
  }
}

export function sameTheme(a: SiteTheme, b: SiteTheme) {
  return (
    a.preset === b.preset &&
    a.primary_color.toUpperCase() === b.primary_color.toUpperCase() &&
    a.accent_color.toUpperCase() === b.accent_color.toUpperCase() &&
    a.heading_font === b.heading_font &&
    a.body_font === b.body_font &&
    a.corner_style === b.corner_style
  );
}
