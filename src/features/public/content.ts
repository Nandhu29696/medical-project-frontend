/**
 * Public-site copy. Everything here is DEMO placeholder content: product claims,
 * testimonials and contact details must be replaced with client-approved text
 * before launch (see README — no unapproved medical claims).
 */

export const CONTACT = {
  phone: "+91 00000 00000",
  whatsapp: "https://wa.me/910000000000",
  email: "care@mediance.demo",
  address: "Demo Clinic, 1 Example Road, Bengaluru 560001",
  hours: [
    { days: "Mon – Fri", time: "9:00 AM – 7:00 PM" },
    { days: "Saturday", time: "9:00 AM – 2:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
};

export const FAQS = [
  {
    question: "How do I place an enquiry?",
    answer: "Use the Enquire now button, fill in the short form and our care team will call you back.",
  },
  {
    question: "Can I talk to a doctor before deciding?",
    answer:
      "Yes. Create a free patient account and book an in-person, video or phone consultation with one of our doctors.",
  },
  {
    question: "Is my information safe?",
    answer:
      "Your details are used only to respond to your enquiry and to provide care. Access to medical records is restricted by role.",
  },
  {
    question: "Where can I see my prescriptions and reports?",
    answer: "Sign in and open My Health — your visits, prescriptions, lab reports and vitals are all there.",
  },
  {
    question: "Do you deliver across India?",
    answer: "Demo answer — replace with the client's approved delivery coverage and timelines.",
  },
  {
    question: "Who should not use this product?",
    answer: "Demo answer — replace with the client-approved precautions. Always consult a doctor first.",
  },
];

export const TESTIMONIALS = [
  {
    name: "R. Kumar",
    city: "Bengaluru",
    quote: "Booking a video consultation took two minutes, and my reports were in the portal the same day.",
  },
  {
    name: "L. Iyer",
    city: "Chennai",
    quote: "The care team called back quickly and explained everything clearly before I decided.",
  },
  {
    name: "S. Patel",
    city: "Pune",
    quote: "I like seeing my visits and prescriptions in one place instead of a pile of papers.",
  },
];

export const BENEFIT_CARDS = [
  { key: "focus.sleep", tone: "accent", text: "Demo copy — describe client-approved support for sleep routines." },
  { key: "focus.focus", tone: "brand", text: "Demo copy — describe client-approved support for focus and memory." },
  { key: "focus.stress", tone: "blue", text: "Demo copy — describe client-approved support for stress and mood." },
  { key: "focus.headache", tone: "amber", text: "Demo copy — describe client-approved guidance for headache care." },
] as const;
