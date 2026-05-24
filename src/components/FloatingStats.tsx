import React from 'react';
import { Users, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';

export const FloatingStats: React.FC = () => {
  const { systemStats, systemStatus } = usePulseGuard();

  const getSystemBg = () => {
    if (systemStatus === 'Emergency') return 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_15px_rgba(239,68,68,0.03)]';
    if (systemStatus === 'Alert') return 'border-amber-500/25 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.03)]';
    return 'border-cyan-500/10 bg-cyan-500/5 shadow-[0_0_15px_rgba(0,242,254,0.03)]';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Active Alerts */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${getSystemBg()}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACTIVE WARNINGS</p>
            <p className="text-2xl font-black font-mono text-slate-100 mt-1">{systemStats.activeAlertsCount}</p>
          </div>
          <div className={`p-2 rounded-lg ${systemStats.activeAlertsCount > 0 ? 'bg-rose-500/10 text-rose-400 animate-pulse' : 'bg-white/5 text-slate-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-medium mt-2">
          {systemStats.activeAlertsCount > 0 ? 'Urgent attention required' : 'All parameters normal'}
        </p>
      </div>

      {/* Critical Patients */}
      <div className="p-4 rounded-xl border border-white/5 bg-[#171b28]/40 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CRITICAL BEDS</p>
            <p className="text-2xl font-black font-mono text-slate-100 mt-1">{systemStats.criticalCount}</p>
          </div>
          <div className={`p-2 rounded-lg ${systemStats.criticalCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-400'}`}>
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-medium mt-2">
          {systemStats.criticalCount > 0 ? 'High-risk monitoring active' : 'No critical code active'}
        </p>
      </div>

      {/* Occupancy Rate */}
      <div className="p-4 rounded-xl border border-white/5 bg-[#171b28]/40 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ICU OCCUPANCY</p>
            <p className="text-2xl font-black font-mono text-slate-100 mt-1">{systemStats.occupancyRate}%</p>
          </div>
          <div className="p-2 bg-white/5 text-[#00f2fe] rounded-lg">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-medium mt-2">
          6 of 10 configured beds occupied
        </p>
      </div>

      {/* Avg Deterioration Score */}
      <div className="p-4 rounded-xl border border-white/5 bg-[#171b28]/40 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WARD RISK MEAN</p>
            <p className="text-2xl font-black font-mono text-slate-100 mt-1">{systemStats.avgRiskScore}%</p>
          </div>
          <div className="p-2 bg-white/5 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-medium mt-2">
          Aggregated ward stability optimal
        </p>
      </div>
    </div>
  );
};
