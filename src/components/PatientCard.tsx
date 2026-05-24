import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Thermometer, ShieldAlert, AlertCircle, Sparkles } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';
import type { Patient } from '../context/PulseGuardContext';

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const navigate = useNavigate();
  const { triggerEmergency, resolveEmergency } = usePulseGuard();

  const getStatusClass = () => {
    switch (patient.status) {
      case 'Critical': return 'glass-panel-danger border-l-4 border-rose-500';
      case 'Guarded': return 'glass-panel-warning border-l-4 border-amber-500';
      default: return 'glass-panel-stable border-l-4 border-emerald-500';
    }
  };

  const getRiskColor = (prob: number) => {
    if (prob > 60) return 'text-rose-400';
    if (prob > 25) return 'text-amber-400';
    return 'text-cyan-400';
  };

  const getRiskBg = (prob: number) => {
    if (prob > 60) return 'bg-rose-500';
    if (prob > 25) return 'bg-amber-500';
    return 'bg-[#00f2fe]';
  };

  return (
    <div className={`p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] ${getStatusClass()}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
          <h3 className="font-bold text-slate-100 text-base hover:text-[#00f2fe] transition-colors">{patient.name}</h3>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wider mt-0.5">
            Bed {patient.bed} • {patient.condition}
          </p>
        </div>
        
        {/* Status badges */}
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
          patient.status === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
          patient.status === 'Guarded' ? 'bg-amber-500/20 text-amber-400' :
          'bg-emerald-500/20 text-emerald-400'
        }`}>
          {patient.status.toUpperCase()}
        </span>
      </div>

      {/* Vitals Quick Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-3">
          <Heart className={`w-4 h-4 shrink-0 ${patient.status === 'Critical' ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`} />
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">HEART RATE</p>
            <p className="text-sm font-bold font-mono text-slate-200">
              {patient.deviceStatus === 'Disconnected' ? '--' : `${patient.vitals.hr} BPM`}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-3">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">SPO2 LEVEL</p>
            <p className="text-sm font-bold font-mono text-slate-200">
              {patient.deviceStatus === 'Disconnected' ? '--' : `${patient.vitals.spo2}%`}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">BLOOD PRESS.</p>
            <p className="text-sm font-bold font-mono text-slate-200">
              {patient.deviceStatus === 'Disconnected' ? '--' : `${patient.vitals.bpSys}/${patient.vitals.bpDia}`}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5 flex items-center gap-3">
          <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">BODY TEMP.</p>
            <p className="text-sm font-bold font-mono text-slate-200">
              {patient.deviceStatus === 'Disconnected' ? '--' : `${patient.vitals.temp}°C`}
            </p>
          </div>
        </div>
      </div>

      {/* AI Stability Index */}
      <div className="bg-[#0b0e17]/80 rounded-lg p-3 border border-white/5 mb-4">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00f2fe]" /> Neural Deterioration Risk
          </span>
          <span className={`font-mono font-bold ${getRiskColor(patient.aiRisk.deteriorationProbability)}`}>
            {patient.deviceStatus === 'Disconnected' ? '--' : `${patient.aiRisk.deteriorationProbability}%`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getRiskBg(patient.aiRisk.deteriorationProbability)}`} 
            style={{ width: patient.deviceStatus === 'Disconnected' ? '0%' : `${patient.aiRisk.deteriorationProbability}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1">
          <span>STABILITY: {patient.deviceStatus === 'Disconnected' ? '--' : `${patient.aiRisk.stabilityScore}%`}</span>
          <span>SHOCK PROB: {patient.deviceStatus === 'Disconnected' ? '--' : `${patient.aiRisk.shockPrediction}%`}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => navigate(`/patients/${patient.id}`)}
          className="flex-1 py-1.5 text-center bg-white/5 border border-white/10 rounded text-[11px] font-bold text-slate-300 hover:bg-cyan-500/10 hover:text-[#00f2fe] hover:border-cyan-500/30 transition-all cursor-pointer"
        >
          View Chart
        </button>
        
        {patient.status === 'Critical' ? (
          <button 
            onClick={() => resolveEmergency(patient.id)}
            className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded text-[11px] font-bold transition-all flex items-center gap-1 justify-center"
          >
            <Activity className="w-3 h-3" /> Stabilize
          </button>
        ) : (
          <button 
            onClick={() => triggerEmergency(patient.id)}
            className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded text-[11px] font-bold transition-all flex items-center gap-1 justify-center"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Code Red
          </button>
        )}
      </div>
    </div>
  );
};
