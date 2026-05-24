import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchPatients as apiFetchPatients,
  fetchAlertHistory,
  checkHealth,
  acknowledgePatientAlert,
} from '../services/api';
import type { BackendPatient, BackendAlert } from '../services/api';

export interface VitalHistory {
  timestamp: string;
  hr: number;
  spo2: number;
  bpSys: number;
  bpDia: number;
  rr: number;
  temp: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bed: string;
  room: string;
  condition: string;
  status: 'Stable' | 'Guarded' | 'Critical';
  vitals: {
    hr: number;
    spo2: number;
    bpSys: number;
    bpDia: number;
    rr: number;
    temp: number;
  };
  history: VitalHistory[];
  deviceStatus: 'Connected' | 'Disconnected' | 'Calibrating';
  signalStrength: number;
  batteryLevel: number;
  aiRisk: {
    stabilityScore: number;
    deteriorationProbability: number;
    shockPrediction: number;
  };
  admissionDate: string;
  diagnosis: string;
  notes: string[];
  // Backend-sourced fields
  shockIndex: number;
  news2Score: number;
  news2Level: string;
  alertLevel: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  type: 'Danger' | 'Warning' | 'Info';
  metric: 'HR' | 'SPO2' | 'BP' | 'RR' | 'TEMP' | 'DEVICE';
  value: string;
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
}

export interface IoTDevice {
  id: string;
  bed: string;
  type: 'Multi-Parameter Monitor' | 'Infusion Pump' | 'Ventilator Telemetry' | 'ECG Patch';
  status: 'Online' | 'Offline' | 'Maintenance';
  firmware: string;
  signal: number;
  lastSync: string;
  alertsCount: number;
}

interface PulseGuardContextType {
  patients: Patient[];
  alerts: Alert[];
  devices: IoTDevice[];
  systemStats: {
    activeAlertsCount: number;
    criticalCount: number;
    stableCount: number;
    occupancyRate: number;
    avgRiskScore: number;
  };
  dismissAlert: (alertId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  triggerEmergency: (patientId: string) => void;
  resolveEmergency: (patientId: string) => void;
  toggleDeviceConnection: (deviceId: string) => void;
  addNote: (patientId: string, note: string) => void;
  systemStatus: 'Optimal' | 'Alert' | 'Emergency';
  darkMode: boolean;
  toggleDarkMode: () => void;
  backendConnected: boolean;
  hiddenAlertIds: string[];
  hideAlertFromDashboard: (alertId: string) => void;
}

const PulseGuardContext = createContext<PulseGuardContextType | undefined>(undefined);

// ─── Static patient metadata (enriches backend data) ───
const PATIENT_META: Record<string, Omit<Patient, 'vitals' | 'history' | 'status' | 'aiRisk' | 'shockIndex' | 'news2Score' | 'news2Level' | 'alertLevel'>> = {
  P001: {
    id: 'P001', name: 'Jameson, Sarah', age: 64, gender: 'Female',
    bed: 'ICU-101', room: 'Room A', condition: 'Cardiac Post-Op',
    deviceStatus: 'Connected', signalStrength: 95, batteryLevel: 88,
    admissionDate: '2026-05-15',
    diagnosis: 'Coronary artery bypass graft (CABG) recovery.',
    notes: ['Patient resting comfortably.', 'Post-op bleeding minimal.', 'ECG shows normal sinus rhythm.'],
  },
  P002: {
    id: 'P002', name: 'Rodriguez, Luis', age: 52, gender: 'Male',
    bed: 'ICU-102', room: 'Room A', condition: 'Sepsis Surveillance',
    deviceStatus: 'Connected', signalStrength: 82, batteryLevel: 42,
    admissionDate: '2026-05-17',
    diagnosis: 'Severe sepsis secondary to urinary tract infection.',
    notes: ['Fever spiking.', 'IV antibiotics administered at 10:00.', 'Fluid resuscitation ongoing.'],
  },
  P003: {
    id: 'P003', name: 'Thorne, Marcus', age: 71, gender: 'Male',
    bed: 'ICU-103', room: 'Room B', condition: 'Acute Resp. Failure',
    deviceStatus: 'Connected', signalStrength: 91, batteryLevel: 94,
    admissionDate: '2026-05-18',
    diagnosis: 'Exacerbation of COPD with severe hypoxemia.',
    notes: ['SPO2 falling on nasal cannula.', 'BIPAP set up and running.', 'Emergency team briefed on potential intubation.'],
  },
  P004: {
    id: 'P004', name: 'Vance, Elena', age: 45, gender: 'Female',
    bed: 'ICU-104', room: 'Room B', condition: 'Trauma Monitoring',
    deviceStatus: 'Connected', signalStrength: 98, batteryLevel: 100,
    admissionDate: '2026-05-16',
    diagnosis: 'Observation following motor vehicle accident.',
    notes: ['Mild thoracic bruising.', 'Pain managed with non-opioids.', 'Neurological signs normal.'],
  },
  P005: {
    id: 'P005', name: 'Chen, Wei', age: 58, gender: 'Male',
    bed: 'ICU-105', room: 'Room C', condition: 'Renal Insufficiency',
    deviceStatus: 'Connected', signalStrength: 89, batteryLevel: 65,
    admissionDate: '2026-05-14',
    diagnosis: 'Acute kidney injury following dehydration.',
    notes: ['Urine output recovering.', 'Creatinine levels decreasing.', 'Dietary fluid restriction active.'],
  },
};

// Helper to generate initial history
const generateHistory = (baseVitals: any): VitalHistory[] => {
  const history: VitalHistory[] = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10000);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    history.push({
      timestamp: timeStr,
      hr: Math.round(baseVitals.hr + (Math.random() * 6 - 3)),
      spo2: Math.min(100, Math.round(baseVitals.spo2 + (Math.random() * 2 - 1))),
      bpSys: Math.round(baseVitals.bpSys + (Math.random() * 8 - 4)),
      bpDia: Math.round(baseVitals.bpDia + (Math.random() * 6 - 3)),
      rr: Math.round(baseVitals.rr + (Math.random() * 2 - 1)),
      temp: parseFloat((baseVitals.temp + (Math.random() * 0.4 - 0.2)).toFixed(1)),
    });
  }
  return history;
};

