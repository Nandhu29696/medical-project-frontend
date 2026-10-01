export interface UserBrief {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

export interface Doctor {
  id: string;
  user: UserBrief;
  specialization: string;
  qualification: string;
  registration_number: string;
  years_of_experience: number;
  clinic_name: string;
  consultation_fee: string;
  bio: string;
  photo: string | null;
  is_available: boolean;
  created_at: string;
}

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNDISCLOSED";

export interface Patient {
  id: string;
  patient_code: string;
  user: UserBrief;
  date_of_birth: string | null;
  age: number | null;
  gender: Gender;
  blood_group: string;
  address: string;
  city: string;
  state: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history: string;
  allergies: string;
  current_medications: string;
  photo: string | null;
  assigned_doctor: UserBrief | null;
  source_lead: string | null;
  source_lead_number: string | null;
  created_at: string;
  updated_at: string;
}

export type ConsultationStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type ConsultationMode = "IN_PERSON" | "VIDEO" | "PHONE";

export interface Consultation {
  id: string;
  patient: UserBrief;
  doctor: UserBrief;
  scheduled_at: string;
  mode: ConsultationMode;
  status: ConsultationStatus;
  chief_complaint: string;
  clinical_notes: string;
  recommendations: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalSummary {
  patients: number;
  doctors: number;
  upcoming_consultations: number;
  completed_consultations: number;
  total_consultations: number;
  today_consultations: number;
  follow_ups_due: number;
}

export interface PrescriptionItem {
  id?: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  sort_order?: number;
}

export interface ConsultationDetail extends Consultation {
  patient_profile_id: string | null;
  patient_code: string | null;
  doctor_specialization: string | null;
  prescription_items: PrescriptionItem[];
}

export type DocumentType = "LAB_REPORT" | "SCAN" | "PRESCRIPTION" | "DISCHARGE_SUMMARY" | "OTHER";

export interface MedicalDocument {
  id: string;
  patient: string;
  patient_name: string;
  title: string;
  document_type: DocumentType;
  file: string;
  file_name: string | null;
  file_size: number | null;
  notes: string;
  uploaded_by_name: string | null;
  created_at: string;
}

export interface VitalReading {
  id: string;
  patient: string;
  recorded_at: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  weight_kg: string | null;
  sleep_hours: string | null;
  notes: string;
  recorded_by_name: string | null;
  created_at: string;
}

export interface Slot {
  start: string;
  available: boolean;
}

export interface PublicDoctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  years_of_experience: number;
  clinic_name: string;
  bio: string;
  photo: string | null;
  is_available: boolean;
}
