import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { getPublicTheme } from "@/lib/api/branding";
import { applyTheme, cachedTheme, DEFAULT_THEME, type SiteTheme } from "@/lib/branding";

interface BrandingValue {
  /** The saved, site-wide theme. */
  theme: SiteTheme;
  /** Apply a theme to this screen only (unsaved preview). Pass null to go back to the saved one. */
  preview: (theme: SiteTheme | null) => void;
  /** Store a newly saved theme and apply it. */
  setSaved: (theme: SiteTheme) => void;
}

const BrandingContext = createContext<BrandingValue>({
  theme: DEFAULT_THEME,
  preview: () => {},
  setSaved: () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>(() => cachedTheme() ?? DEFAULT_THEME);

  useEffect(() => {
    let cancelled = false;
    getPublicTheme()
      .then((saved) => {
        if (cancelled) return;
        setTheme(saved);
        applyTheme(saved);
      })
      .catch(() => {
        /* backend unreachable: keep the cached or default theme */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const preview = useCallback((draft: SiteTheme | null) => applyTheme(draft ?? theme, false), [theme]);
  const setSaved = useCallback((saved: SiteTheme) => {
    setTheme(saved);
    applyTheme(saved);
  }, []);

  return <BrandingContext.Provider value={{ theme, preview, setSaved }}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
