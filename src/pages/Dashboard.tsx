import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { FloatingStats } from '../components/FloatingStats';
import { PatientCard } from '../components/PatientCard';
import { ECGChart } from '../components/ECGChart';
import { TimelinePanel } from '../components/TimelinePanel';
import { usePulseGuard } from '../context/PulseGuardContext';
import { Activity, RefreshCw, Layers, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { patients, systemStatus, alerts, hiddenAlertIds, hideAlertFromDashboard } = usePulseGuard();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const activeAlerts = alerts.filter(a => a.status === 'Active' && !hiddenAlertIds.includes(a.id));
  const latestAlert = activeAlerts[0];

  const getSystemContainerBorder = () => {
    if (systemStatus === 'Emergency') return 'shadow-[inset_0_0_80px_rgba(239,68,68,0.06)]';
    if (systemStatus === 'Alert') return 'shadow-[inset_0_0_80px_rgba(245,158,11,0.03)]';
    return '';
  };

  return (
    <div className={`min-h-screen bg-[#060814] text-slate-100 flex transition-all duration-500 ${getSystemContainerBorder()}`}>
      {/* Sidebar with mobile toggle */}
      <Sidebar />
      
      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 bg-[#0a0e1a] h-full p-6 border-r border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-extrabold text-lg uppercase tracking-wider text-slate-100">PulseGuard AI</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <nav className="space-y-4">
                <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300 font-bold hover:text-[#00f2fe]">Console Dashboard</button>
                <button onClick={() => { navigate(`/patients/${selectedPatientId}`); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300 font-bold hover:text-[#00f2fe]">Patient Analytics</button>
                <button onClick={() => { navigate('/alerts'); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300 font-bold hover:text-[#00f2fe]">Alert Hub</button>
                <button onClick={() => { navigate('/devices'); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300 font-bold hover:text-[#00f2fe]">IoT Topology</button>
                <button onClick={() => { navigate('/analytics'); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300 font-bold hover:text-[#00f2fe]">AI Prediction</button>
              </nav>
            </div>
            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="py-2 text-rose-400 font-bold text-left">Logout</button>
          </div>
        </div>
      )}

      {/* Main page content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} 
          mobileMenuOpen={mobileMenuOpen} 
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight font-headline">ICU Command Console</h1>
              <p className="text-xs text-slate-400 mt-0.5">Real-time biosync telemetry surveillance matrix.</p>
            </div>
            
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold font-mono text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-[#00f2fe] animate-spin" /> Simulated Feed Active
              </span>
            </div>
          </div>

          {/* Telemetry Alarm Notification Bar */}
          {latestAlert && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${
              latestAlert.type === 'Danger' 
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-200 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${latestAlert.type === 'Danger' ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs tracking-wider font-mono uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      Bed {latestAlert.bed}
                    </span>
                    <span className="font-bold text-slate-100 text-sm">{latestAlert.patientName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({latestAlert.timestamp})</span>
                  </div>
                  <p className="text-xs mt-1 text-slate-300 font-medium">{latestAlert.value}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
                <button
                  onClick={() => navigate(`/patients/${latestAlert.patientId}`)}
                  className="px-3 py-1.5 bg-cyan-500/10 hover:bg-[#00f2fe] border border-cyan-500/35 text-xs font-bold text-[#00f2fe] hover:text-[#030712] rounded transition-all cursor-pointer"
                >
                  View Vitals
                </button>
                <button
                  onClick={() => hideAlertFromDashboard(latestAlert.id)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  title="Dismiss from View (Keeps stored in Notification Bar)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick indicators */}
          <FloatingStats />

          {/* Dashboard Split Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Patients list panel */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Patient Surveillance Grid
                </h2>
                <span className="text-[10px] text-slate-500 font-mono">Click header card to link ECG feed</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.map(patient => (
                  <div 
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`cursor-pointer rounded-xl transition-all duration-300 ${
                      selectedPatientId === patient.id 
                        ? 'ring-2 ring-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.15)] scale-[1.01]' 
                        : ''
                    }`}
                  >
                    <PatientCard patient={patient} />
                  </div>
                ))}
              </div>
            </div>

            {/* Side interactive details panel */}
            <div className="space-y-6">
              {selectedPatient && (
                <div className="bg-[#171b28]/60 backdrop-blur-2xl p-6 rounded-xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-100 uppercase">{selectedPatient.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Bed {selectedPatient.bed} • {selectedPatient.age} y/o {selectedPatient.gender}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/patients/${selectedPatient.id}`)}
                      className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-[#00f2fe] rounded hover:bg-[#00f2fe] hover:text-[#030712] transition-all cursor-pointer"
                    >
                      Full Profile
                    </button>
                  </div>

                  {/* ECG wave visual panel */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live ECG Stream</span>
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
                        <Activity className="w-3.5 h-3.5 text-[#00f2fe]" /> Lead II Active
                      </span>
                    </div>
                    
                    <ECGChart 
                      bpm={selectedPatient.vitals.hr} 
                      isCritical={selectedPatient.status === 'Critical'}
                      isDisconnected={selectedPatient.deviceStatus === 'Disconnected'}
                    />
                  </div>

                  {/* Vitals detail list */}
                  <div className="space-y-3 bg-[#0a0e17] p-4 rounded-lg border border-white/5">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-white/5 pb-2">Telemetry Signs</h4>
                    
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold">HEART RATE</p>
                        <p className="text-xl font-extrabold font-mono text-slate-100">
                          {selectedPatient.deviceStatus === 'Disconnected' ? '--' : `${selectedPatient.vitals.hr} BPM`}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-500 font-bold">SPO2 SATURATION</p>
                        <p className="text-xl font-extrabold font-mono text-slate-100">
                          {selectedPatient.deviceStatus === 'Disconnected' ? '--' : `${selectedPatient.vitals.spo2}%`}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-500 font-bold">BLOOD PRESSURE</p>
                        <p className="text-xl font-extrabold font-mono text-slate-100">
                          {selectedPatient.deviceStatus === 'Disconnected' ? '--' : `${selectedPatient.vitals.bpSys}/${selectedPatient.vitals.bpDia}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-500 font-bold">RESPIRATORY RATE</p>
                        <p className="text-xl font-extrabold font-mono text-slate-100">
                          {selectedPatient.deviceStatus === 'Disconnected' ? '--' : `${selectedPatient.vitals.rr} RPM`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Prediction highlights */}
                  <div className="bg-cyan-500/5 p-4 rounded-lg border border-cyan-500/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#00f2fe] font-bold">AI Stability Index</span>
                      <span className="font-mono font-bold text-slate-100">
                        {selectedPatient.deviceStatus === 'Disconnected' ? '--' : `${selectedPatient.aiRisk.stabilityScore}%`}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00f2fe]" 
                        style={{ width: selectedPatient.deviceStatus === 'Disconnected' ? '0%' : `${selectedPatient.aiRisk.stabilityScore}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">
                      Prediction: Risk of shock onset within next 4 hours is {selectedPatient.deviceStatus === 'Disconnected' ? '--' : `${selectedPatient.aiRisk.shockPrediction}%`}.
                    </p>
                  </div>
                </div>
              )}

              {/* Live telemetry log */}
              <TimelinePanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
