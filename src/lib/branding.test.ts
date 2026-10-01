import { describe, expect, it } from "vitest";

import { DEFAULT_THEME, applyTheme, fontStylesheetUrl, isHexColor, sameTheme, shadeScale, themeVariables } from "@/lib/branding";

describe("branding", () => {
  it("builds a light-to-dark shade scale around the base colour", () => {
    const scale = shadeScale("#D9467A");
    expect(scale[500]).toBe("217 70 122");
    const lightness = (rgb: string) => rgb.split(" ").map(Number).reduce((a, b) => a + b, 0);
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    for (let i = 1; i < shades.length; i++) {
      expect(lightness(scale[shades[i]])).toBeLessThan(lightness(scale[shades[i - 1]]));
    }
  });

  it("maps fonts and corner style to CSS variables", () => {
    const vars = themeVariables({ ...DEFAULT_THEME, heading_font: "Fraunces", corner_style: "ROUND" });
    expect(vars["--font-display"]).toBe('"Fraunces"');
    expect(vars["--radius-control"]).toBe("9999px");
    expect(vars["--brand-500"]).toBe("15 157 120");
  });

  it("only requests fonts that are not already bundled", () => {
    expect(fontStylesheetUrl(["Plus Jakarta Sans"])).toBeNull();
    expect(fontStylesheetUrl(["Fraunces", "Nunito", "Fraunces"])).toBe(
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap"
    );
  });

  it("validates hex colours and compares themes case-insensitively", () => {
    expect(isHexColor("#a1b2c3")).toBe(true);
    expect(isHexColor("pink")).toBe(false);
    expect(sameTheme(DEFAULT_THEME, { ...DEFAULT_THEME, primary_color: "#0f9d78" })).toBe(true);
    expect(sameTheme(DEFAULT_THEME, { ...DEFAULT_THEME, corner_style: "ROUND" })).toBe(false);
  });

  it("applies variables to the document and caches them", () => {
    applyTheme({ ...DEFAULT_THEME, primary_color: "#8B6CEF", heading_font: "Quicksand" });
    expect(document.documentElement.style.getPropertyValue("--brand-500")).toBe("139 108 239");
    expect(document.getElementById("mediance-theme-fonts")?.getAttribute("href")).toContain("Quicksand");
    expect(JSON.parse(localStorage.getItem("mediance_site_theme")!).theme.primary_color).toBe("#8B6CEF");
  });
});
