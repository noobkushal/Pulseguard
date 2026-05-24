import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Cpu, TrendingUp, LogOut, ShieldAlert } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';

export const Sidebar: React.FC = () => {
  const { systemStatus, systemStats } = usePulseGuard();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'Emergency': return 'bg-rose-500 shadow-rose-500/50';
      case 'Alert': return 'bg-amber-500 shadow-amber-500/50';
      default: return 'bg-cyan-400 shadow-cyan-400/50';
    }
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 bg-[#0a0e1a]/80 backdrop-blur-2xl border-r border-white/5 py-8 shrink-0 sticky top-0">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-6 h-6 text-[#00f2fe]" />
          <span className="font-bold text-lg tracking-tighter text-slate-100 uppercase">PulseGuard AI</span>
        </div>
        <p className="text-[10px] tracking-widest text-[#00f2fe] uppercase font-semibold">ICU COMMAND CENTER</p>
        
        <div className="flex items-center gap-2 mt-4 bg-white/5 rounded-lg p-2.5 border border-white/5">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${getStatusColor()}`}></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">SYSTEM: {systemStatus}</p>
            <p className="text-[9px] text-[#00f2fe]/80 font-mono">Surveillance: {systemStats.occupancyRate}%</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-cyan-500/10 text-[#00f2fe] border-l-4 border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/patients/P001"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-cyan-500/10 text-[#00f2fe] border-l-4 border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
          }
        >
          <Users className="w-4 h-4" />
          <span>Patient Analytics</span>
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-cyan-500/10 text-[#00f2fe] border-l-4 border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
          }
        >
          <div className="relative">
            <AlertTriangle className="w-4 h-4" />
            {systemStats.activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </div>
          <span>Alert Hub</span>
        </NavLink>

        <NavLink
          to="/devices"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-cyan-500/10 text-[#00f2fe] border-l-4 border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
          }
        >
          <Cpu className="w-4 h-4" />
          <span>IoT Topology</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-cyan-500/10 text-[#00f2fe] border-l-4 border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
          }
        >
          <TrendingUp className="w-4 h-4" />
          <span>AI Prediction</span>
        </NavLink>
      </nav>

      <div className="px-4 mt-auto">
        <div className="p-3 bg-white/5 rounded-lg border border-white/5 mb-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase">Surveillance Active</p>
          <p className="text-xs text-[#00f2fe] font-mono mt-1">Uptime: 24h 00m 00s</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
