import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "ta";
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
];

const en = {
  "nav.home": "Home",
  "nav.product": "Products",
  "nav.benefits": "Benefits",
  "nav.howItWorks": "How it works",
  "nav.doctors": "Doctors",
  "nav.faq": "FAQ",
  "nav.contact": "Contact",
  "nav.enquire": "Enquire now",
  "nav.login": "Sign in",
  "nav.register": "Create account",
  "nav.dashboard": "Dashboard",
  "nav.myHealth": "My Health",
  "nav.bookConsultation": "Book consultation",
  "nav.patients": "Patients",
  "nav.consultations": "Consultations",
  "nav.leads": "Leads",
  "nav.followups": "Follow-ups",
  "nav.products": "Products",
  "nav.campaigns": "Campaigns",
  "nav.reports": "Reports",
  "nav.users": "Users & Roles",
  "nav.audit": "Audit log",
  "nav.theme": "Theme & branding",
  "nav.messaging": "Email & WhatsApp",
  "nav.doctorHome": "My Day",
  "nav.profile": "My profile",
  "nav.logout": "Sign out",
  "nav.group.care": "Care",
  "nav.group.sales": "Sales CRM",
  "nav.group.admin": "Administration",
  "hero.eyebrow": "Neuro wellness, guided by doctors",
  "hero.title": "Care for your mind, backed by specialists",
  "hero.subtitle":
    "Enquire about Mediance Neuro Life, talk to our care team, and book a consultation with a neurologist, psychiatrist or physician — all in one place.",
  "hero.ctaPrimary": "Enquire now",
  "hero.ctaSecondary": "Book a consultation",
  "hero.whatsapp": "WhatsApp us",
  "trust.doctors": "Specialist doctors",
  "trust.secure": "Private & secure",
  "trust.delivery": "Delivery across India",
  "trust.support": "Care-team support",
  "section.howItWorks": "How it works",
  "section.howItWorksSub": "From first enquiry to follow-up care in four simple steps.",
  "section.product": "Meet Mediance Neuro Life",
  "section.focusAreas": "Areas we focus on",
  "section.focusAreasSub": "Our doctors and care team support you across everyday neuro-wellness concerns.",
  "section.doctors": "Meet our doctors",
  "section.doctorsSub": "Experienced specialists who review your concerns and guide your care.",
  "section.testimonials": "What people say",
  "section.faq": "Frequently asked questions",
  "section.ctaTitle": "Ready to take the first step?",
  "section.ctaSub": "Send an enquiry or create a free patient account to book a consultation.",
  "step.1.title": "Send an enquiry",
  "step.1.text": "Share your details and concern through our short form.",
  "step.2.title": "Talk to our team",
  "step.2.text": "A care advisor calls you back to understand your needs.",
  "step.3.title": "Consult a doctor",
  "step.3.text": "Book an in-person, video or phone consultation.",
  "step.4.title": "Ongoing care",
  "step.4.text": "Track visits, prescriptions and reports in your portal.",
  "focus.sleep": "Sleep",
  "focus.focus": "Focus & memory",
  "focus.stress": "Stress & mood",
  "focus.headache": "Headache care",
  "common.viewDetails": "View details",
  "common.learnMore": "Learn more",
  "common.years": "years experience",
  "common.demoNotice": "Demo content — replace with client-approved information.",
  "common.search": "Search",
  "common.loading": "Loading…",
  "footer.tagline": "Neuro wellness enquiries, doctor consultations and a secure patient portal.",
  "footer.explore": "Explore",
  "footer.care": "Care",
  "footer.contact": "Contact",
  "footer.disclaimer":
    "This website does not provide medical advice. Always consult a qualified doctor. Product information shown is demo content pending client approval.",
  "login.title": "Welcome back",
  "login.subtitle": "Sign in as admin, sales staff, doctor or patient.",
  "login.email": "Email",
  "login.password": "Password",
  "login.submit": "Sign in",
  "login.noAccount": "New patient?",
  "login.createAccount": "Create an account",
} as const;

export type TranslationKey = keyof typeof en;
type Dictionary = Partial<Record<TranslationKey, string>>;

