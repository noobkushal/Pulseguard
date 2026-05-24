import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface VitalWidgetProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status: 'Stable' | 'Guarded' | 'Critical';
  iconColor: string;
}

export const VitalWidget: React.FC<VitalWidgetProps> = ({ 
  label, 
  value, 
  unit = '', 
  icon: Icon, 
  status,
  iconColor
}) => {
  const getPanelClass = () => {
    switch (status) {
      case 'Critical': return 'glass-panel-danger border-rose-500/40';
      case 'Guarded': return 'glass-panel-warning border-amber-500/40';
      default: return 'glass-panel-stable border-emerald-500/30';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'Critical': return 'text-rose-400 font-bold';
      case 'Guarded': return 'text-amber-400 font-bold';
      default: return 'text-emerald-400 font-semibold';
    }
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 ${getPanelClass()}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      
      <div className="my-2">
        <span className="text-3xl font-extrabold font-mono text-slate-100">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-mono ml-1">{unit}</span>}
      </div>

      <div className="flex justify-between items-center text-[10px] mt-1 border-t border-white/5 pt-2">
        <span className="text-slate-400 font-medium">STATUS</span>
        <span className={`uppercase font-mono tracking-wider ${getStatusText()}`}>
          {status}
        </span>
      </div>
    </div>
  );
};
