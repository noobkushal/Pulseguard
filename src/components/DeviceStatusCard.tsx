import React from 'react';
import { Wifi, WifiOff, Settings, AlertTriangle, Radio } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';
import type { IoTDevice } from '../context/PulseGuardContext';

interface DeviceStatusCardProps {
  device: IoTDevice;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ device }) => {
  const { toggleDeviceConnection } = usePulseGuard();

  const getStatusColor = () => {
    switch (device.status) {
      case 'Online': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Maintenance': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getSignalStrengthColor = (sig: number) => {
    if (device.status === 'Offline') return 'text-slate-600';
    if (sig > 80) return 'text-emerald-400';
    if (sig > 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className={`glass-panel p-5 rounded-xl border transition-all duration-300 ${
      device.status === 'Offline' ? 'opacity-65 border-white/5' : 'border-[#00f2fe]/10 hover:border-[#00f2fe]/30'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">{device.type}</h3>
          <p className="text-[10px] text-[#00f2fe] font-mono mt-0.5">{device.id} • Bed {device.bed}</p>
        </div>
        
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono border uppercase tracking-wider ${getStatusColor()}`}>
          {device.status}
        </span>
      </div>

      <div className="space-y-2 mb-4 border-y border-white/5 py-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Signal strength</span>
          <div className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${getSignalStrengthColor(device.signal)}`} />
            <span className={`font-mono font-bold ${getSignalStrengthColor(device.signal)}`}>
              {device.status === 'Offline' ? '--' : `${device.signal} dBm`}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Firmware version</span>
          <span className="font-mono text-slate-300">{device.firmware}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Telemetry sync</span>
          <span className="text-slate-300 font-medium">{device.lastSync}</span>
        </div>

        {device.alertsCount > 0 && device.status === 'Online' && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/5 p-1.5 rounded border border-rose-500/20 mt-1">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{device.alertsCount} telemetry alerts logged</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => toggleDeviceConnection(device.id)}
          className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            device.status === 'Online' 
              ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20' 
              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20'
          }`}
        >
          {device.status === 'Online' ? (
            <>
              <WifiOff className="w-3.5 h-3.5" /> Disconnect
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5" /> Reconnect
            </>
          )}
        </button>
        
        <button className="p-1.5 bg-white/5 border border-white/10 hover:border-[#00f2fe]/30 hover:text-[#00f2fe] rounded text-slate-400 transition-all">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
