import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Bell, ShieldAlert, Sun, Moon, AlertOctagon, Menu, X } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, mobileMenuOpen }) => {
  const { 
    systemStatus, 
    alerts, 
    dismissAlert, 
    darkMode,
    toggleDarkMode,
    backendConnected,
  } = usePulseGuard();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const activeAlerts = alerts.filter(a => a.status === 'Active');

  const getStatusBorder = () => {
    if (systemStatus === 'Emergency') return 'border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-rose-950/20';
    if (systemStatus === 'Alert') return 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-950/20';
    return 'border-cyan-500/20 shadow-[0_0_15px_rgba(0,242,254,0.1)] bg-[#0d1426]/40';
  };

  const getSystemStatusText = () => {
    if (systemStatus === 'Emergency') return 'EMERGENCY CRITICAL WARD STATUS';
    if (systemStatus === 'Alert') return 'VIGILANCE STATUS: ACTIVE ALERTS';
    return 'SURVEILLANCE STATUS: NOMINAL';
  };

  return (
    <nav className={`h-20 border-b border-white/5 px-6 flex justify-between items-center sticky top-0 z-50 bg-[#0f131f]/80 backdrop-blur-xl transition-all duration-300 ${getStatusBorder()}`}>
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button 
          onClick={onToggleMobileMenu} 
          className="lg:hidden text-slate-300 hover:text-[#00f2fe] p-1.5 rounded bg-white/5 border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <ShieldAlert className="w-8 h-8 text-[#00f2fe] drop-shadow-[0_0_10px_rgba(0,242,254,0.4)]" />
          <span className="font-bold text-lg tracking-wider text-slate-100 uppercase hidden sm:inline-block">PULSEGUARD <span className="text-[#00f2fe]">AI</span></span>
        </div>

        {/* Live system state text */}
        <div className="hidden md:flex items-center gap-2 pl-6 border-l border-white/10">
          <span className={`w-2 h-2 rounded-full ${systemStatus === 'Emergency' ? 'bg-rose-500 animate-ping' : systemStatus === 'Alert' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span className={`text-[11px] font-mono tracking-wider font-semibold uppercase ${systemStatus === 'Emergency' ? 'text-rose-400' : systemStatus === 'Alert' ? 'text-amber-400' : 'text-emerald-400'}`}>
            {getSystemStatusText()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Active alert indicator for quick response */}
        {systemStatus === 'Emergency' && (
          <button 
            onClick={() => navigate('/alerts')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-full text-[10px] uppercase font-bold tracking-wider animate-pulse hover:bg-rose-500 hover:text-white transition-all"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Crisis Active</span>
          </button>
        )}

        {/* Backend status indicator */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] uppercase font-mono tracking-wider transition-all ${
            backendConnected 
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
              : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
          }`}
          title={backendConnected ? "Connected to local API server" : "API Server Offline (Running in Simulation Fallback)"}
        >
          {backendConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{backendConnected ? "API Live" : "API Offline"}</span>
        </div>

        {/* Light/Dark Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-slate-400 hover:text-[#00f2fe] hover:bg-white/5 rounded-lg border border-white/5 transition-all"
          title="Toggle visual style"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-[#00f2fe] hover:bg-white/5 rounded-lg border border-white/5 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold px-1 animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel-glow rounded-xl overflow-hidden shadow-2xl z-50 border border-cyan-500/20">
              <div className="p-3.5 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Alert Center</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold">
                  {activeAlerts.length} Active
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
                {activeAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    All biosync readings nominal.
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="p-3 hover:bg-white/5 transition-all">
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${alert.type === 'Danger' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {alert.metric} {alert.type}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{alert.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-bold mt-1.5">{alert.patientName} (Bed {alert.bed})</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">{alert.value}</p>
                      <div className="flex gap-2 justify-end mt-2">
                        <button 
                          onClick={() => {
                            dismissAlert(alert.id);
                            setShowNotifications(false);
                          }}
                          className="text-[9px] px-2 py-0.5 bg-white/5 hover:bg-cyan-500/10 hover:text-[#00f2fe] rounded text-slate-400 transition-all"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-white/10 bg-slate-950/40 text-center">
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="text-[10px] text-[#00f2fe] font-bold hover:underline"
                >
                  View All Alerts in Hub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-100">Dr. Sarah Connor</p>
            <p className="text-[10px] text-slate-400 font-medium">ICU Director</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-cyan-500/30 overflow-hidden shadow-[0_0_10px_rgba(0,242,254,0.15)] bg-slate-950">
            <img 
              alt="Avatar" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2iZly7Qc73ou-xwyH626rgYn9Po7Ha5yNzypKWjkoFT4E8MYBA5I0mrcGGveEjPILsxMEgx-wJjKGnm55FfHSENStSa41kgTYIAckJVGC_hDoFnLjjj4wnickqAKF75TCa0ipPfTMO1GYh3JQ0N7ckroGYZ4MKB4AWyMXP6uQ2kX9gFiQuFQkOVKJNLMRYh_okyu7AHam0w7dYO8Na1JMd-VPIP4vQlhkaX3_ZoYGsHVFXZJk4TLEn_sELQD6sUpduoc4SSLCl80" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
