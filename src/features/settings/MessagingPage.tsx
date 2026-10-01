import { useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import clsx from "clsx";
import {
  AlarmClock,
  CheckCircle2,
  CircleAlert,
  FileText,
  History,
  Mail,
  MessageCircle,
  Pencil,
  RotateCcw,
  Send,
  Settings2,
  Wrench,
} from "lucide-react";

import { useToast } from "@/components/Toast";
import { Badge, EmptyState, Modal, PageHeader, Pagination, Skeleton, SkeletonRows, Tabs, type Tone } from "@/components/ui";
import {
  getDeliveryLogs,
  getMessageTemplates,
  getMessagingStatus,
  resetMessageTemplate,
  runReminders,
  sendTestMessage,
  updateMessageTemplate,
  type DeliveryLog,
  type DeliveryStatus,
  type MessageChannel,
  type MessageTemplate,
  type MessagingStatus,
} from "@/lib/api/messaging";
import { formatDateTime, timeAgo } from "@/lib/format";

type Tab = "templates" | "log" | "test";

const PLACEHOLDERS: { key: string; sample: string; events?: string[] }[] = [
  { key: "first_name", sample: "Asha" },
  { key: "full_name", sample: "Asha Verma" },
  { key: "site_name", sample: "Mediance Neuro Life" },
  { key: "link", sample: "http://localhost:5173/consultations/1234" },
  { key: "doctor_name", sample: "Kavya Raghavan", events: ["CONSULTATION_BOOKED", "CONSULTATION_REMINDER", "CONSULTATION_CANCELLED", "PRESCRIPTION_READY", "DOCTOR_NEW_BOOKING"] },
  { key: "patient_name", sample: "Asha Verma", events: ["CONSULTATION_BOOKED", "CONSULTATION_REMINDER", "CONSULTATION_CANCELLED", "PRESCRIPTION_READY", "DOCTOR_NEW_BOOKING"] },
  { key: "date", sample: "Fri, 03 Oct 2026", events: ["CONSULTATION_BOOKED", "CONSULTATION_REMINDER", "CONSULTATION_CANCELLED", "PRESCRIPTION_READY", "DOCTOR_NEW_BOOKING"] },
  { key: "time", sample: "11:30 AM", events: ["CONSULTATION_BOOKED", "CONSULTATION_REMINDER", "CONSULTATION_CANCELLED", "PRESCRIPTION_READY", "DOCTOR_NEW_BOOKING"] },
  { key: "mode", sample: "Video", events: ["CONSULTATION_BOOKED", "CONSULTATION_REMINDER", "CONSULTATION_CANCELLED", "PRESCRIPTION_READY", "DOCTOR_NEW_BOOKING"] },
  { key: "document_title", sample: "Blood test report", events: ["DOCUMENT_UPLOADED"] },
  { key: "lead_number", sample: "MED-000042", events: ["ENQUIRY_RECEIVED", "LEAD_ASSIGNED"] },
  { key: "customer_name", sample: "Divya Nair", events: ["LEAD_ASSIGNED"] },
];

const STATUS_TONE: Record<DeliveryStatus, Tone> = { SENT: "brand", PENDING: "blue", FAILED: "rose", SKIPPED: "slate" };

function renderSample(text: string) {
  const values = Object.fromEntries(PLACEHOLDERS.map((p) => [p.key, p.sample]));
  return text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function apiError(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
    const first = errors && Object.values(errors)[0];
    return (Array.isArray(first) ? first[0] : undefined) ?? error.response?.data?.message ?? fallback;
  }
  return fallback;
}

function ChannelIcon({ channel, size = 16 }: { channel: string; size?: number }) {
  return channel === "WHATSAPP" ? <MessageCircle size={size} className="text-[#25D366]" /> : <Mail size={size} className="text-blue-600" />;
}

// ---------------------------------------------------------------------------------------------
// Status & setup
// ---------------------------------------------------------------------------------------------

function StatusCards({ status }: { status: MessagingStatus }) {
  const emailLabel =
    status.email.mode === "smtp" ? `Live via ${status.email.host}` : status.email.mode === "file" ? "Development: saved as files" : `Mode: ${status.email.mode}`;
  const waLabel = status.whatsapp.live
    ? `Live · WhatsApp Cloud API (number ${status.whatsapp.phone_number_id})`
    : status.whatsapp.provider === "meta"
      ? "Cloud API selected but not configured"
      : "Development: messages are logged, not sent";
  const cards = [
    {
      icon: Mail,
      title: "Email",
      live: status.email.live,
      label: emailLabel,
      detail: status.email.mode === "file" ? `Folder: ${status.email.file_path}` : `From: ${status.email.from_address}`,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      live: status.whatsapp.live,
      label: waLabel,
      detail: status.whatsapp.test_recipients
        ? `Sandbox: only ${status.whatsapp.test_recipients} allowed number(s)`
        : "Patients must opt in before they receive WhatsApp messages",
    },
    {
      icon: AlarmClock,
      title: "Reminders & delivery",
      live: true,
      label: `Reminders ${status.reminder_hours_before} h before each consultation`,
      detail: `Delivery mode: ${status.delivery}. Never contacted: ${status.skip_domains.join(", ")}`,
    },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cards.map(({ icon: Icon, title, live, label, detail }) => (
        <div key={title} className="card-pad flex gap-3">
          <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", live ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-600")}>
            <Icon size={20} />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-bold text-slate-800">
              {title}
              <Badge tone={live ? "brand" : "amber"}>{live ? "Live" : "Dev mode"}</Badge>
            </p>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-1 break-words text-xs text-slate-400">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SetupGuide() {
  return (
    <details className="card-pad group">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-slate-800">
        <Wrench size={16} className="text-brand-600" /> How to go live
        <span className="ml-auto text-xs text-slate-400 group-open:hidden">Show steps</span>
      </summary>
      <div className="mt-4 grid gap-5 text-sm text-slate-600 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="font-semibold text-slate-800">Email (SMTP)</p>
          <p>Add these to <code className="rounded bg-slate-100 px-1">backend/.env</code> and restart the backend:</p>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">{`EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=you@yourdomain.com
EMAIL_HOST_PASSWORD=<app password>
DEFAULT_FROM_EMAIL=Mediance <you@yourdomain.com>`}</pre>
          <p className="text-xs">For Gmail use an App Password. For volume, use a provider such as Amazon SES, SendGrid or Zoho.</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-800">WhatsApp Business Cloud API (Meta)</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Create a Meta Business app and add the WhatsApp product.</li>
            <li>Verify the business and register the sending phone number.</li>
            <li>Create message templates in WhatsApp Manager and wait for approval.</li>
            <li>Enter each approved template name on the matching WhatsApp template here.</li>
          </ol>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">{`WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=<permanent system-user token>
WHATSAPP_PHONE_NUMBER_ID=<phone number id>
WHATSAPP_TEMPLATE_LANGUAGE=en
# optional while testing:
WHATSAPP_TEST_RECIPIENTS=919876543210`}</pre>
        </div>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------------------------

function TemplateEditor({ template, onDone }: { template: MessageTemplate; onDone: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState({
    subject: template.subject,
    body: template.body,
    is_active: template.is_active,
    whatsapp_template_name: template.whatsapp_template_name,
    whatsapp_params: template.whatsapp_params.join(", "),
  });
  const placeholders = PLACEHOLDERS.filter((p) => !p.events || p.events.includes(template.event));
  const refresh = (saved: MessageTemplate) =>
    queryClient.setQueryData<MessageTemplate[]>(["message-templates"], (all) => all?.map((t) => (t.id === saved.id ? saved : t)));

  const save = useMutation({
    mutationFn: () =>
      updateMessageTemplate(template.id, {
        subject: form.subject,
        body: form.body,
        is_active: form.is_active,
        whatsapp_template_name: form.whatsapp_template_name.trim(),
        whatsapp_params: form.whatsapp_params.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    onSuccess: (saved) => {
      refresh(saved);
      toast("Template saved.");
      onDone();
    },
    onError: (e) => toast(apiError(e, "Could not save the template."), "error"),
  });
  const reset = useMutation({
    mutationFn: () => resetMessageTemplate(template.id),
    onSuccess: (saved) => {
      refresh(saved);
      toast("Template reset to the default wording.");
      onDone();
    },
  });

  function insert(key: string) {
    const el = bodyRef.current;
    const token = `{${key}}`;
    if (!el) return setForm({ ...form, body: form.body + token });
    const start = el.selectionStart ?? form.body.length;
    const end = el.selectionEnd ?? start;
    setForm({ ...form, body: form.body.slice(0, start) + token + form.body.slice(end) });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

  const isEmail = template.channel === "EMAIL";
  return (
    <form
      className="grid gap-5 lg:grid-cols-2"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Send this {isEmail ? "email" : "WhatsApp message"}
        </label>
        {isEmail && (
          <label className="block">
            <span className="label">Subject</span>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </label>
        )}
        <label className="block">
          <span className="label">Message</span>
          <textarea ref={bodyRef} rows={9} className="input font-mono text-xs" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>
        <div>
          <span className="label">Insert placeholder</span>
          <div className="flex flex-wrap gap-1.5">
            {placeholders.map((p) => (
              <button key={p.key} type="button" onClick={() => insert(p.key)} className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600 hover:bg-brand-50 hover:text-brand-700">
                {`{${p.key}}`}
              </button>
            ))}
          </div>
        </div>
        {!isEmail && (
          <div className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">Approved Meta template name</span>
              <input className="input font-mono text-xs" placeholder="e.g. appointment_reminder" value={form.whatsapp_template_name} onChange={(e) => setForm({ ...form, whatsapp_template_name: e.target.value })} />
            </label>
            <label className="block">
              <span className="label">Template variables in order</span>
              <input className="input font-mono text-xs" placeholder="first_name, date, time" value={form.whatsapp_params} onChange={(e) => setForm({ ...form, whatsapp_params: e.target.value })} />
            </label>
            <p className="text-[11px] text-slate-500 sm:col-span-2">
              With the Cloud API, messages that start a conversation must use an approved template. The variables fill its {"{{1}}, {{2}}…"} slots.
              Without a template name, the text above is sent, which WhatsApp only delivers within 24 hours of the patient's last message.
            </p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <span className="label">Preview with sample values</span>
        {isEmail ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="bg-brand-600 px-4 py-3 text-sm font-bold text-white">Mediance Neuro Life</div>
            <div className="space-y-3 bg-white p-4 text-sm text-slate-700">
              <p className="font-bold text-slate-900">{renderSample(form.subject) || "(no subject)"}</p>
              <p className="whitespace-pre-line">{renderSample(form.body)}</p>
              <span className="btn-primary btn-sm pointer-events-none">Open in portal</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#e5ddd5] p-4">
            <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-none bg-[#dcf8c6] px-3 py-2 text-sm text-slate-800 shadow">
              <p className="whitespace-pre-line">{renderSample(form.body)}</p>
              <p className="mt-1 text-right text-[10px] text-slate-500">11:30 AM ✓✓</p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={() => reset.mutate()} disabled={reset.isPending}>
            <RotateCcw size={14} /> Default wording
          </button>
          <button type="submit" className="btn-primary" disabled={save.isPending}>
            Save template
          </button>
        </div>
      </div>
    </form>
  );
}

function TemplatesTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["message-templates"], queryFn: getMessageTemplates });
  const toggle = useMutation({
    mutationFn: (t: MessageTemplate) => updateMessageTemplate(t.id, { is_active: !t.is_active }),
    onSuccess: (saved) => {
      queryClient.setQueryData<MessageTemplate[]>(["message-templates"], (all) => all?.map((t) => (t.id === saved.id ? saved : t)));
      toast(`${saved.event_label} ${saved.channel === "EMAIL" ? "email" : "WhatsApp"} ${saved.is_active ? "turned on" : "turned off"}.`);
    },
  });

  const events = useMemo(() => {
    const map = new Map<string, { label: string; items: MessageTemplate[] }>();
    for (const t of data ?? []) {
      if (t.event === "TEST") continue;
      const entry = map.get(t.event) ?? { label: t.event_label, items: [] };
      entry.items.push(t);
      map.set(t.event, entry);
    }
    return [...map.entries()];
  }, [data]);

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>When</th>
            <th>Email</th>
            <th>WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {events.map(([event, { label, items }]) => (
            <tr key={event}>
              <td className="font-semibold text-slate-800">{label}</td>
              {(["EMAIL", "WHATSAPP"] as MessageChannel[]).map((channel) => {
                const t = items.find((i) => i.channel === channel);
                if (!t) return <td key={channel}>—</td>;
                return (
                  <td key={channel}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={t.is_active}
                        aria-label={`${label} ${channel}`}
                        onClick={() => toggle.mutate(t)}
                        className={clsx("relative h-6 w-11 shrink-0 rounded-full transition", t.is_active ? "bg-brand-600" : "bg-slate-300")}
                      >
                        <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", t.is_active ? "left-[22px]" : "left-0.5")} />
                      </button>
                      <span className="min-w-0 max-w-xs truncate text-xs text-slate-500">{t.channel === "EMAIL" ? t.subject : t.body}</span>
                      <button className="btn-ghost btn-sm" onClick={() => setEditing(t)} aria-label={`Edit ${label} ${channel}`}>
                        <Pencil size={13} />
                      </button>
                      {channel === "WHATSAPP" && t.whatsapp_template_name && <Badge tone="brand">{t.whatsapp_template_name}</Badge>}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `${editing.event_label} · ${editing.channel === "EMAIL" ? "Email" : "WhatsApp"}` : ""} wide>
        {editing && <TemplateEditor key={editing.id} template={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Delivery log
// ---------------------------------------------------------------------------------------------

function LogTab() {
  const [page, setPage] = useState(1);
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<DeliveryLog | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-logs", page, channel, status],
    queryFn: () => getDeliveryLogs({ page: String(page), page_size: "20", ...(channel ? { channel } : {}), ...(status ? { status } : {}) }),
    refetchInterval: 15_000,
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select className="input w-auto" value={channel} onChange={(e) => { setChannel(e.target.value); setPage(1); }} aria-label="Channel">
          <option value="">All channels</option>
          <option value="EMAIL">Email</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
        <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          <option value="">All statuses</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
          <option value="SKIPPED">Skipped</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
      {!isLoading && data?.results.length === 0 ? (
        <div className="card"><EmptyState title="No messages yet" message="Book a consultation or send a test message to see deliveries here." /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>When</th>
                <th>Channel</th>
                <th>Event</th>
                <th>To</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonRows cols={6} />}
              {data?.results.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap text-xs" title={formatDateTime(log.created_at)}>{timeAgo(log.created_at)}</td>
                  <td><span className="flex items-center gap-1.5 text-xs font-semibold"><ChannelIcon channel={log.channel} size={14} />{log.channel === "EMAIL" ? "Email" : "WhatsApp"}</span></td>
                  <td className="text-sm">{log.event_label}</td>
                  <td>
                    <span className="block font-mono text-xs text-slate-700">{log.to_address}</span>
                    {log.recipient_name && <span className="text-[11px] text-slate-400">{log.recipient_name}</span>}
                  </td>
                  <td>
                    <Badge tone={STATUS_TONE[log.status]}>{log.status}</Badge>
                    {log.error && <span className="block max-w-[16rem] truncate text-[11px] text-slate-400" title={log.error}>{log.error}</span>}
                  </td>
                  <td className="text-right"><button className="btn-outline btn-sm" onClick={() => setOpen(log)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={20} count={data?.count ?? 0} onChange={setPage} />
      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `${open.event_label} → ${open.to_address}` : ""} wide>
        {open && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge tone={STATUS_TONE[open.status]}>{open.status}</Badge>
              <Badge tone="slate">{open.provider || "not sent"}</Badge>
              {open.provider_message_id && <Badge tone="slate">id {open.provider_message_id}</Badge>}
              {open.sent_at && <Badge tone="slate">sent {formatDateTime(open.sent_at)}</Badge>}
            </div>
            {open.error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{open.error}</p>}
            {open.subject && <p className="font-bold text-slate-900">{open.subject}</p>}
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 font-sans text-slate-700">{open.body}</pre>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Test & reminders
// ---------------------------------------------------------------------------------------------

function TestTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<MessageChannel>("EMAIL");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<DeliveryLog | null>(null);
  const test = useMutation({
    mutationFn: () => sendTestMessage(channel, to),
    onSuccess: (log) => {
      setResult(log);
      void queryClient.invalidateQueries({ queryKey: ["delivery-logs"] });
    },
    onError: (e) => toast(apiError(e, "Could not send the test message."), "error"),
  });
  const reminders = useMutation({
    mutationFn: runReminders,
    onSuccess: (count) => {
      toast(count ? `${count} reminder(s) sent.` : "No consultations are due for a reminder right now.");
      void queryClient.invalidateQueries({ queryKey: ["delivery-logs"] });
    },
  });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="card-pad space-y-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setResult(null);
          test.mutate();
        }}
      >
        <p className="section-title flex items-center gap-2"><Send size={16} className="text-brand-600" /> Send a test message</p>
        <div className="grid grid-cols-2 gap-2">
          {(["EMAIL", "WHATSAPP"] as MessageChannel[]).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={channel === c}
              onClick={() => setChannel(c)}
              className={clsx("flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold", channel === c ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600")}
            >
              <ChannelIcon channel={c} /> {c === "EMAIL" ? "Email" : "WhatsApp"}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="label">{channel === "EMAIL" ? "Email address" : "Mobile number (with or without +91)"}</span>
          <input
            required
            className="input"
            type={channel === "EMAIL" ? "email" : "tel"}
            placeholder={channel === "EMAIL" ? "you@example.com" : "98765 43210"}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={test.isPending}>
          {test.isPending ? "Sending…" : "Send test"}
        </button>
        {result && (
          <div className={clsx("flex gap-2 rounded-xl p-3 text-sm", result.status === "SENT" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
            {result.status === "SENT" ? <CheckCircle2 size={18} className="shrink-0" /> : <CircleAlert size={18} className="shrink-0" />}
            <div>
              <p className="font-semibold">
                {result.status === "SENT" ? `Sent via ${result.provider}` : `${result.status}: ${result.error}`}
              </p>
              {result.provider === "email:file" && <p className="text-xs">Development mode: open the newest file in backend/tmp/sent_emails/.</p>}
              {result.provider === "whatsapp:console" && <p className="text-xs">Development mode: the message is printed in the backend console.</p>}
            </div>
          </div>
        )}
      </form>
      <div className="card-pad space-y-3">
        <p className="section-title flex items-center gap-2"><AlarmClock size={16} className="text-accent-600" /> Appointment reminders</p>
        <p className="text-sm text-slate-600">
          Reminders go out automatically before each scheduled consultation, by email, WhatsApp (if the patient opted in) and in-app. Each consultation is reminded once.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
          <li>Production: Celery beat runs the reminder job every 15 minutes.</li>
          <li>On this PC: run <code className="rounded bg-slate-100 px-1">python manage.py send_reminders --loop</code> in a third window, or use the button below.</li>
        </ul>
        <button className="btn-outline" onClick={() => reminders.mutate()} disabled={reminders.isPending}>
          <AlarmClock size={16} /> {reminders.isPending ? "Checking…" : "Send due reminders now"}
        </button>
      </div>
    </div>
  );
}

export default function MessagingPage() {
  const [tab, setTab] = useState<Tab>("templates");
  const status = useQuery({ queryKey: ["messaging-status"], queryFn: getMessagingStatus });
  return (
    <div className="space-y-6">
      <PageHeader title="Email & WhatsApp" subtitle="Messages patients receive about enquiries, appointments, reminders and reports." icon={Settings2} />
      {status.data ? <StatusCards status={status.data} /> : <Skeleton className="h-28 rounded-2xl" />}
      <SetupGuide />
      <Tabs<Tab>
        tabs={[
          { id: "templates", label: "Message templates", icon: FileText },
          { id: "log", label: "Delivery log", icon: History },
          { id: "test", label: "Test & reminders", icon: Send },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === "templates" && <TemplatesTab />}
      {tab === "log" && <LogTab />}
      {tab === "test" && <TestTab />}
    </div>
  );
}
