import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff, Brain, Radio, Fingerprint, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      navigate('/dashboard');
    } else {
      setErrorMessage('Invalid biometric token or security key credentials.');
    }
  };

  const handleBiometricScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setErrorMessage('');

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/dashboard');
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Scanline Animation overlay */}
      <div className="scanline pointer-events-none"></div>

      {/* Cyberpunk background glow grids */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f2fe]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel-glow border border-cyan-500/25 p-8 rounded-2xl relative z-10 space-y-6 shadow-[0_0_50px_rgba(0,242,254,0.1)]">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <ShieldAlert className="w-8 h-8 text-[#00f2fe] drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]" />
            <span className="font-extrabold text-lg tracking-wider text-slate-100 uppercase">PulseGuard <span className="text-[#00f2fe]">AI</span></span>
          </div>
          <p className="text-[10px] tracking-widest text-[#00f2fe] uppercase font-bold">Secured ICU Surveillance Portal</p>
        </div>

        {isScanning ? (
          /* Biometric scan interface */
          <div className="text-center py-8 space-y-6">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer rotating pulse */}
              <div className="absolute inset-[-10px] rounded-full border border-cyan-500/30 animate-spin border-dashed"></div>
              
              <div className="w-24 h-24 rounded-full bg-[#0d1426] border-2 border-cyan-400/60 flex items-center justify-center text-cyan-400 relative overflow-hidden shadow-[0_0_30px_rgba(0,242,254,0.2)]">
                {/* Fingerprint icon */}
                <Fingerprint className="w-12 h-12 animate-pulse" />
                
                {/* Scanning green line sweeping */}
                <div 
                  className="absolute left-0 right-0 h-1 bg-cyan-400/80 shadow-[0_0_8px_#00f2fe] transition-all duration-300"
                  style={{ top: `${scanProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Biometric Verification Sweeping...</p>
              <div className="max-w-[180px] mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#00f2fe] transition-all duration-150" style={{ width: `${scanProgress}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">{scanProgress}% SECURED TUNNEL AUTHENTICATED</p>
            </div>
          </div>
        ) : (
          /* Credentials input form */
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg font-bold text-center">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secured User ID</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-[#0a0e1a] text-slate-100 placeholder-slate-500 border border-white/10 focus:border-[#00f2fe] rounded-lg px-4 py-2.5 text-xs focus:outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authentication Passkey</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="e.g. password"
                  className="w-full bg-[#0a0e1a] text-slate-100 placeholder-slate-500 border border-white/10 focus:border-[#00f2fe] rounded-lg px-4 py-2.5 pr-10 text-xs focus:outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#00f2fe] hover:bg-[#00dbe7] text-[#030712] font-black rounded-lg text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(0,242,254,0.15)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Unlock Console Gateway
              </button>
            </div>

            {/* Cyberpunk finger print gate bypass */}
            <div className="border-t border-white/5 pt-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Or Scan Biometrics</p>
              <button
                type="button"
                onClick={handleBiometricScan}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-[#00f2fe]/30 rounded-lg text-[10px] font-bold text-slate-300 hover:text-[#00f2fe] uppercase tracking-wider transition-all cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" /> Scan Fingerprint
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-white/5 pt-4">
          <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5 text-cyan-400" /> AI Decent. Gate</span>
          <span className="flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-rose-400" /> AES-256 Link</span>
        </div>
      </div>
    </div>
  );
};