const hi: Dictionary = {
  "nav.home": "होम",
  "nav.product": "उत्पाद",
  "nav.benefits": "लाभ",
  "nav.howItWorks": "कैसे काम करता है",
  "nav.doctors": "डॉक्टर",
  "nav.faq": "सामान्य प्रश्न",
  "nav.contact": "संपर्क",
  "nav.enquire": "पूछताछ करें",
  "nav.login": "साइन इन",
  "nav.register": "खाता बनाएं",
  "nav.dashboard": "डैशबोर्ड",
  "nav.myHealth": "मेरा स्वास्थ्य",
  "nav.bookConsultation": "परामर्श बुक करें",
  "nav.patients": "मरीज़",
  "nav.consultations": "परामर्श",
  "nav.leads": "लीड्स",
  "nav.followups": "फॉलो-अप",
  "nav.products": "उत्पाद",
  "nav.campaigns": "अभियान",
  "nav.reports": "रिपोर्ट",
  "nav.users": "उपयोगकर्ता और भूमिकाएँ",
  "nav.audit": "ऑडिट लॉग",
  "nav.theme": "थीम और ब्रांडिंग",
  "nav.messaging": "ईमेल और WhatsApp",
  "nav.doctorHome": "मेरा दिन",
  "nav.profile": "मेरी प्रोफ़ाइल",
  "nav.logout": "साइन आउट",
  "nav.group.care": "देखभाल",
  "nav.group.sales": "सेल्स CRM",
  "nav.group.admin": "प्रशासन",
  "hero.eyebrow": "डॉक्टरों के मार्गदर्शन में न्यूरो वेलनेस",
  "hero.title": "आपके मन की देखभाल, विशेषज्ञों के साथ",
  "hero.subtitle":
    "Mediance Neuro Life के बारे में पूछताछ करें, हमारी केयर टीम से बात करें और न्यूरोलॉजिस्ट, मनोचिकित्सक या फिजिशियन के साथ परामर्श बुक करें — सब एक ही जगह।",
  "hero.ctaPrimary": "पूछताछ करें",
  "hero.ctaSecondary": "परामर्श बुक करें",
  "hero.whatsapp": "WhatsApp करें",
  "trust.doctors": "विशेषज्ञ डॉक्टर",
  "trust.secure": "निजी और सुरक्षित",
  "trust.delivery": "पूरे भारत में डिलीवरी",
  "trust.support": "केयर टीम सहायता",
  "section.howItWorks": "यह कैसे काम करता है",
  "section.howItWorksSub": "पहली पूछताछ से फॉलो-अप देखभाल तक, चार आसान चरण।",
  "section.product": "Mediance Neuro Life से मिलें",
  "section.focusAreas": "हमारे मुख्य क्षेत्र",
  "section.focusAreasSub": "हमारे डॉक्टर और केयर टीम रोज़मर्रा की न्यूरो-वेलनेस चिंताओं में आपकी मदद करते हैं।",
  "section.doctors": "हमारे डॉक्टरों से मिलें",
  "section.doctorsSub": "अनुभवी विशेषज्ञ जो आपकी समस्या समझकर देखभाल का मार्गदर्शन करते हैं।",
  "section.testimonials": "लोग क्या कहते हैं",
  "section.faq": "अक्सर पूछे जाने वाले प्रश्न",
  "section.ctaTitle": "पहला कदम उठाने के लिए तैयार हैं?",
  "section.ctaSub": "पूछताछ भेजें या परामर्श बुक करने के लिए मुफ़्त मरीज़ खाता बनाएं।",
  "step.1.title": "पूछताछ भेजें",
  "step.1.text": "छोटे फ़ॉर्म में अपना विवरण और समस्या बताएं।",
  "step.2.title": "हमारी टीम से बात करें",
  "step.2.text": "केयर सलाहकार आपकी ज़रूरत समझने के लिए कॉल करेंगे।",
  "step.3.title": "डॉक्टर से परामर्श",
  "step.3.text": "क्लिनिक, वीडियो या फ़ोन परामर्श बुक करें।",
  "step.4.title": "निरंतर देखभाल",
  "step.4.text": "अपने पोर्टल में विज़िट, प्रिस्क्रिप्शन और रिपोर्ट देखें।",
  "focus.sleep": "नींद",
  "focus.focus": "एकाग्रता और स्मृति",
  "focus.stress": "तनाव और मूड",
  "focus.headache": "सिरदर्द देखभाल",
  "common.viewDetails": "विवरण देखें",
  "common.learnMore": "और जानें",
  "common.years": "वर्ष का अनुभव",
  "common.demoNotice": "डेमो सामग्री — क्लाइंट-स्वीकृत जानकारी से बदलें।",
  "common.search": "खोजें",
  "common.loading": "लोड हो रहा है…",
  "footer.tagline": "न्यूरो वेलनेस पूछताछ, डॉक्टर परामर्श और सुरक्षित मरीज़ पोर्टल।",
  "footer.explore": "जानें",
  "footer.care": "देखभाल",
  "footer.contact": "संपर्क",
  "footer.disclaimer":
    "यह वेबसाइट चिकित्सा सलाह नहीं देती। हमेशा योग्य डॉक्टर से परामर्श करें। दिखाई गई उत्पाद जानकारी डेमो सामग्री है।",
  "login.title": "फिर से स्वागत है",
  "login.subtitle": "एडमिन, सेल्स, डॉक्टर या मरीज़ के रूप में साइन इन करें।",
  "login.email": "ईमेल",
  "login.password": "पासवर्ड",
  "login.submit": "साइन इन",
  "login.noAccount": "नए मरीज़?",
  "login.createAccount": "खाता बनाएं",
};

