import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { VitalWidget } from '../components/VitalWidget';
import { ECGChart } from '../components/ECGChart';
import { RiskGauge } from '../components/RiskGauge';
import { usePulseGuard } from '../context/PulseGuardContext';
import { 
  Heart, Activity, Thermometer, ShieldAlert, Cpu, Clipboard, 
  Send, AlertTriangle, ArrowLeft, CheckCircle, Brain, Sliders
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchExplanation } from '../services/api';
import type { ExplanationResponse } from '../services/api';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, addNote, triggerEmergency, resolveEmergency } = usePulseGuard();

  const [noteText, setNoteText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Find patient
  const patient = patients.find(p => p.id === id) || patients[0];

  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  
  // Interactive NEWS2 state initialized with patient's current vitals
  const [calcHr, setCalcHr] = useState(75);
  const [calcSpo2, setCalcSpo2] = useState(98);
  const [calcRr, setCalcRr] = useState(16);
  const [calcTemp, setCalcTemp] = useState(36.8);
  const [calcBp, setCalcBp] = useState(120);

  // Sync calc values when patient vitals change
  useEffect(() => {
    if (patient) {
      setCalcHr(Math.round(patient.vitals.hr));
      setCalcSpo2(Math.round(patient.vitals.spo2));
      setCalcRr(Math.round(patient.vitals.rr));
      setCalcTemp(patient.vitals.temp);
      setCalcBp(Math.round(patient.vitals.bpSys));
    }
  }, [patient?.id, patient?.vitals]);

  // Fetch explanation every 3 seconds
  useEffect(() => {
    if (!patient) return;
    let active = true;
    const load = async () => {
      const data = await fetchExplanation(patient.id);
      if (active) setExplanation(data);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [patient?.id]);

  const calculateLocalNEWS2 = () => {
    let score = 0;
    
    // RR
    if (calcRr <= 8 || calcRr >= 25) score += 3;
    else if (calcRr >= 21 && calcRr <= 24) score += 2;
    else if (calcRr >= 9 && calcRr <= 11) score += 1;
    
    // SpO2
    if (calcSpo2 <= 91) score += 3;
    else if (calcSpo2 === 92 || calcSpo2 === 93) score += 2;
    else if (calcSpo2 === 94 || calcSpo2 === 95) score += 1;
    
    // Temp
    if (calcTemp <= 35.0) score += 3;
    else if (calcTemp >= 39.1) score += 2;
    else if (calcTemp >= 38.1 && calcTemp <= 39.0) score += 1;
    else if (calcTemp >= 35.1 && calcTemp <= 36.0) score += 1;
    
    // Systolic BP
    if (calcBp <= 90 || calcBp >= 220) score += 3;
    else if (calcBp >= 91 && calcBp <= 100) score += 2;
    else if (calcBp >= 101 && calcBp <= 110) score += 1;
    
    // HR
    if (calcHr <= 40 || calcHr >= 131) score += 3;
    else if (calcHr >= 111 && calcHr <= 130) score += 2;
    else if (calcHr >= 91 && calcHr <= 110) score += 1;
    else if (calcHr >= 41 && calcHr <= 50) score += 1;
    
    return score;
  };

  const localNews2 = calculateLocalNEWS2();
  
  const getNEWS2Level = (score: number) => {
    if (score >= 5) return { text: 'HIGH RISK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    if (score >= 1) return { text: 'MEDIUM RISK', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { text: 'LOW RISK', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };
  
  const localNews2Level = getNEWS2Level(localNews2);

  const calcShockIndex = calcHr / (calcBp || 1);
  
  const getShockIndexLevel = (val: number) => {
    if (val >= 0.9) return { text: 'CRITICAL SHOCK RISK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    if (val >= 0.7) return { text: 'ELEVATED / BORDERLINE', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { text: 'NORMAL', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  const shockIndexLevel = getShockIndexLevel(calcShockIndex);

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#060814] flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 font-bold">Patient Not Found</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-white/10 rounded">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNote(patient.id, noteText);
    setNoteText('');
  };

  const getStatusColor = () => {
    if (patient.status === 'Critical') return 'text-rose-400';
    if (patient.status === 'Guarded') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex">
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} 
          mobileMenuOpen={mobileMenuOpen} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header & Navigation Back */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-white/5 border border-white/10 hover:border-[#00f2fe]/40 hover:text-[#00f2fe] rounded-lg text-slate-400 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight font-headline">
                    {patient.name}
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-slate-300">
                    Bed {patient.bed}
                  </span>
                  <span className={`text-xs font-bold font-mono uppercase ${getStatusColor()}`}>
                    {patient.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Patient Clinical Diagnostics Analytics Profile.</p>
              </div>
            </div>

            {/* Emergency override controls */}
            <div className="flex gap-2">
              {patient.status === 'Critical' ? (
                <button
                  onClick={() => resolveEmergency(patient.id)}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Stabilize Patient
                </button>
              ) : (
                <button
                  onClick={() => triggerEmergency(patient.id)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                >
                  <AlertTriangle className="w-4 h-4" /> Code Red Emergency
                </button>
              )}
            </div>
          </div>

          {/* Demographics / Quick Bio card */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">AGE / GENDER</span>
                <p className="text-sm font-bold text-slate-200 mt-1">{patient.age} Y/O / {patient.gender}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">WARD ASSIGNMENT</span>
                <p className="text-sm font-bold text-slate-200 mt-1">{patient.room} • Bed {patient.bed}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">ADMISSION DATE</span>
                <p className="text-sm font-bold text-slate-200 mt-1 font-mono">{patient.admissionDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">IoT DEVICE SYNC</span>
                <p className={`text-sm font-bold mt-1 font-mono ${patient.deviceStatus === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {patient.deviceStatus}
                </p>
              </div>
              <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase">DIAGNOSTIC ADMISSION BRIEF</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-body">{patient.diagnosis}</p>
              </div>
            </div>

            {/* Neural AI Risk gauge */}
            <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex items-center justify-center">
              <RiskGauge 
                percentage={patient.deviceStatus === 'Disconnected' ? 0 : patient.aiRisk.deteriorationProbability} 
                size="md" 
              />
            </div>
          </div>

          {/* Vitals grid widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <VitalWidget 
              label="Heart Rate"
              value={patient.deviceStatus === 'Disconnected' ? '--' : patient.vitals.hr}
              unit="BPM"
              icon={Heart}
              status={patient.vitals.hr > 120 || patient.vitals.hr < 50 ? 'Critical' : patient.vitals.hr > 100 ? 'Guarded' : 'Stable'}
              iconColor="text-rose-500"
            />
            <VitalWidget 
              label="SPO2 SAT."
              value={patient.deviceStatus === 'Disconnected' ? '--' : patient.vitals.spo2}
              unit="%"
              icon={Activity}
              status={patient.vitals.spo2 < 90 ? 'Critical' : patient.vitals.spo2 < 94 ? 'Guarded' : 'Stable'}
              iconColor="text-cyan-400"
            />
            <VitalWidget 
              label="BLOOD PRESSURE"
              value={patient.deviceStatus === 'Disconnected' ? '--' : `${patient.vitals.bpSys}/${patient.vitals.bpDia}`}
              unit="mmHg"
              icon={ShieldAlert}
              status={patient.vitals.bpSys < 90 || patient.vitals.bpSys > 165 ? 'Critical' : 'Stable'}
              iconColor="text-blue-400"
            />
            <VitalWidget 
              label="RESP. RATE"
              value={patient.deviceStatus === 'Disconnected' ? '--' : patient.vitals.rr}
              unit="RPM"
              icon={Cpu}
              status={patient.vitals.rr > 25 || patient.vitals.rr < 10 ? 'Critical' : 'Stable'}
              iconColor="text-purple-400"
            />
            <VitalWidget 
              label="BODY TEMP."
              value={patient.deviceStatus === 'Disconnected' ? '--' : patient.vitals.temp}
              unit="°C"
              icon={Thermometer}
              status={patient.vitals.temp > 38.5 || patient.vitals.temp < 35.0 ? 'Critical' : patient.vitals.temp > 37.8 ? 'Guarded' : 'Stable'}
              iconColor="text-amber-400"
            />
          </div>

          {/* ECG and Recharts area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Live Sweep ECG */}
              <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-3">
                <span className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase block">
                  Lead II Live ECG Waveform
                </span>
                <ECGChart 
                  bpm={patient.vitals.hr} 
                  isCritical={patient.status === 'Critical'}
                  isDisconnected={patient.deviceStatus === 'Disconnected'}
                />
              </div>

              {/* Recharts Vital trends */}
              <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-4">
                <span className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase block">
                  24-Hour Biosync Trends Analysis
                </span>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={patient.history}>
                      <defs>
                        <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis yAxisId="left" stroke="rgba(239, 68, 68, 0.7)" fontSize={9} label={{ value: 'HR (BPM)', angle: -90, position: 'insideLeft', style: { fill: '#ef4444', fontSize: 10, fontWeight: 'bold' } }} />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(6, 182, 212, 0.7)" fontSize={9} label={{ value: 'SpO2 (%)', angle: 90, position: 'insideRight', style: { fill: '#06b6d4', fontSize: 10, fontWeight: 'bold' } }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                      <Area yAxisId="left" type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#hrGrad)" name="Heart Rate" />
                      <Area yAxisId="right" type="monotone" dataKey="spo2" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#spo2Grad)" name="SpO2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Interactive Note Taker, Explainable AI & Clinical Simulator Tools */}
            <div className="space-y-6">
              
              {/* Explainable AI Insights Card */}
              <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#00f2fe]" /> Explainable AI Attribution
                  </h3>
                  <span className="text-[10px] bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    SHAP Vectors
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  Real-time neural network feature importance mapping for ICU deterioration risk estimation.
                </p>

                {explanation && explanation.top_factors && explanation.top_factors.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {explanation.top_factors.map((f, i) => {
                      const percentage = Math.max(0, Math.min(100, Math.round((f.contribution / 10) * 100)));
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300 font-medium">{f.vital}</span>
                            <span className={`font-bold ${f.contribution > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {f.contribution > 0 ? '+' : ''}{f.contribution.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${f.contribution > 3 ? 'bg-rose-500' : f.contribution > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Value: {f.current_value.toFixed(1)}</span>
                            <span>Normal Range: {f.normal_range}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {/* Mock/Fallback factors if API loading */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">SpO2 Saturation</span>
                        <span className="text-rose-400 font-bold">+5.7%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '57%' }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Value: {patient.vitals.spo2}</span>
                        <span>Normal Range: 96-100%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">Heart Rate</span>
                        <span className="text-amber-400 font-bold">+3.2%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '32%' }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Value: {patient.vitals.hr}</span>
                        <span>Normal Range: 60-90 BPM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* NEWS2 Clinical Decision Simulator Tool */}
              <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#00f2fe]" /> NEWS2 Calculator Tool
                  </h3>
                  <button 
                    onClick={() => {
                      setCalcHr(Math.round(patient.vitals.hr));
                      setCalcSpo2(Math.round(patient.vitals.spo2));
                      setCalcRr(Math.round(patient.vitals.rr));
                      setCalcTemp(patient.vitals.temp);
                      setCalcBp(Math.round(patient.vitals.bpSys));
                    }}
                    className="text-[9px] hover:text-[#00f2fe] font-bold font-mono text-slate-500 transition-colors uppercase"
                  >
                    Reset
                  </button>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  Interactively simulate patient vital signs to test trigger boundaries and clinical escalation protocols.
                </p>

                <div className="space-y-3 pt-2">
                  {/* SpO2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Oxygen Saturation (SpO2)</span>
                      <span className="font-bold text-cyan-400">{calcSpo2}%</span>
                    </div>
                    <input 
                      type="range" min="80" max="100" value={calcSpo2} 
                      onChange={(e) => setCalcSpo2(parseInt(e.target.value))}
                      className="w-full accent-cyan-400 bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Heart Rate */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Heart Rate (HR)</span>
                      <span className="font-bold text-rose-400">{calcHr} BPM</span>
                    </div>
                    <input 
                      type="range" min="30" max="180" value={calcHr} 
                      onChange={(e) => setCalcHr(parseInt(e.target.value))}
                      className="w-full accent-rose-500 bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Resp Rate */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Respiratory Rate (RR)</span>
                      <span className="font-bold text-purple-400">{calcRr} RPM</span>
                    </div>
                    <input 
                      type="range" min="5" max="40" value={calcRr} 
                      onChange={(e) => setCalcRr(parseInt(e.target.value))}
                      className="w-full accent-purple-500 bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Systolic BP */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Systolic Blood Pressure</span>
                      <span className="font-bold text-blue-400">{calcBp} mmHg</span>
                    </div>
                    <input 
                      type="range" min="70" max="220" value={calcBp} 
                      onChange={(e) => setCalcBp(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Body Temp */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Body Temperature</span>
                      <span className="font-bold text-amber-400">{calcTemp.toFixed(1)} °C</span>
                    </div>
                    <input 
                      type="range" min="34.0" max="41.0" step="0.1" value={calcTemp} 
                      onChange={(e) => setCalcTemp(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">NEWS2 SCORE</span>
                    <span className="text-2xl font-black text-slate-100 font-mono">{localNews2}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${localNews2Level.color}`}>
                    {localNews2Level.text}
                  </span>
                </div>
              </div>

              {/* Hemodynamic Shock Index Calculator Card */}
              <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00f2fe]" /> Shock Index Calculator
                </h3>
                
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  Hemodynamic ratio defined by <span className="font-mono text-slate-300">HR / Systolic BP</span>. Used to identify occult shock when vitals appear individually stable.
                </p>

                <div className="bg-[#0a0e1a]/80 border border-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Heart Rate (HR)</span>
                    <span className="text-rose-400 font-bold">{calcHr} BPM</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Systolic Blood Pressure</span>
                    <span className="text-blue-400 font-bold">{calcBp} mmHg</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">SHOCK INDEX</span>
                      <span className="text-2xl font-black text-slate-100 font-mono">{calcShockIndex.toFixed(2)}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${shockIndexLevel.color}`}>
                      {shockIndexLevel.text}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono leading-relaxed bg-slate-950/20 p-3 rounded border border-white/5">
                  <span className="font-bold text-[#00f2fe] block mb-1">CLINICAL REFERENCE:</span>
                  • Normal Range: 0.5 – 0.7<br />
                  • Index &ge; 0.9 indicates high risk of cardiogenic / septic shock onset, correlating with left ventricular dysfunction and elevated ICU mortality.
                </div>
              </div>

              {/* Note Taker */}
              <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase mb-4 flex items-center gap-2">
                    <Clipboard className="w-4 h-4" /> Clinical Decision Log
                  </h3>
                  
                  {/* Notes Form */}
                  <form onSubmit={handleAddNote} className="mb-4">
                    <div className="relative">
                      <input 
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Log clinical observation..."
                        className="w-full bg-[#0a0e1a] text-slate-100 placeholder-slate-500 border border-white/10 focus:border-[#00f2fe] rounded-lg px-4 py-2.5 pr-10 text-xs focus:outline-none transition-all font-medium"
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-2 text-slate-400 hover:text-[#00f2fe] transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
 
                  {/* Notes List */}
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                    {patient.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-[#0a0e1a]/80 border border-white/5 rounded-lg">
                        <p className="text-xs text-slate-200 leading-relaxed font-body">{note}</p>
                        <span className="text-[9px] text-slate-500 font-mono mt-1 block">logged by: Dr. Connor</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
