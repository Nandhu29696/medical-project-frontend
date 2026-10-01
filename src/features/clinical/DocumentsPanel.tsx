import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileImage, FileText, Trash2, Upload } from "lucide-react";

import { useToast } from "@/components/Toast";
import { EmptyState, Modal, Skeleton } from "@/components/ui";
import { ReportIllustration } from "@/components/illustrations";
import { deleteDocument, getDocuments, uploadDocument } from "@/lib/api/clinical";
import { formatBytes, formatDate } from "@/lib/format";
import type { DocumentType, MedicalDocument } from "@/types/clinical";

const TYPE_LABELS: Record<DocumentType, string> = {
  LAB_REPORT: "Lab report",
  SCAN: "Scan / imaging",
  PRESCRIPTION: "Prescription",
  DISCHARGE_SUMMARY: "Discharge summary",
  OTHER: "Other",
};

const isImage = (doc: MedicalDocument) => /\.(png|jpe?g|gif|webp)$/i.test(doc.file_name ?? doc.file);

function UploadForm({ patientId, onDone }: { patientId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", document_type: "LAB_REPORT", notes: "" });
  const mutation = useMutation({
    mutationFn: () => uploadDocument({ patient: patientId, ...form, file: file! }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents", patientId] });
      toast("Document uploaded.");
      onDone();
    },
    onError: () => toast("Upload failed. Check the file and try again.", "error"),
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (file) mutation.mutate();
      }}
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-brand-400">
        <Upload size={24} className="text-brand-600" />
        <span className="text-sm font-semibold text-slate-700">{file ? file.name : "Choose a PDF or image"}</span>
        <span className="text-xs text-slate-400">PDF, PNG or JPG</span>
        <input
          type="file"
          accept=".pdf,image/*"
          className="sr-only"
          onChange={(e) => {
            const chosen = e.target.files?.[0] ?? null;
            setFile(chosen);
            if (chosen && !form.title) setForm((f) => ({ ...f, title: chosen.name.replace(/\.[^.]+$/, "") }));
          }}
        />
      </label>
      <label className="block">
        <span className="label">Title</span>
        <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <label className="block">
        <span className="label">Type</span>
        <select className="input" value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">Notes</span>
        <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <button type="submit" disabled={!file || mutation.isPending} className="btn-primary w-full">
        {mutation.isPending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}

export default function DocumentsPanel({ patientId, canUpload }: { patientId: string; canUpload: boolean }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<MedicalDocument | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["documents", patientId], queryFn: () => getDocuments({ patient: patientId }) });
  const remove = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents", patientId] });
      toast("Document deleted.");
    },
    onError: () => toast("You can only delete documents you uploaded.", "error"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-title">Reports & documents</p>
        {canUpload && (
          <button className="btn-primary btn-sm" onClick={() => setUploading(true)}>
            <Upload size={14} /> Upload
          </button>
        )}
      </div>
      {isLoading && <Skeleton className="h-40 rounded-2xl" />}
      {data?.results.length === 0 && (
        <div className="card">
          <EmptyState title="No documents yet" message="Lab reports, scans and discharge summaries will appear here." illustration={<ReportIllustration />} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.results.map((doc) => (
          <div key={doc.id} className="card group overflow-hidden">
            <button className="block h-36 w-full overflow-hidden bg-slate-100" onClick={() => (isImage(doc) ? setPreview(doc) : window.open(doc.file, "_blank"))}>
              {isImage(doc) ? (
                <img src={doc.file} alt={doc.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-50 to-amber-50">
                  <FileText size={44} className="text-red-500" />
                </div>
              )}
            </button>
            <div className="p-4">
              <p className="flex items-center gap-1.5 truncate font-semibold text-slate-800">
                {isImage(doc) ? <FileImage size={15} className="shrink-0 text-accent-600" /> : <FileText size={15} className="shrink-0 text-red-500" />}
                {doc.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {TYPE_LABELS[doc.document_type]} · {formatDate(doc.created_at)} {doc.file_size ? `· ${formatBytes(doc.file_size)}` : ""}
              </p>
              {doc.uploaded_by_name && <p className="text-xs text-slate-400">By {doc.uploaded_by_name}</p>}
              <div className="mt-3 flex gap-2">
                <a href={doc.file} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                  <Download size={13} /> Open
                </a>
                {canUpload && (
                  <button
                    className="btn-ghost btn-sm text-red-600"
                    onClick={() => window.confirm(`Delete "${doc.title}"?`) && remove.mutate(doc.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={uploading} onClose={() => setUploading(false)} title="Upload document">
        <UploadForm patientId={patientId} onDone={() => setUploading(false)} />
      </Modal>
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title ?? ""} wide>
        {preview && <img src={preview.file} alt={preview.title} className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}
