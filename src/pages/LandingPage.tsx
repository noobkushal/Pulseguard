import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Heart, Cpu, Brain, Play, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
      {/* Cinematic Cyberpunk Glow Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f2fe]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-8 h-8 text-[#00f2fe] drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]" />
          <span className="font-extrabold text-xl tracking-wider text-slate-100 uppercase">PULSEGUARD <span className="text-[#00f2fe]">AI</span></span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 bg-white/5 hover:bg-cyan-500/10 text-slate-200 hover:text-[#00f2fe] rounded-lg border border-white/10 hover:border-[#00f2fe]/30 text-xs font-bold font-mono tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            Launch Command Console <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-20 relative z-10 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00f2fe] text-[10px] font-bold font-mono uppercase tracking-widest mb-6">
          <Zap className="w-3 h-3 text-[#00f2fe] animate-pulse" /> Next-Generation ICU Biomarker Telemetry
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-100 to-cyan-400 mb-6 uppercase leading-tight font-headline">
          Predict Clinical Deterioration <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-blue-400">Before It Occurs</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          An intelligent IoT-enabled pipeline translating raw vital sign telemetry into real-time neural risk scores, helping clinical teams intercept cardiac arrest, sepsis, and shock 4 hours ahead.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-[#00f2fe] hover:bg-[#00dbe7] text-[#030712] font-black rounded-lg text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:shadow-[0_0_35px_rgba(0,242,254,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Enter ICU Control Center
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-lg border border-white/10 text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
          >
            Secured Access Portal
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-6 py-12 relative z-10 border-t border-white/5 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold font-mono tracking-widest text-[#00f2fe] uppercase">System Architecture</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-200 mt-2">Engineered for High-Acuity ICU Wards</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#171b28]/40 border border-white/5 rounded-2xl p-6 hover:border-[#00f2fe]/20 hover:shadow-[0_0_20px_rgba(0,242,254,0.05)] transition-all duration-300">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-[#00f2fe] mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-200 uppercase mb-3">IoT Telemetry Pipeline</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-body">
              Continuous biosync connections pulling ECG, blood pressure, SpO2, respiration, and core temperature updates directly from wireless bed sensors.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#171b28]/40 border border-white/5 rounded-2xl p-6 hover:border-[#00f2fe]/20 hover:shadow-[0_0_20px_rgba(0,242,254,0.05)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#00f2fe]/10 border border-[#00f2fe]/20 rounded-xl flex items-center justify-center text-[#00f2fe] mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-200 uppercase mb-3">Neural Risk Classifier</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-body">
              State-of-the-art predictive ML modules analyzing multivariate patterns of deterioration, predicting hemodynamic shock, and score stability indices.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#171b28]/40 border border-white/5 rounded-2xl p-6 hover:border-[#00f2fe]/20 hover:shadow-[0_0_20px_rgba(0,242,254,0.05)] transition-all duration-300">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-200 uppercase mb-3">Clinical Action Hub</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-body">
              Immediate Code Red warning alerts, triage classification tags, audible sirens, and integrated diagnostic history logs to orchestrate swift bedside response.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Specifications */}
      <section className="container mx-auto px-6 py-12 relative z-10 max-w-5xl">
        <div className="bg-[#0b0e17]/60 border border-white/5 rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-extrabold uppercase text-slate-100">Live Biosync Analytics & Visualization</h3>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed font-body">
                Integrated Recharts modules plot real-time patient status logs. High-performance HTML5 canvas renderers stream medical-grade ECG waveforms dynamically.
              </p>
              
              <ul className="mt-6 space-y-3">
                {[
                  'Lead II ECG sweep simulation (25mm/s)',
                  'Sepsis & shock probability matrix',
                  'Multivariate clinical threshold triggers',
                  'Dynamic device status & offline fail-safes'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#00f2fe] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative bg-slate-950/80 rounded-xl border border-white/5 p-6 flex flex-col gap-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[10px] text-[#00f2fe] font-mono tracking-widest uppercase">Telemetry Feed</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold animate-pulse">CRITICAL</span>
              </div>
              <div className="h-10 w-full flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold font-mono">HR</p>
                  <p className="text-base font-extrabold font-mono text-slate-100">138 <span className="text-[10px] text-slate-500 font-mono">BPM</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold font-mono">SPO2</p>
                  <p className="text-base font-extrabold font-mono text-slate-100">82% <span className="text-[10px] text-slate-500 font-mono">SpO2</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold font-mono">BP</p>
                  <p className="text-base font-extrabold font-mono text-slate-100">85/50 <span className="text-[10px] text-slate-500 font-mono">mmHg</span></p>
                </div>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-rose-500" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[9px] text-rose-400/80 font-mono text-right uppercase font-bold tracking-wider">Neural Risk probability: 85%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-[10px] font-mono text-slate-500 relative z-10">
        <p>© 2026 PulseGuard AI Platforms. Built for clinical and ICU research monitoring.</p>
        <p className="mt-1 text-slate-600">Inspired by Shopify Ride futuristic healthcare aesthetic.</p>
      </footer>
    </div>
  );
};