const initialDevices: IoTDevice[] = [
  { id: 'DEV-101', bed: 'ICU-101', type: 'Multi-Parameter Monitor', status: 'Online', firmware: 'v4.12.8', signal: 95, lastSync: 'Just now', alertsCount: 0 },
  { id: 'DEV-102', bed: 'ICU-102', type: 'Multi-Parameter Monitor', status: 'Online', firmware: 'v4.12.8', signal: 82, lastSync: 'Just now', alertsCount: 1 },
  { id: 'DEV-103', bed: 'ICU-103', type: 'Ventilator Telemetry', status: 'Online', firmware: 'v2.8.4', signal: 91, lastSync: 'Just now', alertsCount: 0 },
  { id: 'DEV-104', bed: 'ICU-104', type: 'Multi-Parameter Monitor', status: 'Online', firmware: 'v4.12.8', signal: 98, lastSync: 'Just now', alertsCount: 0 },
  { id: 'DEV-105', bed: 'ICU-105', type: 'ECG Patch', status: 'Online', firmware: 'v1.4.2', signal: 89, lastSync: 'Just now', alertsCount: 0 },
];

// Convert backend alert_level to frontend status
function mapAlertLevel(alertLevel: string): 'Stable' | 'Guarded' | 'Critical' {
  if (alertLevel === 'RED') return 'Critical';
  if (alertLevel === 'ORANGE' || alertLevel === 'YELLOW') return 'Guarded';
  return 'Stable';
}

function mapAlertType(alertLevel: string): 'Danger' | 'Warning' | 'Info' {
  if (alertLevel === 'RED') return 'Danger';
  if (alertLevel === 'ORANGE') return 'Warning';
  return 'Info';
}

