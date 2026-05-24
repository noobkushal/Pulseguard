import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, X, Volume2 } from 'lucide-react';
import { usePulseGuard } from '../context/PulseGuardContext';

export const NotificationPopup: React.FC = () => {
  const { alerts, dismissAlert, hiddenAlertIds, hideAlertFromDashboard } = usePulseGuard();
  const [latestAlertId, setLatestAlertId] = useState<string | null>(null);

  const activeAlerts = alerts.filter(a => a.status === 'Active' && !hiddenAlertIds.includes(a.id));
  const latestAlert = activeAlerts[0]; // Newest alert is at index 0

  useEffect(() => {
    if (latestAlert && latestAlert.id !== latestAlertId) {
      setLatestAlertId(latestAlert.id);
      
      // Play a subtle medical beep sound for high-severity alerts (using Web Audio API so it works out of the box)
      if (latestAlert.type === 'Danger') {
        playBeep();
      }
    }
  }, [latestAlert, latestAlertId]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15); // short beep
    } catch (e) {
      console.log('Audio playback blocked or unsupported');
    }
  };

  return (
    <AnimatePresence>
      {latestAlert && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#18080f]/95 backdrop-blur-md border border-rose-500/40 rounded-xl p-4 shadow-[0_10px_30px_rgba(239,68,68,0.25)]"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/35 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  Critical Event
                </span>
                <button 
                  onClick={() => hideAlertFromDashboard(latestAlert.id)}
                  className="text-slate-400 hover:text-slate-200"
                  title="Remove from View"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-slate-100 mt-2">
                {latestAlert.patientName} (Bed {latestAlert.bed})
              </h4>
              <p className="text-[11px] text-rose-400 mt-1 font-semibold font-mono">
                {latestAlert.value}
              </p>
              
              <div className="flex gap-2 justify-end mt-3 border-t border-white/5 pt-2.5">
                <div className="flex items-center gap-1 text-[9px] text-slate-500 mr-auto font-mono">
                  <Volume2 className="w-3 h-3" />
                  <span>Audible Beacon Active</span>
                </div>
                <button
                  onClick={() => dismissAlert(latestAlert.id)}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white text-[10px] font-bold rounded transition-all cursor-pointer"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
