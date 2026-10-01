import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { isAxiosError } from "axios";
import {
  Activity,
  Check,
  Eye,
  Heart,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Square,
  Squircle,
  Stethoscope,
  Type,
  Users,
} from "lucide-react";

import { useBranding } from "@/components/BrandingProvider";
import { useToast } from "@/components/Toast";
import { Badge, PageHeader, Skeleton, StatCard } from "@/components/ui";
import { getThemeSettings, resetThemeSettings, saveThemeSettings } from "@/lib/api/branding";
import {
  BODY_FONTS,
  DEFAULT_THEME,
  HEADING_FONTS,
  PRESET_INFO,
  fontStylesheetUrl,
  isHexColor,
  sameTheme,
  shadeScale,
  type CornerStyle,
  type SiteTheme,
  type ThemePreset,
} from "@/lib/branding";
import { formatDateTime } from "@/lib/format";

type NamedPreset = Exclude<ThemePreset, "CUSTOM">;

/** Load every selectable font once so the pickers can show each face. */
function usePickerFonts() {
  useEffect(() => {
    const url = fontStylesheetUrl([...HEADING_FONTS, ...BODY_FONTS]);
    if (!url || document.getElementById("theme-picker-fonts")) return;
    const link = document.createElement("link");
    link.id = "theme-picker-fonts";
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }, []);
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const scale = isHexColor(value) ? shadeScale(value) : null;
  return (
    <div className="space-y-2">
      <span className="label">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={isHexColor(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
        />
        <input
          aria-label={`${label} hex code`}
          className={clsx("input font-mono uppercase", !isHexColor(text) && "border-red-400")}
          value={text}
          maxLength={7}
          onChange={(e) => {
            const next = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setText(next);
            if (isHexColor(next)) onChange(next.toUpperCase());
          }}
        />
      </div>
      {scale && (
        <div className="flex overflow-hidden rounded-lg" aria-hidden="true">
          {Object.entries(scale).map(([shade, rgb]) => (
            <span key={shade} title={shade} className="h-5 flex-1" style={{ backgroundColor: `rgb(${rgb})` }} />
          ))}
        </div>
      )}
    </div>
  );
}

function PresetCard({
  id,
  values,
  selected,
  onSelect,
}: {
  id: NamedPreset;
  values: Omit<SiteTheme, "preset">;
  selected: boolean;
  onSelect: () => void;
}) {
  const info = PRESET_INFO[id];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx(
        "relative overflow-hidden rounded-2xl border-2 text-left transition hover:shadow-lift",
        selected ? "border-slate-900" : "border-slate-200"
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
          <Check size={14} />
        </span>
      )}
      <div className="h-16" style={{ background: `linear-gradient(120deg, ${values.primary_color}, ${values.accent_color})` }} />
      <div className="space-y-1 p-3">
        <p className="text-lg leading-tight text-slate-900" style={{ fontFamily: `"${values.heading_font}", serif` }}>
          {info.label}
        </p>
        <p className="text-xs text-slate-500">{info.description}</p>
        <p className="pt-1 text-[11px] text-slate-400">
          {values.heading_font} · {values.body_font}
        </p>
      </div>
    </button>
  );
}

/** A small slice of real UI so the admin sees the draft on familiar components. */
function LivePreview() {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-brand-600 to-accent-600 p-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Next appointment</p>
        <p className="mt-1 font-display text-2xl font-bold">Fri, 3 Oct · 11:30 AM</p>
        <p className="text-sm text-white/85">Video call with Dr. Kavya Raghavan</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Patients" icon={Users} tone="brand" value={42} hint="this month" />
        <StatCard label="Consultations" icon={Activity} tone="accent" value={18} hint="this week" />
      </div>
      <div className="card-pad space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Heart size={18} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900">Care that understands you</h3>
            <p className="text-xs text-slate-500">Headings use the heading font; this line uses the body font.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">Scheduled</Badge>
          <Badge tone="accent">Prescription</Badge>
          <Badge tone="slate">Demo</Badge>
        </div>
        <input className="input" placeholder="Search patients" readOnly aria-label="Sample input" />
        <div className="flex flex-wrap gap-2">
          <span className="btn-primary">
            <Stethoscope size={15} /> Book consultation
          </span>
          <span className="btn-outline">View details</span>
          <span className="btn-accent">
            <Sparkles size={15} /> Accent
          </span>
        </div>
      </div>
    </div>
  );
}

function apiError(error: unknown) {
  if (isAxiosError(error)) {
    const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
    const first = errors && Object.values(errors)[0];
    return (Array.isArray(first) ? first[0] : undefined) ?? error.response?.data?.message ?? "Could not save the theme.";
  }
  return "Could not save the theme.";
}

