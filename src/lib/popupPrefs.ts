/**
 * Per-browser pop-up preferences. In-app pop-ups are on by default; desktop (system)
 * notifications need the browser's permission and are off until the user enables them.
 */

type DesktopPermission = "default" | "granted" | "denied";

const KEY = "mediance_popup_prefs";
const EVENT = "mediance-popup-prefs";

export interface PopupPrefs {
  inApp: boolean;
  desktop: boolean;
}

const DEFAULTS: PopupPrefs = { inApp: true, desktop: false };

export function getPopupPrefs(): PopupPrefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function setPopupPrefs(patch: Partial<PopupPrefs>): PopupPrefs {
  const next = { ...getPopupPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: preference lasts for this page only */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  return next;
}

export function onPopupPrefsChange(callback: (prefs: PopupPrefs) => void) {
  const handler = (e: Event) => callback((e as CustomEvent<PopupPrefs>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function desktopSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function desktopPermission(): DesktopPermission | "unsupported" {
  return desktopSupported() ? Notification.permission : "unsupported";
}

/** Ask the browser for permission and turn desktop pop-ups on if granted. */
export async function enableDesktopPopups(): Promise<DesktopPermission | "unsupported"> {
  if (!desktopSupported()) return "unsupported";
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  setPopupPrefs({ desktop: permission === "granted" });
  return permission;
}
