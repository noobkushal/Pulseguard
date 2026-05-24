import React from 'react';
import { Activity, ShieldAlert, Cpu, ClipboardList } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';

export const TimelinePanel: React.FC = () => {
  const { alerts } = usePulseGuard();

  // Combine alerts and some mock clinical events to build a timeline log
  const getTimelineEvents = () => {
    const events = alerts.map(alert => ({
      id: alert.id,
      time: alert.timestamp,
      type: alert.type === 'Danger' ? 'critical' : 'warning',
      title: `${alert.patientName} (Bed ${alert.bed})`,
      description: alert.value,
      icon: alert.metric === 'DEVICE' ? Cpu : ShieldAlert
    }));

    // Add some baseline info
    const staticEvents = [
      {
        id: 'se-1',
        time: '11:32:10',
        type: 'info',
        title: 'Central Station Server',
        description: 'Vigilance scanning sync established (4ms latency)',
        icon: Cpu
      },
      {
        id: 'se-2',
        time: '11:20:45',
        type: 'stable',
        title: 'Bed ICU-104 - Elena Vance',
        description: 'Vitals calibrated & validated',
        icon: Activity
      },
      {
        id: 'se-3',
        time: '11:05:12',
        type: 'info',
        title: 'Clinical System Uptime',
        description: 'Daily server backup completed successfully',
        icon: ClipboardList
      }
    ];

    return [...events, ...staticEvents].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10);
  };

  const getEventClass = (type: string) => {
    switch (type) {
      case 'critical': return 'border-rose-500/30 bg-rose-500/5 text-rose-400';
      case 'warning': return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
      case 'stable': return 'border-emerald-500/35 bg-emerald-500/5 text-emerald-400';
      default: return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400';
    }
  };

  const timelineEvents = getTimelineEvents();

  return (
    <div className="bg-[#171b28]/60 backdrop-blur-2xl p-6 rounded-xl border border-white/5">
      <h3 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase mb-5 flex items-center gap-2">
        <ClipboardList className="w-4 h-4" /> ICU Telemetry Log
      </h3>

      <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-[1px] before:bg-white/5">
        {timelineEvents.map(event => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="flex gap-4 relative">
              {/* Timeline dot/icon */}
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 z-10 ${getEventClass(event.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{event.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{event.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
