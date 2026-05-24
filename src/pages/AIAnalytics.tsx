import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { usePulseGuard } from '../context/PulseGuardContext';
import { Brain, Cpu, Sparkles, RefreshCw, BarChart2, TrendingUp, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';

export const AIAnalytics: React.FC = () => {
  const { patients } = usePulseGuard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build some mock forecasting datasets
  const mockForecastingData = [
    { hour: '12:00', avgRisk: 14, sepsisRisk: 8, shockProb: 4 },
    { hour: '14:00', avgRisk: 18, sepsisRisk: 12, shockProb: 6 },
    { hour: '16:00', avgRisk: 22, sepsisRisk: 15, shockProb: 9 },
    { hour: '18:00', avgRisk: 28, sepsisRisk: 19, shockProb: 12 },
    { hour: '20:00', avgRisk: 34, sepsisRisk: 24, shockProb: 18 },
    { hour: '22:00', avgRisk: 31, sepsisRisk: 22, shockProb: 15 },
    { hour: '00:00', avgRisk: 25, sepsisRisk: 18, shockProb: 11 },
  ];

  // Map patient deterioration percentages
  const patientRiskData = patients.map(p => ({
    name: p.name.split(',')[0],
    'Deterioration %': p.aiRisk.deteriorationProbability,
    'Stability %': p.aiRisk.stabilityScore,
    'Shock Prediction %': p.aiRisk.shockPrediction
  }));

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
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight font-headline">AI Neural Risk Analytics</h1>
              <p className="text-xs text-slate-400 mt-0.5">Deterioration probability mapping and shock onset predictive models.</p>
            </div>
            
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold font-mono text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-[#00f2fe] animate-spin" /> Predictor Eng. Active
              </span>
            </div>
          </div>

          {/* Predictor summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#171b28]/60 backdrop-blur-xl p-5 rounded-xl border border-white/5 flex gap-4 items-center">
              <div className="w-12 h-12 bg-cyan-500/10 border border-[#00f2fe]/30 rounded-xl flex items-center justify-center text-[#00f2fe] shrink-0">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Predictive Horizon</span>
                <p className="text-sm font-extrabold text-slate-200 mt-0.5">4-Hour Lead Window</p>
                <p className="text-[10px] text-slate-400 font-medium">Early interventions offset clinical degradation.</p>
              </div>
            </div>

            <div className="bg-[#171b28]/60 backdrop-blur-xl p-5 rounded-xl border border-white/5 flex gap-4 items-center">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Multivariate Neural Classifier</span>
                <p className="text-sm font-extrabold text-slate-200 mt-0.5">ResNet-LSTM Architecture</p>
                <p className="text-[10px] text-slate-400 font-medium">96.4% Area Under ROC curve accuracy.</p>
              </div>
            </div>

            <div className="bg-[#171b28]/60 backdrop-blur-xl p-5 rounded-xl border border-white/5 flex gap-4 items-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Ward Stability State</span>
                <p className="text-sm font-extrabold text-slate-200 mt-0.5">Stable Baseline</p>
                <p className="text-[10px] text-slate-400 font-medium">No impending arrest warnings detected.</p>
              </div>
            </div>
          </div>

          {/* Recharts Plots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deterioration vs Stability */}
            <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-4">
              <span className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase block flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Ward Deterioration Risk Comparison
              </span>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientRiskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Deterioration %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Shock Prediction %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Stability %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Impending Risk Forecast Trends */}
            <div className="bg-[#171b28]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 space-y-4">
              <span className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase block flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> 12-Hour Critical Risk Projections
              </span>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockForecastingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="avgRisk" stroke="#00f2fe" strokeWidth={2.5} name="Avg Ward Risk" dot={{ fill: '#00f2fe' }} />
                    <Line type="monotone" dataKey="sepsisRisk" stroke="#a855f7" strokeWidth={2} name="Sepsis Risk Index" dot={{ fill: '#a855f7' }} />
                    <Line type="monotone" dataKey="shockProb" stroke="#ef4444" strokeWidth={2} name="Shock Risk Index" dot={{ fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Neural classifier parameters brief */}
          <div className="bg-slate-950/80 p-6 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00f2fe]" /> Multivariate Biomarker Vectors
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-400">
              <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <span className="font-bold text-slate-200 block mb-2 uppercase">Ventilation Sync</span>
                Telemetry analyzes tidal volume variance, respirations, and hypoxia gradients to determine acute lung distress.
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <span className="font-bold text-slate-200 block mb-2 uppercase">Hemodynamic Vector</span>
                Correlates Systolic pressure drop against tachycardic heart rate escalation for septic shock prediction.
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <span className="font-bold text-slate-200 block mb-2 uppercase">Thermal Spike Log</span>
                Tracks temperature gradient drift matching fever spikes to filter benign occurrences from infectious sepsis.
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <span className="font-bold text-slate-200 block mb-2 uppercase">Heart Rate Var (HRV)</span>
                Integrates QRS complex wave spacing fluctuations to alert on impending atrial or ventricular cardiac incidents.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
