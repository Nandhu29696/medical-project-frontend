import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import clsx from "clsx";
import { AlarmClock, BellRing, Mail, MessageCircle, Monitor, Save } from "lucide-react";

import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/ui";
import { getContactPreferences, updateContactPreferences } from "@/lib/api/messaging";
import { formatDateTime } from "@/lib/format";
import {
  desktopPermission,
  enableDesktopPopups,
  getPopupPrefs,
  onPopupPrefsChange,
  setPopupPrefs,
} from "@/lib/popupPrefs";

function Row({
  icon: Icon,
  title,
  detail,
  checked,
  onChange,
  disabled,
}: {
  icon: typeof Mail;
  title: string;
  detail: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{detail}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={onChange}
        className={clsx(
          "relative mt-1 h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50",
          checked ? "bg-brand-600" : "bg-slate-300"
        )}
      >
        <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

/** Email / WhatsApp / reminder consent (server) plus pop-up settings (this browser). */
export default function ContactPreferencesCard() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const prefs = useQuery({ queryKey: ["contact-preferences"], queryFn: getContactPreferences });
  const [number, setNumber] = useState("");
  const [popups, setPopups] = useState(getPopupPrefs);
  const [permission, setPermission] = useState(desktopPermission);

  useEffect(() => onPopupPrefsChange(setPopups), []);
  useEffect(() => {
    if (prefs.data) setNumber(prefs.data.whatsapp_number);
  }, [prefs.data]);

  const save = useMutation({
    mutationFn: updateContactPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["contact-preferences"], data);
      toast("Contact preferences saved.");
    },
    onError: (error) => {
      const message = isAxiosError(error) ? error.response?.data?.errors?.whatsapp_number?.[0] : undefined;
      toast(message ?? "Could not save preferences.", "error");
    },
  });

  if (prefs.isLoading || !prefs.data) return <Skeleton className="h-80 rounded-2xl" />;
  const p = prefs.data;

  return (
    <div className="card-pad">
      <p className="section-title flex items-center gap-2">
        <BellRing size={16} className="text-brand-600" /> How we contact you
      </p>
      <p className="text-xs text-slate-500">Choose where you receive appointment confirmations, reminders, prescriptions and reports.</p>
      <div className="mt-2 divide-y divide-slate-100">
        <Row icon={Mail} title="Email" detail="Confirmations, reminders and new reports by email." checked={p.email_enabled} onChange={() => save.mutate({ email_enabled: !p.email_enabled })} />
        <Row
          icon={MessageCircle}
          title="WhatsApp"
          detail={
            p.whatsapp_enabled
              ? `On since ${p.whatsapp_opt_in_at ? formatDateTime(p.whatsapp_opt_in_at) : "now"} · ${p.effective_whatsapp_number || "add a number below"}`
              : "I agree to receive appointment and care updates on WhatsApp."
          }
          checked={p.whatsapp_enabled}
          onChange={() => save.mutate({ whatsapp_enabled: !p.whatsapp_enabled })}
        />
        {p.whatsapp_enabled && (
          <form
            className="flex gap-2 py-3 pl-12"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate({ whatsapp_number: number });
            }}
          >
            <input
              className="input"
              type="tel"
              placeholder={p.effective_whatsapp_number || "WhatsApp number"}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              aria-label="WhatsApp number"
            />
            <button type="submit" className="btn-outline" disabled={save.isPending}>
              <Save size={14} /> Save
            </button>
          </form>
        )}
        <Row icon={AlarmClock} title="Appointment reminders" detail="A reminder before each scheduled consultation." checked={p.reminders_enabled} onChange={() => save.mutate({ reminders_enabled: !p.reminders_enabled })} />
        <Row icon={BellRing} title="Pop-up alerts in the app" detail="Show a card when something new happens while you're signed in." checked={popups.inApp} onChange={() => setPopupPrefs({ inApp: !popups.inApp })} />
        <Row
          icon={Monitor}
          title="Desktop notifications"
          detail={
            permission === "unsupported"
              ? "This browser doesn't support desktop notifications."
              : permission === "denied"
                ? "Blocked in your browser. Allow notifications for this site in the browser settings."
                : "Show system notifications even when this tab is in the background."
          }
          checked={popups.desktop && permission === "granted"}
          disabled={permission === "unsupported" || permission === "denied"}
          onChange={async () => {
            if (popups.desktop) setPopupPrefs({ desktop: false });
            else setPermission(await enableDesktopPopups());
          }}
        />
      </div>
    </div>
  );
}
