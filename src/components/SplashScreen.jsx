import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

export function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'hold' | 'exit'

  useEffect(() => {
    // Phase sequence: enter (600ms) → hold (1000ms) → exit (500ms) → done
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 1600);
    const t3 = setTimeout(() => onDone(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 50%, #0A0F1E 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.5s ease-out' : 'opacity 0.4s ease-in',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Ambient glow blobs */}
      <div
        style={{
          position: 'absolute', top: '15%', left: '20%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          transform: phase === 'enter' ? 'scale(0.5)' : 'scale(1)',
          transition: 'transform 0.8s ease-out',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '20%', right: '15%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          transform: phase === 'enter' ? 'scale(0.3)' : 'scale(1)',
          transition: 'transform 1s ease-out 0.2s',
        }}
      />

      {/* Logo block */}
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          transform: phase === 'enter' ? 'scale(0.7) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out',
        }}
      >
        {/* Icon container */}
        <div
          style={{
            width: '88px', height: '88px',
            background: 'linear-gradient(135deg, #F5A623 0%, #F59E0B 60%, #FBBF24 100%)',
            borderRadius: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(245,166,35,0.45), 0 0 0 1px rgba(245,166,35,0.15)',
          }}
        >
          <TrendingUp size={40} strokeWidth={2.5} color="#0A0F1E" />
        </div>

        {/* App name */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '36px', fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Pay<span style={{ color: '#F5A623' }}>Trix</span>
          </h1>
          <p
            style={{
              marginTop: '8px',
              fontSize: '13px', fontWeight: 500,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Smart Expense Tracker
          </p>
        </div>
      </div>

      {/* Animated loading dots */}
      <div
        style={{
          position: 'absolute', bottom: '60px',
          display: 'flex', gap: '8px', alignItems: 'center',
          opacity: phase === 'hold' ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#F5A623',
              animation: 'splashPulse 1s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
