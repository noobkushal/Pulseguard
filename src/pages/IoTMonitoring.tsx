import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { DeviceStatusCard } from '../components/DeviceStatusCard';
import { usePulseGuard } from '../context/PulseGuardContext';
import { Cpu, Network, RefreshCw, Radio, HardDrive, ShieldCheck } from 'lucide-react';

export const IoTMonitoring: React.FC = () => {
  const { devices } = usePulseGuard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onlineDevices = devices.filter(d => d.status === 'Online');
  const offlineDevices = devices.filter(d => d.status === 'Offline');

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
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight font-headline">IoT Telemetry Topology</h1>
              <p className="text-xs text-slate-400 mt-0.5">ICU clinical sensor node telemetry connectivity and status mapping.</p>
            </div>
            
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold font-mono text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-[#00f2fe] animate-spin" /> Live Node Sync
              </span>
            </div>
          </div>

          {/* ward device network topology chart (visual block) */}
          <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-6">
            <h2 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase flex items-center gap-2">
              <Network className="w-4 h-4" /> Ward Sensor Network Map
            </h2>

            {/* Simulated topology graphic */}
            <div className="relative h-64 bg-slate-950/80 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-6">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,242,254,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,254,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Connection Hub in center */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-[#00f2fe]/40 flex items-center justify-center text-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.2)] animate-pulse">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-2">Central Gateway</span>
                <span className="text-[8px] font-mono text-emerald-400">ONLINE</span>
              </div>

              {/* Connecting lines & nodes */}
              <div className="absolute inset-0 flex items-center justify-between px-10 pointer-events-none">
                {/* Left Bed Nodes */}
                <div className="flex flex-col gap-10">
                  {devices.slice(0, 3).map(dev => (
                    <div key={dev.id} className="flex items-center gap-3 relative">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        dev.status === 'Online' ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse' : 'bg-rose-500/20 border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      }`} />
                      <span className="text-[10px] font-mono font-bold text-slate-300">Bed {dev.bed}</span>
                    </div>
                  ))}
                </div>

                {/* Right Bed Nodes */}
                <div className="flex flex-col gap-10">
                  {devices.slice(3, 6).map(dev => (
                    <div key={dev.id} className="flex items-center gap-3 relative flex-row-reverse text-right">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        dev.status === 'Online' ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse' : 'bg-rose-500/20 border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      }`} />
                      <span className="text-[10px] font-mono font-bold text-slate-300">Bed {dev.bed}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick telemetry summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/5 pt-6">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Online Nodes</span>
                  <p className="text-sm font-extrabold text-slate-200 mt-0.5">{onlineDevices.length} Connected</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-rose-400" />
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Disconnected Nodes</span>
                  <p className="text-sm font-extrabold text-slate-200 mt-0.5">{offlineDevices.length} Offline</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00f2fe]" />
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">RF Interference</span>
                  <p className="text-sm font-extrabold text-slate-200 mt-0.5">Negligible (Stable)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Topology device grid */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Configured Telemetry Devices ({devices.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map(device => (
                <DeviceStatusCard key={device.id} device={device} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
