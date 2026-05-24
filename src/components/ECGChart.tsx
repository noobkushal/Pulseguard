import React, { useEffect, useRef } from 'react';

interface ECGChartProps {
  bpm: number;
  isCritical?: boolean;
  isDisconnected?: boolean;
}

export const ECGChart: React.FC<ECGChartProps> = ({ bpm, isCritical = false, isDisconnected = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.parentElement?.clientWidth || 800;
    let height = canvas.height = 180;

    // Handle resize
    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 180;
      }
    };
    window.addEventListener('resize', handleResize);

    // ECG wave calculation parameters
    // Normal sinus: P wave, PR interval, QRS complex, ST segment, T wave
    const points: number[] = [];

    // We keep track of the current drawing index
    let step = 0;
    
    // Draw loop
    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear with trailing opacity for glow effect
      ctx.fillStyle = 'rgba(15, 19, 31, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw gridlines (ICU monitor style)
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
      ctx.lineWidth = 0.5;

      const gridSize = 20;
      const subGridSize = 4;

      // Vertical lines
      for (let i = 0; i < width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 0; i < height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Fine gridlines
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.015)';
      for (let i = 0; i < width; i += subGridSize) {
        if (i % gridSize !== 0) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }
      }
      for (let i = 0; i < height; i += subGridSize) {
        if (i % gridSize !== 0) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(width, i);
          ctx.stroke();
        }
      }

      // Generate ECG shape based on BPM
      // The wave repeats. At 60BPM, it's 1 wave per second.
      // Assuming 60fps, we have 60 frames per wave.
      // At higher BPM, we have fewer frames per wave.
      const framesPerBeat = Math.round((60 * 60) / bpm);
      const beatProgress = step % framesPerBeat;

      let yVal = height / 2;

      if (isDisconnected) {
        // Flatline with tiny sensor noise
        yVal += Math.random() * 1.5 - 0.75;
      } else {
        // Construct ECG components
        // P-wave
        if (beatProgress >= 0 && beatProgress < 8) {
          const t = beatProgress / 8;
          yVal -= Math.sin(t * Math.PI) * 8; // Small bump
        }
        // PR segment: flatline (yVal remains height / 2)
        // Q-wave (downwards)
        else if (beatProgress >= 12 && beatProgress < 15) {
          const t = (beatProgress - 12) / 3;
          yVal += t * 10;
        }
        // R-wave (massive spike upwards)
        else if (beatProgress >= 15 && beatProgress < 19) {
          const t = (beatProgress - 15) / 4;
          yVal -= Math.sin(t * Math.PI) * 70;
        }
        // S-wave (spike downwards)
        else if (beatProgress >= 19 && beatProgress < 23) {
          const t = (beatProgress - 19) / 4;
          yVal += Math.sin(t * Math.PI) * 22;
        }
        // ST segment: flatline
        // T-wave (larger bump)
        else if (beatProgress >= 30 && beatProgress < 44) {
          const t = (beatProgress - 30) / 14;
          yVal -= Math.sin(t * Math.PI) * 14;
        }
        // Rest segment: noise
        else {
          yVal += Math.random() * 0.8 - 0.4;
        }
      }

      // Store point
      points.push(yVal);
      if (points.length > width) {
        points.shift();
      }

      // Draw the wave path
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Color
      if (isDisconnected) {
        ctx.strokeStyle = '#64748b'; // Slate gray for disconnected
        ctx.shadowBlur = 0;
      } else if (isCritical) {
        ctx.strokeStyle = '#ff0055'; // Neon Red for critical
        ctx.shadowColor = 'rgba(255, 0, 85, 0.5)';
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = '#00f2fe'; // Neon Cyan for normal
        ctx.shadowColor = 'rgba(0, 242, 254, 0.5)';
        ctx.shadowBlur = 8;
      }

      for (let i = 0; i < points.length; i++) {
        if (i === 0) {
          ctx.moveTo(i, points[i]);
        } else {
          ctx.lineTo(i, points[i]);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Draw active lead sweep dot
      if (points.length > 0) {
        const lastX = points.length - 1;
        const lastY = points[lastX];
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = isDisconnected ? '#94a3b8' : isCritical ? '#ff3377' : '#33f5ff';
        ctx.fill();
      }

      step++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [bpm, isCritical, isDisconnected]);

  return (
    <div className="relative w-full h-[180px] bg-[#0c101d] rounded-lg border border-white/5 overflow-hidden shadow-inner">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      
      {/* Decorative ECG Sweep overlay */}
      <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-[#0f131f]/20 to-[#0f131f] pointer-events-none opacity-40"></div>
      
      {/* Small Lead label */}
      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-cyan-400 border border-cyan-500/20">
        LEAD II (25mm/s)
      </div>
    </div>
  );
};
