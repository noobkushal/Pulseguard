import React from 'react';

interface RiskGaugeProps {
  percentage: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ 
  percentage, 
  label = 'AI DETERIORATION RISK',
  size = 'md' 
}) => {
  const getStrokeColor = () => {
    if (percentage > 60) return 'text-rose-500';
    if (percentage > 25) return 'text-amber-500';
    return 'text-[#00f2fe]';
  };

  const getGlowFilter = () => {
    if (percentage > 60) return 'rgba(239, 68, 68, 0.4)';
    if (percentage > 25) return 'rgba(245, 158, 11, 0.4)';
    return 'rgba(0, 242, 254, 0.4)';
  };

  const dimensions = {
    sm: { radius: 35, stroke: 6, box: 80, fontSize: 'text-lg', labelSize: 'text-[8px]' },
    md: { radius: 60, stroke: 8, box: 140, fontSize: 'text-3xl', labelSize: 'text-[10px]' },
    lg: { radius: 88, stroke: 10, box: 200, fontSize: 'text-5xl', labelSize: 'text-xs' }
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex justify-center items-center">
        <svg 
          width={dimensions.box} 
          height={dimensions.box} 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle 
            className="text-slate-800" 
            cx={dimensions.box / 2} 
            cy={dimensions.box / 2} 
            fill="transparent" 
            r={dimensions.radius} 
            stroke="currentColor" 
            strokeWidth={dimensions.stroke - 2} 
          />
          {/* Progress circle */}
          <circle 
            className={`transition-all duration-1000 ease-out ${getStrokeColor()}`}
            style={{ 
              filter: `drop-shadow(0 0 6px ${getGlowFilter()})`,
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset
            }}
            cx={dimensions.box / 2} 
            cy={dimensions.box / 2} 
            fill="transparent" 
            r={dimensions.radius} 
            stroke="currentColor" 
            strokeWidth={dimensions.stroke} 
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <span className={`${dimensions.fontSize} font-extrabold font-mono text-slate-100`}>
            {percentage}%
          </span>
          <p className={`${dimensions.labelSize} font-bold text-slate-400 uppercase tracking-widest mt-0.5`}>
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};
