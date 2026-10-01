import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, Paginated } from "@/types/common";
import type {
  ClinicalSummary,
  Consultation,
  ConsultationDetail,
  Doctor,
  MedicalDocument,
  Patient,
  PrescriptionItem,
  PublicDoctor,
  Slot,
  VitalReading,
} from "@/types/clinical";

export async function getDoctors(params: Record<string, string> = {}): Promise<Paginated<Doctor>> {
  const response = await apiClient.get<ApiSuccess<Paginated<Doctor>>>("/doctors/", { params });
  return response.data.data;
}

export async function getPatients(params: Record<string, string> = {}): Promise<Paginated<Patient>> {
  const response = await apiClient.get<ApiSuccess<Paginated<Patient>>>("/patients/", { params });
  return response.data.data;
}

export async function getPatient(id: string): Promise<Patient> {
  const response = await apiClient.get<ApiSuccess<Patient>>(`/patients/${id}/`);
  return response.data.data;
}

export async function getMyPatientProfile(): Promise<Patient> {
  const response = await apiClient.get<ApiSuccess<Patient>>("/patients/me/");
  return response.data.data;
}

export async function updatePatientClinical(
  id: string,
  payload: Pick<Patient, "medical_history" | "allergies" | "current_medications">
): Promise<Patient> {
  const response = await apiClient.patch<ApiSuccess<Patient>>(`/patients/${id}/`, payload);
  return response.data.data;
}

export async function getConsultations(
  params: Record<string, string> = {}
): Promise<Paginated<ConsultationDetail>> {
  const response = await apiClient.get<ApiSuccess<Paginated<ConsultationDetail>>>("/consultations/", { params });
  return response.data.data;
}

export async function getConsultation(id: string): Promise<ConsultationDetail> {
  const response = await apiClient.get<ApiSuccess<ConsultationDetail>>(`/consultations/${id}/`);
  return response.data.data;
}

export async function createConsultation(payload: {
  patient_id: string;
  doctor_id?: string;
  scheduled_at: string;
  mode: string;
  chief_complaint: string;
}): Promise<Consultation> {
  const response = await apiClient.post<ApiSuccess<Consultation>>("/consultations/", payload);
  return response.data.data;
}

export async function updateConsultation(
  id: string,
  payload: Partial<Pick<ConsultationDetail, "status" | "clinical_notes" | "recommendations" | "follow_up_date">>
): Promise<ConsultationDetail> {
  const response = await apiClient.patch<ApiSuccess<ConsultationDetail>>(`/consultations/${id}/`, payload);
  return response.data.data;
}

export async function savePrescription(id: string, items: PrescriptionItem[]): Promise<ConsultationDetail> {
  const response = await apiClient.post<ApiSuccess<ConsultationDetail>>(`/consultations/${id}/prescription/`, {
    items,
  });
  return response.data.data;
}

export async function getDoctorSlots(
  doctorProfileId: string,
  date: string
): Promise<{ doctor_id: string; slots: Slot[] }> {
  const response = await apiClient.get<ApiSuccess<{ doctor_id: string; slots: Slot[] }>>(
    `/doctors/${doctorProfileId}/slots/`,
    { params: { date } }
  );
  return response.data.data;
}

export async function bookConsultation(payload: {
  doctor_id: string;
  scheduled_at: string;
  mode: string;
  chief_complaint: string;
}): Promise<ConsultationDetail> {
  const response = await apiClient.post<ApiSuccess<ConsultationDetail>>("/consultations/book/", payload);
  return response.data.data;
}

export async function getClinicalSummary(): Promise<ClinicalSummary> {
  const response = await apiClient.get<ApiSuccess<ClinicalSummary>>("/clinical/summary/");
  return response.data.data;
}

export async function getMyDoctorProfile(): Promise<Doctor> {
  const response = await apiClient.get<ApiSuccess<Doctor>>("/doctors/me/");
  return response.data.data;
}

export async function updateMyDoctorProfile(payload: FormData | Partial<Doctor>): Promise<Doctor> {
  const response = await apiClient.patch<ApiSuccess<Doctor>>("/doctors/me/", payload);
  return response.data.data;
}

export async function uploadMyPatientPhoto(file: File): Promise<Patient> {
  const form = new FormData();
  form.append("photo", file);
  const response = await apiClient.post<ApiSuccess<Patient>>("/patients/me/photo/", form);
  return response.data.data;
}

export async function uploadPatientPhoto(patientId: string, file: File): Promise<Patient> {
  const form = new FormData();
  form.append("photo", file);
  const response = await apiClient.patch<ApiSuccess<Patient>>(`/patients/${patientId}/`, form);
  return response.data.data;
}

export async function getDocuments(params: Record<string, string> = {}): Promise<Paginated<MedicalDocument>> {
  const response = await apiClient.get<ApiSuccess<Paginated<MedicalDocument>>>("/documents/", { params });
  return response.data.data;
}

export async function uploadDocument(payload: {
  patient: string;
  title: string;
  document_type: string;
  notes: string;
  file: File;
}): Promise<MedicalDocument> {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => form.append(key, value));
  const response = await apiClient.post<ApiSuccess<MedicalDocument>>("/documents/", form);
  return response.data.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}/`);
}

export async function getVitals(params: Record<string, string> = {}): Promise<Paginated<VitalReading>> {
  const response = await apiClient.get<ApiSuccess<Paginated<VitalReading>>>("/vitals/", {
    params: { page_size: "100", ordering: "recorded_at", ...params },
  });
  return response.data.data;
}

export async function addVital(
  payload: Partial<Omit<VitalReading, "id">> & { patient: string; recorded_at: string }
): Promise<VitalReading> {
  const response = await apiClient.post<ApiSuccess<VitalReading>>("/vitals/", payload);
  return response.data.data;
}

export async function getPublicDoctors(): Promise<PublicDoctor[]> {
  const response = await apiClient.get<PublicDoctor[]>("/public/doctors/");
  return response.data;
}
