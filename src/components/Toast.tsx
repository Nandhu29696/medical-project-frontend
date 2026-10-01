import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = (id: number) => setToasts((all) => all.filter((t) => t.id !== id));

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId++;
    setToasts((all) => [...all, { id, kind, message }]);
    window.setTimeout(() => dismiss(id), 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="no-print pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex animate-fade-in items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lift"
          >
            {toast.kind === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-600" />
            ) : (
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
            )}
            <p className="flex-1 text-slate-700">{toast.message}</p>
            <button aria-label="Dismiss" onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