const ta: Dictionary = {
  "nav.home": "முகப்பு",
  "nav.product": "தயாரிப்பு",
  "nav.benefits": "நன்மைகள்",
  "nav.howItWorks": "எப்படி செயல்படுகிறது",
  "nav.doctors": "மருத்துவர்கள்",
  "nav.faq": "கேள்விகள்",
  "nav.contact": "தொடர்பு",
  "nav.enquire": "விசாரிக்கவும்",
  "nav.login": "உள்நுழை",
  "nav.register": "கணக்கு உருவாக்கு",
  "nav.dashboard": "டாஷ்போர்டு",
  "nav.myHealth": "என் ஆரோக்கியம்",
  "nav.bookConsultation": "ஆலோசனை பதிவு",
  "nav.patients": "நோயாளிகள்",
  "nav.consultations": "ஆலோசனைகள்",
  "nav.leads": "லீட்கள்",
  "nav.followups": "பின்தொடர்தல்",
  "nav.products": "தயாரிப்புகள்",
  "nav.campaigns": "பிரச்சாரங்கள்",
  "nav.reports": "அறிக்கைகள்",
  "nav.users": "பயனர்கள் & பாத்திரங்கள்",
  "nav.audit": "தணிக்கை பதிவு",
  "nav.theme": "தீம் & பிராண்டிங்",
  "nav.messaging": "மின்னஞ்சல் & WhatsApp",
  "nav.doctorHome": "என் நாள்",
  "nav.profile": "என் சுயவிவரம்",
  "nav.logout": "வெளியேறு",
  "nav.group.care": "பராமரிப்பு",
  "nav.group.sales": "விற்பனை CRM",
  "nav.group.admin": "நிர்வாகம்",
  "hero.eyebrow": "மருத்துவர் வழிகாட்டுதலுடன் நரம்பு நலம்",
  "hero.title": "நிபுணர்களின் துணையுடன் உங்கள் மனநலப் பராமரிப்பு",
  "hero.subtitle":
    "Mediance Neuro Life பற்றி விசாரிக்கவும், எங்கள் பராமரிப்பு குழுவுடன் பேசவும், நரம்பியல், மனநல அல்லது பொது மருத்துவருடன் ஆலோசனை பதிவு செய்யவும் — அனைத்தும் ஒரே இடத்தில்.",
  "hero.ctaPrimary": "விசாரிக்கவும்",
  "hero.ctaSecondary": "ஆலோசனை பதிவு",
  "hero.whatsapp": "WhatsApp செய்யுங்கள்",
  "trust.doctors": "நிபுணர் மருத்துவர்கள்",
  "trust.secure": "தனிப்பட்ட & பாதுகாப்பானது",
  "trust.delivery": "இந்தியா முழுவதும் டெலிவரி",
  "trust.support": "பராமரிப்பு குழு ஆதரவு",
  "section.howItWorks": "இது எப்படி செயல்படுகிறது",
  "section.howItWorksSub": "முதல் விசாரணையிலிருந்து பின்தொடர் பராமரிப்பு வரை நான்கு எளிய படிகள்.",
  "section.product": "Mediance Neuro Life-ஐ அறிந்துகொள்ளுங்கள்",
  "section.focusAreas": "நாங்கள் கவனம் செலுத்தும் பகுதிகள்",
  "section.focusAreasSub": "அன்றாட நரம்பு நலக் கவலைகளில் எங்கள் மருத்துவர்கள் உங்களுக்கு உதவுகிறார்கள்.",
  "section.doctors": "எங்கள் மருத்துவர்கள்",
  "section.doctorsSub": "உங்கள் பிரச்சினையை ஆய்வு செய்து வழிகாட்டும் அனுபவமிக்க நிபுணர்கள்.",
  "section.testimonials": "மக்கள் சொல்வது",
  "section.faq": "அடிக்கடி கேட்கப்படும் கேள்விகள்",
  "section.ctaTitle": "முதல் அடியை எடுக்கத் தயாரா?",
  "section.ctaSub": "விசாரணை அனுப்புங்கள் அல்லது ஆலோசனை பதிவு செய்ய இலவச கணக்கை உருவாக்குங்கள்.",
  "step.1.title": "விசாரணை அனுப்புங்கள்",
  "step.1.text": "சிறிய படிவத்தில் உங்கள் விவரங்களைப் பகிருங்கள்.",
  "step.2.title": "எங்கள் குழுவுடன் பேசுங்கள்",
  "step.2.text": "பராமரிப்பு ஆலோசகர் உங்களை அழைப்பார்.",
  "step.3.title": "மருத்துவரை அணுகுங்கள்",
  "step.3.text": "நேரில், வீடியோ அல்லது தொலைபேசி ஆலோசனை பதிவு செய்யுங்கள்.",
  "step.4.title": "தொடர் பராமரிப்பு",
  "step.4.text": "வருகைகள், மருந்துச்சீட்டுகள், அறிக்கைகளை உங்கள் போர்ட்டலில் காணுங்கள்.",
  "focus.sleep": "தூக்கம்",
  "focus.focus": "கவனம் & நினைவாற்றல்",
  "focus.stress": "மன அழுத்தம் & மனநிலை",
  "focus.headache": "தலைவலி பராமரிப்பு",
  "common.viewDetails": "விவரங்கள்",
  "common.learnMore": "மேலும் அறிய",
  "common.years": "ஆண்டு அனுபவம்",
  "common.demoNotice": "டெமோ உள்ளடக்கம் — அங்கீகரிக்கப்பட்ட தகவலால் மாற்றவும்.",
  "common.search": "தேடு",
  "common.loading": "ஏற்றுகிறது…",
  "footer.tagline": "நரம்பு நல விசாரணைகள், மருத்துவர் ஆலோசனைகள் மற்றும் பாதுகாப்பான நோயாளர் போர்ட்டல்.",
  "footer.explore": "ஆராய",
  "footer.care": "பராமரிப்பு",
  "footer.contact": "தொடர்பு",
  "footer.disclaimer":
    "இந்த இணையதளம் மருத்துவ ஆலோசனை வழங்காது. எப்போதும் தகுதியான மருத்துவரை அணுகவும். காட்டப்படும் தயாரிப்பு தகவல் டெமோ உள்ளடக்கம்.",
  "login.title": "மீண்டும் வருக",
  "login.subtitle": "நிர்வாகி, விற்பனை, மருத்துவர் அல்லது நோயாளியாக உள்நுழையுங்கள்.",
  "login.email": "மின்னஞ்சல்",
  "login.password": "கடவுச்சொல்",
  "login.submit": "உள்நுழை",
  "login.noAccount": "புதிய நோயாளியா?",
  "login.createAccount": "கணக்கு உருவாக்கு",
};

const DICTIONARIES: Record<Language, Dictionary> = { en, hi, ta };
const STORAGE_KEY = "mediance_language";

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi" || saved === "ta") return saved;
  } catch {
    /* ignore */
  }
  return "en";
}

interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nValue>({
  language: "en",
  setLanguage: () => {},
  t: (key) => en[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const t = (key: TranslationKey) => DICTIONARIES[language][key] ?? en[key];
  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
