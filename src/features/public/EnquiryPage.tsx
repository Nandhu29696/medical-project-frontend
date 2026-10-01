import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, PhoneCall, ShieldCheck, Stethoscope } from "lucide-react";

import { ReportIllustration } from "@/components/illustrations";
import { getPublicProducts } from "@/lib/api/products";
import { submitPublicEnquiry } from "@/lib/api/leads";
import { useI18n } from "@/lib/i18n";
import { enquirySchema, type EnquiryFormValues } from "@/schemas/leadSchema";

const STEPS: { title: string; fields: (keyof EnquiryFormValues)[] }[] = [
  { title: "About you", fields: ["first_name", "last_name", "phone", "email"] },
  { title: "Your enquiry", fields: ["city", "quantity", "preferred_contact_method", "message"] },
  { title: "Confirm", fields: ["consent_given"] },
];

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;
}

export default function EnquiryPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [leadNumber, setLeadNumber] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: products } = useQuery({ queryKey: ["public-products"], queryFn: getPublicProducts });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { preferred_contact_method: "PHONE" },
  });
  const values = watch();

  async function next() {
    if (await trigger(STEPS[step].fields)) setStep((s) => s + 1);
  }

  async function onSubmit(formValues: EnquiryFormValues) {
    setServerError(null);
    const product = products?.[0];
    if (!product) {
      setServerError("No product available for enquiry right now.");
      return;
    }
    try {
      const result = await submitPublicEnquiry({
        ...formValues,
        product_id: product.id,
        source: searchParams.get("utm_source") ?? "ORGANIC",
        medium: searchParams.get("utm_medium") ?? undefined,
        campaign_name: searchParams.get("utm_campaign") ?? undefined,
        landing_page: window.location.href,
        utm_source: searchParams.get("utm_source") ?? undefined,
        utm_medium: searchParams.get("utm_medium") ?? undefined,
        utm_campaign: searchParams.get("utm_campaign") ?? undefined,
        utm_term: searchParams.get("utm_term") ?? undefined,
        utm_content: searchParams.get("utm_content") ?? undefined,
      });
      setLeadNumber(result.lead_number);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  if (leadNumber) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 animate-fade-in items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CheckCircle2 size={44} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900">Thank you!</h1>
        <p className="mt-2 text-slate-600">Your enquiry has been received.</p>
        <div className="card-pad mt-6 inline-block">
          <p className="text-xs uppercase tracking-widest text-slate-400">Reference number</p>
          <p className="mt-1 font-mono text-2xl font-bold text-brand-700">{leadNumber}</p>
        </div>
        <div className="card-pad mt-8 text-left">
          <p className="font-bold text-slate-800">What happens next</p>
          <ol className="mt-3 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3"><PhoneCall size={18} className="shrink-0 text-brand-600" /> A care advisor will contact you by {values.preferred_contact_method === "WHATSAPP" ? "WhatsApp" : "phone"}, usually within one working day.</li>
            <li className="flex gap-3"><Stethoscope size={18} className="shrink-0 text-brand-600" /> If helpful, they'll arrange a consultation with one of our doctors.</li>
            <li className="flex gap-3"><ShieldCheck size={18} className="shrink-0 text-brand-600" /> Your details are only used to respond to this enquiry.</li>
          </ol>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-outline">{t("nav.home")}</Link>
          <Link to="/register" className="btn-primary">{t("nav.register")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand-50/70 via-white to-accent-50/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_1.3fr]">
        <aside className="order-2 lg:order-1">
          <div className="card-pad bg-gradient-to-br from-brand-600 to-accent-600 text-white">
            <div className="h-24 w-24"><ReportIllustration /></div>
            <h2 className="mt-4 text-2xl font-extrabold">Talk to our care team</h2>
            <p className="mt-2 text-white/80">Tell us a little about yourself and we'll call you back — no obligation.</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2"><Clock size={18} /> Takes about a minute</li>
              <li className="flex gap-2"><PhoneCall size={18} /> Call-back within one working day</li>
              <li className="flex gap-2"><ShieldCheck size={18} /> Private — never shared or sold</li>
            </ul>
          </div>
        </aside>

        <div className="order-1 lg:order-2">
          <h1 className="text-3xl font-extrabold text-slate-900">{t("nav.enquire")}</h1>
          {/* Progress */}
          <ol className="mt-6 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-1 items-center gap-2">
                <span
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i < step ? "bg-brand-600 text-white" : i === step ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500" : "bg-slate-100 text-slate-400"
                  )}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </span>
                <span className={clsx("hidden text-sm font-semibold sm:block", i === step ? "text-slate-800" : "text-slate-400")}>{s.title}</span>
                {i < STEPS.length - 1 && <span className={clsx("h-0.5 flex-1 rounded", i < step ? "bg-brand-500" : "bg-slate-200")} />}
              </li>
            ))}
          </ol>

          <form className="card-pad mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 0 && (
              <div className="grid animate-fade-in gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">First name *</label>
                  <input className="input" autoComplete="given-name" {...register("first_name")} />
                  <FieldError message={errors.first_name?.message} />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input className="input" autoComplete="family-name" {...register("last_name")} />
                </div>
                <div>
                  <label className="label">Mobile number *</label>
                  <input className="input" type="tel" autoComplete="tel" {...register("phone")} />
                  <FieldError message={errors.phone?.message} />
                </div>
                <div>
                  <label className="label">Email (optional)</label>
                  <input className="input" type="email" autoComplete="email" {...register("email")} />
                  <FieldError message={errors.email?.message} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid animate-fade-in gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">City</label>
                  <input className="input" autoComplete="address-level2" {...register("city")} />
                </div>
                <div>
                  <label className="label">Quantity (packs)</label>
                  <input className="input" type="number" min={1} {...register("quantity")} />
                  <FieldError message={errors.quantity?.message} />
                </div>
                <div className="sm:col-span-2">
                  <span className="label">Preferred contact</span>
                  <div className="grid grid-cols-2 gap-3">
                    {(["PHONE", "WHATSAPP"] as const).map((method) => (
                      <label
                        key={method}
                        className={clsx(
                          "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-semibold",
                          values.preferred_contact_method === method ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"
                        )}
                      >
                        <input type="radio" value={method} className="sr-only" {...register("preferred_contact_method")} />
                        {method === "PHONE" ? <PhoneCall size={16} /> : <span className="text-base">💬</span>}
                        {method === "PHONE" ? "Phone call" : "WhatsApp"}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">How can we help? (optional)</label>
                  <textarea className="input" rows={4} {...register("message")} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="mb-2 font-semibold text-slate-700">Please check your details</p>
                  <dl className="grid grid-cols-2 gap-2 text-slate-600">
                    <dt className="text-slate-400">Name</dt><dd>{values.first_name} {values.last_name}</dd>
                    <dt className="text-slate-400">Mobile</dt><dd>{values.phone}</dd>
                    <dt className="text-slate-400">Email</dt><dd>{values.email || "—"}</dd>
                    <dt className="text-slate-400">City</dt><dd>{values.city || "—"}</dd>
                    <dt className="text-slate-400">Contact by</dt><dd>{values.preferred_contact_method === "WHATSAPP" ? "WhatsApp" : "Phone"}</dd>
                  </dl>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" {...register("consent_given")} />
                  I consent to being contacted about this enquiry and to my details being stored for that purpose.
                </label>
                <FieldError message={errors.consent_given?.message} />
              </div>
            )}

            {/* Honeypot field — kept visually hidden from real users */}
            <div className="hidden" aria-hidden="true">
              <label>Website</label>
              <input tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>

            {serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}

            <div className="flex justify-between gap-3 pt-2">
              {step > 0 ? (
                <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={() => void next()}>
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? "Submitting…" : "Submit enquiry"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
