import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Clock, Check } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';
import type { Alert } from '../context/PulseGuardContext';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: () => void;
  onResolve?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onResolve }) => {
  const { dismissAlert, acknowledgeAlert } = usePulseGuard();

  const getAlertBg = () => {
    if (alert.status === 'Resolved') return 'bg-emerald-950/15 border-emerald-500/20';
    if (alert.type === 'Danger') return 'bg-rose-950/10 border-rose-500/35 shadow-[0_0_15px_rgba(239,68,68,0.05)]';
    return 'bg-amber-950/10 border-amber-500/30';
  };

  const getAlertIcon = () => {
    if (alert.status === 'Resolved') return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    if (alert.type === 'Danger') return <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />;
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${getAlertBg()}`}>
      <div className="flex gap-3 items-start">
        <div className="mt-1 shrink-0">{getAlertIcon()}</div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-100 text-sm">{alert.patientName}</span>
            <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
              Bed {alert.bed}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
              alert.status === 'Active' ? 'bg-rose-500/20 text-rose-400' :
              alert.status === 'Acknowledged' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {alert.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 mt-2">{alert.value}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Logged: {alert.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 w-full md:w-auto justify-end">
        {alert.status === 'Active' && (
          <button
            onClick={async () => {
              await acknowledgeAlert(alert.id);
              if (onAcknowledge) onAcknowledge();
            }}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 rounded text-[11px] font-bold transition-all cursor-pointer"
          >
            Acknowledge
          </button>
        )}
        {alert.status !== 'Resolved' && (
          <button
            onClick={() => {
              dismissAlert(alert.id);
              if (onResolve) onResolve();
            }}
            className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Resolve
          </button>
        )}
      </div>
    </div>
  );
};
