import { useEffect, useState } from 'react';
import { Sun, Camera, Zap, Wrench, HardHat } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const steps = 100;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(onLoadingComplete, 600);
          }, 300);
          return 100;
        }
        return prev + 1;
      });
    }, stepDuration);

    const phaseTimer = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center transition-all duration-700 ${
        isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8 sm:mb-12 relative h-48 sm:h-64 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <svg viewBox="0 0 400 300" className="w-full h-auto">
                <defs>
                  <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <linearGradient id="cctvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                <g className={`transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                  <rect x="80" y="120" width="100" height="80" fill="url(#solarGradient)" opacity="0.3" rx="4" />
                  <rect x="85" y="125" width="90" height="35" fill="url(#solarGradient)" opacity="0.6" rx="2" />
                  <rect x="85" y="163" width="90" height="35" fill="url(#solarGradient)" opacity="0.6" rx="2" />
                  <line x1="90" y1="130" x2="170" y2="130" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                  <line x1="90" y1="138" x2="170" y2="138" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                  <line x1="90" y1="146" x2="170" y2="146" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                  <line x1="90" y1="154" x2="170" y2="154" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                  <line x1="90" y1="168" x2="170" y2="168" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                  <line x1="90" y1="176" x2="170" y2="176" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                  <line x1="90" y1="184" x2="170" y2="184" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                  <line x1="90" y1="192" x2="170" y2="192" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                </g>

                <g className={`transition-all duration-500 ${animationPhase >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                  <circle cx="260" cy="140" r="25" fill="url(#cctvGradient)" opacity="0.3" />
                  <circle cx="260" cy="140" r="20" fill="url(#cctvGradient)" opacity="0.6" />
                  <circle cx="260" cy="140" r="8" fill="#0891b2" />
                  <line x1="260" y1="165" x2="260" y2="190" stroke="#06b6d4" strokeWidth="3" />
                  <rect x="250" y="190" width="20" height="8" fill="#06b6d4" rx="2" />
                </g>

                <g className={`transition-all duration-500 transform origin-center ${animationPhase >= 1 ? 'translate-y-0' : 'translate-y-20'}`}>
                  <circle cx="130" cy="240" r="20" fill="#fbbf24" opacity="0.3" />
                  <circle cx="130" cy="240" r="15" fill="#f97316" />
                  <circle cx="127" cy="237" r="4" fill="#fef3c7" />
                </g>

                <g className={`transition-all duration-500 ${animationPhase % 2 === 0 ? 'opacity-100' : 'opacity-60'}`}>
                  <line x1="130" y1="200" x2="130" y2="220" stroke="#fbbf24" strokeWidth="2" strokeDasharray="2,2">
                    <animate attributeName="stroke-dashoffset" from="0" to="4" dur="0.5s" repeatCount="indefinite" />
                  </line>
                  <line x1="230" y1="180" x2="260" y2="165" stroke="#06b6d4" strokeWidth="2" strokeDasharray="2,2">
                    <animate attributeName="stroke-dashoffset" from="0" to="4" dur="0.5s" repeatCount="indefinite" />
                  </line>
                </g>

                <g className={`transition-all duration-500 transform ${animationPhase >= 3 ? 'scale-100' : 'scale-75'}`}>
                  <circle cx="200" cy="260" r="12" fill="#94a3b8" />
                  <rect x="195" y="240" width="10" height="20" fill="#64748b" rx="2" />
                  <circle cx="200" cy="235" r="8" fill="#f59e0b" />
                  <line x1="188" y1="255" x2="180" y2="265" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                  <line x1="212" y1="255" x2="220" y2="265" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                </g>

                <g className="animate-pulse">
                  <circle cx="200" cy="50" r="30" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.3">
                    <animate attributeName="r" from="25" to="35" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="200" cy="50" r="25" fill="url(#solarGradient)" opacity="0.8" />
                  <polygon points="200,40 205,48 213,50 206,55 208,63 200,58 192,63 194,55 187,50 195,48" fill="#fef3c7" />
                </g>
              </svg>
            </div>
          </div>

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <HardHat className={`w-8 h-8 text-amber-500 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
          </div>

          <div className="absolute bottom-4 right-1/4">
            <Wrench className={`w-6 h-6 text-orange-500 transition-all duration-500 ${animationPhase >= 2 ? 'opacity-100 rotate-45' : 'opacity-0 rotate-0'}`} />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3">
          <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Aadya Enterprises
          </span>
        </h1>

        <div className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            CCTV & Solar Solutions
          </span>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-8 sm:mb-12">
          <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-amber-500"></div>
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 animate-pulse" />
          <p className="text-xs sm:text-sm text-amber-500 font-medium tracking-wider">
            Installing Excellence
          </p>
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 animate-pulse" />
          <div className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent to-amber-500"></div>
        </div>

        <div className="max-w-md mx-auto px-4">
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse"></div>
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1s_infinite]"></div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {progress < 30 ? 'Preparing Tools...' : progress < 60 ? 'Installing Solar...' : progress < 90 ? 'Setting up CCTV...' : 'Almost Ready!'}
            </span>
            <span className="text-amber-500 font-bold">{progress}%</span>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