// Merge backend data with frontend metadata
function mergePatientData(
  backendPatients: BackendPatient[],
  prevPatients: Patient[]
): Patient[] {
  return backendPatients.map(bp => {
    const meta = PATIENT_META[bp.patient_id];
    const prev = prevPatients.find(p => p.id === bp.patient_id);

    if (!meta) {
      // Unknown patient from backend - create minimal entry
      const status = mapAlertLevel(bp.alert_level);
      return {
        id: bp.patient_id,
        name: `Patient ${bp.patient_id}`,
        age: 0, gender: 'Unknown',
        bed: bp.patient_id, room: 'Unknown',
        condition: 'Monitoring',
        status,
        vitals: { hr: bp.heart_rate, spo2: bp.spo2, bpSys: bp.bp_systolic, bpDia: bp.bp_diastolic, rr: bp.resp_rate, temp: bp.temperature },
        history: [],
        deviceStatus: 'Connected' as const,
        signalStrength: 90, batteryLevel: 80,
        aiRisk: {
          stabilityScore: 100 - bp.risk_score,
          deteriorationProbability: bp.risk_score,
          shockPrediction: Math.round(bp.risk_score * 0.6),
        },
        admissionDate: '', diagnosis: '', notes: [],
        shockIndex: bp.shock_index,
        news2Score: bp.news2_score,
        news2Level: bp.news2_level,
        alertLevel: bp.alert_level,
      };
    }

    const newVitals = {
      hr: bp.heart_rate,
      spo2: bp.spo2,
      bpSys: bp.bp_systolic,
      bpDia: bp.bp_diastolic,
      rr: bp.resp_rate,
      temp: bp.temperature,
    };

    // Append to history (keep last 30 entries)
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newHistoryItem: VitalHistory = { timestamp: timeStr, ...newVitals };
    const prevHistory = prev?.history || generateHistory(newVitals);
    const history = [...prevHistory.slice(-29), newHistoryItem];

    const status = mapAlertLevel(bp.alert_level);
    // Override status based on risk_score from backend
    let finalStatus: 'Stable' | 'Guarded' | 'Critical' = status;
    if (bp.risk_score >= 50 || bp.spo2 < 90 || bp.heart_rate > 130) {
      finalStatus = 'Critical';
    } else if (bp.risk_score >= 20 || bp.news2_score >= 3) {
      finalStatus = 'Guarded';
    }

    return {
      ...meta,
      notes: prev?.notes || meta.notes,
      deviceStatus: prev?.deviceStatus || meta.deviceStatus,
      status: finalStatus,
      vitals: newVitals,
      history,
      aiRisk: {
        stabilityScore: Math.max(0, Math.round(100 - bp.risk_score)),
        deteriorationProbability: Math.round(bp.risk_score),
        shockPrediction: Math.round(bp.risk_score * 0.6),
      },
      shockIndex: bp.shock_index,
      news2Score: bp.news2_score,
      news2Level: bp.news2_level,
      alertLevel: bp.alert_level,
    };
  });
}

// Convert backend alerts to frontend alert format
function mapBackendAlerts(
  backendAlerts: BackendAlert[],
  patients: Patient[]
): Alert[] {
  return backendAlerts.map(ba => {
    const patient = patients.find(p => p.id === ba.patient_id);
    const meta = PATIENT_META[ba.patient_id];

    let alertStatus: 'Active' | 'Acknowledged' | 'Resolved' = 'Active';
    if (ba.acknowledged === 1) alertStatus = 'Acknowledged';

    return {
      id: `BKND-${ba.id}`,
      patientId: ba.patient_id,
      patientName: meta?.name || patient?.name || ba.patient_id,
      bed: meta?.bed || patient?.bed || ba.patient_id,
      type: mapAlertType(ba.alert_level),
      metric: 'HR' as const, // Backend doesn't specify metric, default
      value: `Risk ${ba.risk_score.toFixed(1)}% | NEWS2 ${ba.news2_score} | ${ba.alert_level}`,
      timestamp: ba.timestamp.split(' ')[1] || ba.timestamp,
      status: alertStatus,
    };
  });
}


