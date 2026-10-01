import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, HeartPulse, Moon, Plus, Scale } from "lucide-react";

import { useToast } from "@/components/Toast";
import { EmptyState, Modal, Skeleton, StatCard } from "@/components/ui";
import { ReportIllustration } from "@/components/illustrations";
import { addVital, getVitals } from "@/lib/api/clinical";
import type { VitalReading } from "@/types/clinical";

const AXIS = { fontSize: 11, fill: "#94a3b8" };
const shortDate = (value: string) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });

function ChartCard({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: ReactElement }) {
  return (
    <div className="card-pad">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon size={16} className="text-brand-600" /> {title}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function AddReadingForm({ patientId, onDone }: { patientId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ systolic_bp: "", diastolic_bp: "", heart_rate: "", weight_kg: "", sleep_hours: "", notes: "" });
  const mutation = useMutation({
    mutationFn: () =>
      addVital({
        patient: patientId,
        recorded_at: new Date().toISOString(),
        systolic_bp: form.systolic_bp ? Number(form.systolic_bp) : null,
        diastolic_bp: form.diastolic_bp ? Number(form.diastolic_bp) : null,
        heart_rate: form.heart_rate ? Number(form.heart_rate) : null,
        weight_kg: form.weight_kg || null,
        sleep_hours: form.sleep_hours || null,
        notes: form.notes,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vitals", patientId] });
      toast("Reading saved.");
      onDone();
    },
    onError: () => toast("Could not save the reading.", "error"),
  });

  const fields: { key: keyof typeof form; label: string; step?: string }[] = [
    { key: "systolic_bp", label: "Systolic BP (mmHg)" },
    { key: "diastolic_bp", label: "Diastolic BP (mmHg)" },
    { key: "heart_rate", label: "Heart rate (bpm)" },
    { key: "weight_kg", label: "Weight (kg)", step: "0.1" },
    { key: "sleep_hours", label: "Sleep (hours)", step: "0.1" },
  ];

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {fields.map(({ key, label, step }) => (
        <label key={key}>
          <span className="label">{label}</span>
          <input type="number" min={0} step={step ?? "1"} className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </label>
      ))}
      <label className="sm:col-span-2">
        <span className="label">Notes</span>
        <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <button type="submit" disabled={mutation.isPending} className="btn-primary sm:col-span-2">
        Save reading
      </button>
    </form>
  );
}

export default function VitalsPanel({ patientId, canAdd }: { patientId: string; canAdd: boolean }) {
  const [adding, setAdding] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["vitals", patientId], queryFn: () => getVitals({ patient: patientId }) });

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  const readings: VitalReading[] = data?.results ?? [];
  const latest = readings[readings.length - 1];
  const chartData = readings.map((r) => ({
    date: shortDate(r.recorded_at),
    systolic: r.systolic_bp,
    diastolic: r.diastolic_bp,
    heart: r.heart_rate,
    weight: r.weight_kg ? Number(r.weight_kg) : null,
    sleep: r.sleep_hours ? Number(r.sleep_hours) : null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-title">Health measurements</p>
        {canAdd && (
          <button className="btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add reading
          </button>
        )}
      </div>
      {readings.length === 0 ? (
        <div className="card">
          <EmptyState title="No readings yet" message="Blood pressure, heart rate, weight and sleep will be charted here." illustration={<ReportIllustration />} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Blood pressure" icon={Activity} tone="rose" value={latest?.systolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp}` : "—"} hint="mmHg · latest" />
            <StatCard label="Heart rate" icon={HeartPulse} tone="accent" value={latest?.heart_rate ?? "—"} hint="bpm · latest" />
            <StatCard label="Weight" icon={Scale} tone="blue" value={latest?.weight_kg ?? "—"} hint="kg · latest" />
            <StatCard label="Sleep" icon={Moon} tone="brand" value={latest?.sleep_hours ?? "—"} hint="hours · latest" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Blood pressure (mmHg)" icon={Activity}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={AXIS} />
                <YAxis domain={[50, 160]} tick={AXIS} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="rgb(var(--accent-500))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartCard>
            <ChartCard title="Heart rate (bpm)" icon={HeartPulse}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--accent-500))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="rgb(var(--accent-500))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={AXIS} />
                <YAxis domain={[50, 110]} tick={AXIS} />
                <Tooltip />
                <Area type="monotone" dataKey="heart" name="Heart rate" stroke="rgb(var(--accent-500))" strokeWidth={2.5} fill="url(#hr)" />
              </AreaChart>
            </ChartCard>
            <ChartCard title="Weight (kg)" icon={Scale}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={AXIS} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={AXIS} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" name="Weight" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartCard>
            <ChartCard title="Sleep (hours)" icon={Moon}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={AXIS} />
                <YAxis domain={[0, 10]} tick={AXIS} />
                <Tooltip />
                <Bar dataKey="sleep" name="Sleep" fill="rgb(var(--brand-500))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>
        </>
      )}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add health reading">
        <AddReadingForm patientId={patientId} onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
