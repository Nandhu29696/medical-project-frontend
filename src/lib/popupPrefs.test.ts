import { beforeEach, describe, expect, it, vi } from "vitest";

import { enableDesktopPopups, getPopupPrefs, onPopupPrefsChange, setPopupPrefs } from "@/lib/popupPrefs";

describe("pop-up preferences", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to in-app on and desktop off", () => {
    expect(getPopupPrefs()).toEqual({ inApp: true, desktop: false });
  });

  it("persists changes and notifies listeners", () => {
    const listener = vi.fn();
    const stop = onPopupPrefsChange(listener);
    setPopupPrefs({ inApp: false });
    expect(getPopupPrefs().inApp).toBe(false);
    expect(listener).toHaveBeenCalledWith({ inApp: false, desktop: false });
    stop();
  });

  it("only enables desktop pop-ups when the browser grants permission", async () => {
    const requestPermission = vi.fn().mockResolvedValue("denied");
    vi.stubGlobal("Notification", Object.assign(vi.fn(), { permission: "default", requestPermission }));
    expect(await enableDesktopPopups()).toBe("denied");
    expect(getPopupPrefs().desktop).toBe(false);

    requestPermission.mockResolvedValue("granted");
    expect(await enableDesktopPopups()).toBe("granted");
    expect(getPopupPrefs().desktop).toBe(true);
    vi.unstubAllGlobals();
  });
});