export const PulseGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>(initialDevices);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [hiddenAlertIds, setHiddenAlertIds] = useState<string[]>([]);

  const hideAlertFromDashboard = (alertId: string) => {
    setHiddenAlertIds(prev => [...prev, alertId]);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // ─── Backend Polling Loop ───
  const pollBackend = useCallback(async () => {
    try {
      // Check health first
      const health = await checkHealth();
      if (!health || health.status !== 'ok') {
        setBackendConnected(false);
        return;
      }
      setBackendConnected(true);

      // Fetch patients
      const backendPatients = await apiFetchPatients();
      if (backendPatients.length > 0) {
        setPatients(prev => mergePatientData(backendPatients, prev));
      }

      // Fetch alerts
      const backendAlerts = await fetchAlertHistory();
      if (backendAlerts.length > 0) {
        setPatients(currentPatients => {
          const mapped = mapBackendAlerts(backendAlerts, currentPatients);
          setAlerts(mapped);
          return currentPatients;
        });
      }

      // Update device signals from patient data
      setDevices(prev =>
        prev.map(d => {
          const patient = backendPatients.find(bp => {
            const meta = PATIENT_META[bp.patient_id];
            return meta && meta.bed === d.bed;
          });
          if (patient) {
            return {
              ...d,
              lastSync: 'Just now',
              signal: Math.round(80 + Math.random() * 15),
              alertsCount: patient.alert_level === 'RED' || patient.alert_level === 'ORANGE'
                ? d.alertsCount + 1
                : d.alertsCount,
            };
          }
          return d;
        })
      );

    } catch (err) {
      console.error('Backend poll error:', err);
      setBackendConnected(false);
    }
  }, []);

  // Start polling on mount
  useEffect(() => {
    // Initial poll
    pollBackend();

    // Poll every 3 seconds
    const interval = setInterval(pollBackend, 3000);
    return () => clearInterval(interval);
  }, [pollBackend]);

  // ─── Fallback: if backend not connected, seed with static data ───
  useEffect(() => {
    if (!backendConnected && patients.length === 0) {
      const fallbackPatients: Patient[] = Object.values(PATIENT_META).map(meta => {
        const baseVitals = { hr: 78, spo2: 98, bpSys: 120, bpDia: 76, rr: 16, temp: 36.8 };
        return {
          ...meta,
          status: 'Stable' as const,
          vitals: baseVitals,
          history: generateHistory(baseVitals),
          aiRisk: { stabilityScore: 90, deteriorationProbability: 10, shockPrediction: 5 },
          shockIndex: 0.65,
          news2Score: 0,
          news2Level: 'NONE',
          alertLevel: 'GREEN',
        };
      });
      setPatients(fallbackPatients);
    }
  }, [backendConnected, patients.length]);

  // ─── Actions (local state mutations, still functional without backend) ───

  const dismissAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'Resolved' as const } : a))
    );
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'Acknowledged' as const } : a))
    );
    
    // If it's a backend alert and we are connected, send update to database
    if (alertId.startsWith('BKND-')) {
      const match = alerts.find(a => a.id === alertId);
      if (match && backendConnected) {
        await acknowledgePatientAlert(match.patientId, "NURSE-01", "Acknowledged from Dashboard");
      }
    }
  };

  const triggerEmergency = (patientId: string) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          const emergencyVitals = { hr: 138, spo2: 82, bpSys: 85, bpDia: 50, rr: 28, temp: 37.1 };
          return {
            ...p,
            status: 'Critical' as const,
            vitals: emergencyVitals,
            aiRisk: { stabilityScore: 10, deteriorationProbability: 95, shockPrediction: 85 },
            history: [...p.history.slice(1), { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), ...emergencyVitals }]
          };
        }
        return p;
      })
    );

    const p = patients.find(pat => pat.id === patientId);
    if (p) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newAlert: Alert = {
        id: `ALT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        patientId,
        patientName: p.name,
        bed: p.bed,
        type: 'Danger',
        metric: 'SPO2',
        value: '82% SpO2 (EMERGENCY CRISIS TRIGGERED)',
        timestamp: nowStr,
        status: 'Active'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const resolveEmergency = (patientId: string) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          const stableVitals = { hr: 80, spo2: 98, bpSys: 120, bpDia: 80, rr: 16, temp: 36.8 };
          return {
            ...p,
            status: 'Stable' as const,
            vitals: stableVitals,
            aiRisk: { stabilityScore: 90, deteriorationProbability: 10, shockPrediction: 5 },
            history: [...p.history.slice(1), { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), ...stableVitals }]
          };
        }
        return p;
      })
    );
    setAlerts(prev =>
      prev.map(a => (a.patientId === patientId ? { ...a, status: 'Resolved' as const } : a))
    );
  };

  const toggleDeviceConnection = (deviceId: string) => {
    setDevices(prev =>
      prev.map(d => {
        if (d.id === deviceId) {
          const nextStatus = d.status === 'Online' ? 'Offline' : 'Online';
          setPatients(prevP =>
            prevP.map(p => {
              if (p.bed === d.bed) {
                return { ...p, deviceStatus: nextStatus === 'Online' ? 'Connected' as const : 'Disconnected' as const };
              }
              return p;
            })
          );

          if (nextStatus === 'Offline') {
            const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const patientForBed = patients.find(p => p.bed === d.bed);
            const newAlert: Alert = {
              id: `ALT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              patientId: patientForBed?.id || 'UNKNOWN',
              patientName: patientForBed?.name || 'Unknown Patient',
              bed: d.bed,
              type: 'Danger',
              metric: 'DEVICE',
              value: `${d.type} Disconnected`,
              timestamp: nowStr,
              status: 'Active'
            };
            setAlerts(prev => [newAlert, ...prev]);
          }

          return { ...d, status: nextStatus, lastSync: nextStatus === 'Online' ? 'Just now' : 'Disconnected' };
        }
        return d;
      })
    );
  };

  const addNote = (patientId: string, note: string) => {
    setPatients(prev =>
      prev.map(p => (p.id === patientId ? { ...p, notes: [note, ...p.notes] } : p))
    );
  };

  // ─── Stats Calculation ───
  const activeAlertsCount = alerts.filter(a => a.status === 'Active' || a.status === 'Acknowledged').length;
  const criticalCount = patients.filter(p => p.status === 'Critical').length;
  const stableCount = patients.filter(p => p.status === 'Stable').length;
  const occupancyRate = Math.round((patients.length / 10) * 100);
  const avgRiskScore = patients.length > 0
    ? Math.round(patients.reduce((sum, p) => sum + p.aiRisk.deteriorationProbability, 0) / patients.length)
    : 0;

  let systemStatus: 'Optimal' | 'Alert' | 'Emergency' = 'Optimal';
  if (criticalCount > 1 || alerts.some(a => a.status === 'Active' && a.type === 'Danger')) {
    systemStatus = 'Emergency';
  } else if (activeAlertsCount > 0 || patients.some(p => p.status === 'Guarded')) {
    systemStatus = 'Alert';
  }

  const systemStats = { activeAlertsCount, criticalCount, stableCount, occupancyRate, avgRiskScore };

  return (
    <PulseGuardContext.Provider
      value={{
        patients, alerts, devices, systemStats,
        dismissAlert, acknowledgeAlert,
        triggerEmergency, resolveEmergency,
        toggleDeviceConnection, addNote,
        systemStatus, darkMode, toggleDarkMode,
        backendConnected,
        hiddenAlertIds,
        hideAlertFromDashboard,
      }}
    >
      {children}
    </PulseGuardContext.Provider>
  );
};

export const usePulseGuard = () => {
  const context = useContext(PulseGuardContext);
  if (!context) {
    throw new Error('usePulseGuard must be used within a PulseGuardProvider');
  }
  return context;
};