export default function ThemeSettingsPage() {
  usePickerFonts();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { preview, setSaved } = useBranding();
  const settings = useQuery({ queryKey: ["theme-settings"], queryFn: getThemeSettings });
  const [draft, setDraft] = useState<SiteTheme | null>(null);

  // Start editing from the server copy once it arrives.
  useEffect(() => {
    if (settings.data && !draft) setDraft(settings.data);
  }, [settings.data, draft]);

  // Show the draft across the whole screen while editing; restore the saved theme on leave.
  useEffect(() => {
    if (draft) preview(draft);
  }, [draft, preview]);
  useEffect(() => () => preview(null), [preview]);

  const presets = settings.data?.presets ?? {};
  const dirty = useMemo(() => !!draft && !!settings.data && !sameTheme(draft, settings.data), [draft, settings.data]);

  const save = useMutation({
    mutationFn: () => saveThemeSettings(draft!),
    onSuccess: (result) => {
      queryClient.setQueryData(["theme-settings"], result);
      setDraft(result);
      setSaved(result);
      toast("Theme saved. Every visitor now sees it.");
    },
    onError: (e) => toast(apiError(e), "error"),
  });
  const reset = useMutation({
    mutationFn: resetThemeSettings,
    onSuccess: (result) => {
      queryClient.setQueryData(["theme-settings"], result);
      setDraft(result);
      setSaved(result);
      toast("Theme reset to Mediance Green.");
    },
    onError: (e) => toast(apiError(e), "error"),
  });

  if (settings.isLoading || !draft) {
    return <Skeleton className="h-[32rem] rounded-2xl" />;
  }
  if (settings.isError) {
    return <p className="text-sm text-red-600">Could not load theme settings.</p>;
  }

  const choosePreset = (id: NamedPreset) => setDraft({ ...draft, ...presets[id], preset: id });
  const edit = (patch: Partial<SiteTheme>) => setDraft({ ...draft, ...patch, preset: "CUSTOM" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Theme & branding"
        subtitle="Choose how the public website and portal look for every visitor."
        icon={Palette}
        actions={
          <>
            <button
              className="btn-outline"
              disabled={reset.isPending || sameTheme(draft, DEFAULT_THEME)}
              onClick={() => {
                if (window.confirm("Reset the site theme to the original Mediance Green for everyone?")) reset.mutate();
              }}
            >
              <RotateCcw size={16} /> Reset to default
            </button>
            <button className="btn-outline" disabled={!dirty} onClick={() => setDraft(settings.data!)}>
              Discard changes
            </button>
            <button className="btn-primary" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
              <Save size={16} /> {save.isPending ? "Saving…" : "Save theme"}
            </button>
          </>
        }
      />

      <div
        className={clsx(
          "flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3 text-sm",
          dirty ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"
        )}
      >
        <Eye size={16} />
        {dirty
          ? "You're previewing unsaved changes. Only you can see them until you save."
          : `Live for everyone${settings.data?.updated_by_name ? ` · last changed by ${settings.data.updated_by_name}` : ""}${
              settings.data?.updated_at ? ` on ${formatDateTime(settings.data.updated_at)}` : ""
            }.`}
        <span className="ml-auto">
          Current: <b>{draft.preset === "CUSTOM" ? "Custom" : PRESET_INFO[draft.preset].label}</b>
        </span>
      </div>

      <section className="space-y-3">
        <h2 className="section-title">Presets</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {(Object.keys(PRESET_INFO) as NamedPreset[]).map((id) =>
            presets[id] ? (
              <PresetCard key={id} id={id} values={presets[id]} selected={draft.preset === id} onSelect={() => choosePreset(id)} />
            ) : null
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="card-pad space-y-6">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Palette size={16} className="text-brand-600" /> Customise
            </h2>
            <p className="text-xs text-slate-500">Changing any value switches the theme to Custom.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ColorField label="Primary colour (buttons, links, highlights)" value={draft.primary_color} onChange={(hex) => edit({ primary_color: hex })} />
            <ColorField label="Accent colour (gradients, secondary highlights)" value={draft.accent_color} onChange={(hex) => edit({ accent_color: hex })} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <span className="label flex items-center gap-1"><Type size={13} /> Heading font</span>
              <div className="grid grid-cols-2 gap-2">
                {HEADING_FONTS.map((font) => (
                  <button
                    key={font}
                    type="button"
                    aria-pressed={draft.heading_font === font}
                    onClick={() => edit({ heading_font: font })}
                    className={clsx(
                      "rounded-xl border-2 px-3 py-2 text-left text-base transition",
                      draft.heading_font === font ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"
                    )}
                    style={{ fontFamily: `"${font}", serif` }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="label flex items-center gap-1"><Type size={13} /> Body font</span>
                <div className="grid gap-2">
                  {BODY_FONTS.map((font) => (
                    <button
                      key={font}
                      type="button"
                      aria-pressed={draft.body_font === font}
                      onClick={() => edit({ body_font: font })}
                      className={clsx(
                        "rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                        draft.body_font === font ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"
                      )}
                      style={{ fontFamily: `"${font}", sans-serif` }}
                    >
                      {font} — Easy to read on any screen
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="label">Corner style</span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["STANDARD", "Standard", Square],
                      ["ROUND", "Extra round", Squircle],
                    ] as [CornerStyle, string, typeof Square][]
                  ).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={draft.corner_style === value}
                      onClick={() => edit({ corner_style: value })}
                      className={clsx(
                        "flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition",
                        draft.corner_style === value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"
                      )}
                    >
                      <Icon size={16} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-3 xl:sticky xl:top-20 xl:self-start">
          <h2 className="section-title flex items-center gap-2">
            <Eye size={16} className="text-brand-600" /> Live preview
          </h2>
          <LivePreview />
          <p className="text-xs text-slate-500">
            The whole screen already shows your draft. Open the public website in a new tab after saving to check it.
          </p>
        </aside>
      </div>

    </div>
  );
}

