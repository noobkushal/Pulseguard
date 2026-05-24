import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { AlertCard } from '../components/AlertCard';
import { usePulseGuard } from '../context/PulseGuardContext';
import type { Alert } from '../context/PulseGuardContext';
import { Filter, RefreshCw } from 'lucide-react';

export const AlertCenter: React.FC = () => {
  const { alerts } = usePulseGuard();
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Acknowledged' | 'Resolved'>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // De-duplicate alerts by patient to keep only the most recent unique alert per patient
  const deDuplicateAlerts = (list: Alert[]) => {
    const unique: Alert[] = [];
    const seen = new Set<string>();
    for (const item of list) {
      if (!seen.has(item.patientId)) {
        seen.add(item.patientId);
        unique.push(item);
      }
    }
    return unique;
  };

  const deDuplicatedAlerts = deDuplicateAlerts(alerts);

  const activeAlerts = deDuplicatedAlerts.filter(a => a.status === 'Active');
  const acknowledgedAlerts = deDuplicatedAlerts.filter(a => a.status === 'Acknowledged');
  const resolvedAlerts = deDuplicatedAlerts.filter(a => a.status === 'Resolved');

  const filteredAlerts = deDuplicatedAlerts.filter(alert => {
    if (filterStatus === 'All') return true;
    return alert.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} 
          mobileMenuOpen={mobileMenuOpen} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight font-headline">Smart Alert Hub</h1>
              <p className="text-xs text-slate-400 mt-0.5">ICU clinical anomaly alarm and alert log dispatch center.</p>
            </div>
            
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold font-mono text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-[#00f2fe] animate-spin" /> Live Alarm Sync
              </span>
            </div>
          </div>

          {/* Quick Counter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setFilterStatus('Active')}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                filterStatus === 'Active' ? 'bg-rose-500/10 border-rose-500/50 shadow-lg' : 'bg-[#171b28]/40 border-white/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Active Critical</span>
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              </div>
              <p className="text-3xl font-extrabold font-mono text-slate-100 mt-2">{activeAlerts.length}</p>
            </div>

            <div 
              onClick={() => setFilterStatus('Acknowledged')}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                filterStatus === 'Acknowledged' ? 'bg-amber-500/10 border-amber-500/50 shadow-lg' : 'bg-[#171b28]/40 border-white/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Acknowledged</span>
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              </div>
              <p className="text-3xl font-extrabold font-mono text-slate-100 mt-2">{acknowledgedAlerts.length}</p>
            </div>

            <div 
              onClick={() => setFilterStatus('Resolved')}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                filterStatus === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg' : 'bg-[#171b28]/40 border-white/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Resolved Logs</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              </div>
              <p className="text-3xl font-extrabold font-mono text-slate-100 mt-2">{resolvedAlerts.length}</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter Alarm Logs
            </span>

            <div className="flex gap-1.5">
              {['All', 'Active', 'Acknowledged', 'Resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === status 
                      ? 'bg-[#00f2fe] text-[#030712]' 
                      : 'bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="bg-[#171b28]/30 border border-white/5 rounded-xl p-12 text-center text-slate-400 text-sm italic font-medium">
                No telemetry alerts found for filter: <span className="text-[#00f2fe] font-bold font-mono">{filterStatus.toUpperCase()}</span>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onAcknowledge={() => setFilterStatus('Acknowledged')}
                  onResolve={() => setFilterStatus('Resolved')}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
