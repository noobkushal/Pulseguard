/**
 * PulseGuard AI — Backend API Service Layer
 * Connects the React frontend to the FastAPI backend at localhost:8000.
 */

const API_BASE = "http://localhost:8000";

// ─── Types matching backend response ───

export interface BackendPatient {
  id: number;
  timestamp: string;
  patient_id: string;
  heart_rate: number;
  spo2: number;
  resp_rate: number;
  temperature: number;
  bp_systolic: number;
  bp_diastolic: number;
  shock_index: number;
  news2_score: number;
  news2_level: string;
  risk_score: number;
  alert_level: string;
}

export interface BackendAlert {
  id: number;
  timestamp: string;
  patient_id: string;
  alert_level: string;
  risk_score: number;
  news2_score: number;
  acknowledged: number;
  nurse_id: string | null;
  acknowledged_at: string | null;
}

export interface RiskFactor {
  vital: string;
  contribution: number;
  current_value: number;
  normal_range: string;
}

export interface ExplanationResponse {
  patient_id: string;
  risk_score: number;
  top_factors: RiskFactor[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

// ─── API Functions ───

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** GET /api/health — Check if backend is running */
export async function checkHealth(): Promise<HealthResponse | null> {
  return fetchJSON<HealthResponse>(`${API_BASE}/api/health`);
}

/** GET /api/patients — All patients, most recent reading each */
export async function fetchPatients(): Promise<BackendPatient[]> {
  const data = await fetchJSON<BackendPatient[]>(`${API_BASE}/api/patients`);
  return data || [];
}

/** GET /api/patient/{id}/latest — Single patient latest reading */
export async function fetchPatientLatest(patientId: string): Promise<BackendPatient | null> {
  return fetchJSON<BackendPatient>(`${API_BASE}/api/patient/${patientId}/latest`);
}

/** GET /api/patient/{id}/history — Last 100 readings */
export async function fetchPatientHistory(patientId: string): Promise<BackendPatient[]> {
  const data = await fetchJSON<BackendPatient[]>(`${API_BASE}/api/patient/${patientId}/history`);
  return data || [];
}

/** GET /api/patient/{id}/explanation — Risk factor breakdown */
export async function fetchExplanation(patientId: string): Promise<ExplanationResponse | null> {
  return fetchJSON<ExplanationResponse>(`${API_BASE}/api/patient/${patientId}/explanation`);
}

/** GET /api/alerts/history — Last 50 alerts */
export async function fetchAlertHistory(): Promise<BackendAlert[]> {
  const data = await fetchJSON<BackendAlert[]>(`${API_BASE}/api/alerts/history`);
  return data || [];
}

/** POST /api/patient/{id}/acknowledge — Acknowledge an alert */
export async function acknowledgePatientAlert(
  patientId: string,
  nurseId: string,
  note: string = ""
): Promise<{ status: string; patient_id: string; nurse_id: string; acknowledged_at: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/patient/${patientId}/acknowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nurse_id: nurseId, note }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
